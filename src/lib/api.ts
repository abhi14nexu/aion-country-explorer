import { CountryBasic, Country } from '@/types/country';
import { countryBasicSchema, countryDetailSchema } from '@/lib/validation';

const REST_COUNTRIES_BASE_URL = 'https://restcountries.com/v3.1';

/**
 * Fetch all countries with basic information for the homepage
 * Uses static generation (SSG) at build time
 */
export async function getAllCountries(): Promise<CountryBasic[]> {
  try {
    const response = await fetch(
      `${REST_COUNTRIES_BASE_URL}/all?fields=cca2,name,flags,population,region,capital`,
      {
        // Enable caching for build-time generation
        cache: 'force-cache',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.status}`);
    }

    const data = await response.json();

    // Validate and transform the data using Zod
    const validatedCountries = data
      .map((country: unknown) => {
        try {
          return countryBasicSchema.parse(country);
        } catch (error) {
          console.warn(`Skipping invalid country data:`, error);
          return null;
        }
      })
      .filter((country: CountryBasic | null): country is CountryBasic => country !== null);

    return validatedCountries;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw new Error('Failed to fetch countries data');
  }
}

/**
 * Fetch detailed information for a specific country by code
 * Used for country detail pages
 */
export async function getCountryByCode(code: string): Promise<Country | null> {
  try {
    const response = await fetch(
      `${REST_COUNTRIES_BASE_URL}/alpha/${code}`,
      {
        cache: 'force-cache',
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch country: ${response.status}`);
    }

    const data = await response.json();
    
    // The API returns an array even for single country
    const countryData = Array.isArray(data) ? data[0] : data;
    
    // Validate the detailed country data
    const validatedCountry = countryDetailSchema.parse(countryData);
    
    return validatedCountry;
  } catch (error) {
    console.error(`Error fetching country ${code}:`, error);
    return null;
  }
} 