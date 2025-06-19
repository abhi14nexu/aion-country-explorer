import { CountryBasic } from '@/types/country';
import { 
  safeValidateCountryBasic,
  safeValidateCountryDetail,
  type CountryDetailType
} from '@/lib/validation';

const REST_COUNTRIES_API = 'https://restcountries.com/v3.1';

// API error types
export class CountryAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'CountryAPIError';
  }
}

// Generic fetch wrapper with error handling
async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache for 24 hours
      ...options,
    });

    if (!response.ok) {
      throw new CountryAPIError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        'HTTP_ERROR'
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof CountryAPIError) {
      throw error;
    }
    
    console.error('API fetch error:', error);
    throw new CountryAPIError(
      'Failed to fetch data from REST Countries API',
      0,
      'FETCH_ERROR'
    );
  }
}

/**
 * Get all countries with basic information
 * Uses SSG with 24-hour revalidation
 */
export async function getAllCountries(): Promise<CountryBasic[]> {
  try {
    const url = `${REST_COUNTRIES_API}/all?fields=name,cca2,cca3,region,population,flags,capital`;
    const data = await fetchWithErrorHandling<unknown[]>(url, {
      cache: 'force-cache', // Use SSG
    });

    // Validate and transform each country
    const validatedCountries: CountryBasic[] = [];
    
    for (const item of data) {
      const result = safeValidateCountryBasic(item);
      
      if (result.success) {
        validatedCountries.push(result.data);
      } else {
        console.warn('Invalid country data:', item, result.error);
      }
    }

    if (validatedCountries.length === 0) {
      throw new CountryAPIError(
        'No valid country data received',
        0,
        'VALIDATION_ERROR'
      );
    }

    return validatedCountries;
  } catch (error) {
    console.error('Error fetching all countries:', error);
    
    if (error instanceof CountryAPIError) {
      throw error;
    }
    
    throw new CountryAPIError(
      'Failed to load countries data',
      0,
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Get detailed country information by country code
 * Uses SSG with 24-hour revalidation for optimal performance
 */
export async function getCountryByCode(code: string): Promise<CountryDetailType> {
  if (!code || typeof code !== 'string') {
    throw new CountryAPIError(
      'Invalid country code provided',
      400,
      'INVALID_CODE'
    );
  }

  try {
    const normalizedCode = code.toLowerCase().trim();
    const url = `${REST_COUNTRIES_API}/alpha/${normalizedCode}`;
    
    const data = await fetchWithErrorHandling<unknown[]>(url, {
      cache: 'force-cache', // Use SSG
    });

    if (!Array.isArray(data) || data.length === 0) {
      throw new CountryAPIError(
        `Country with code "${code}" not found`,
        404,
        'COUNTRY_NOT_FOUND'
      );
    }

    const countryData = data[0];
    const result = safeValidateCountryDetail(countryData);

    if (!result.success) {
      console.error('Country validation failed:', result.error);
      throw new CountryAPIError(
        'Invalid country data received from API',
        500,
        'VALIDATION_ERROR'
      );
    }

    return result.data;
  } catch (error) {
    console.error(`Error fetching country ${code}:`, error);
    
    if (error instanceof CountryAPIError) {
      throw error;
    }
    
    throw new CountryAPIError(
      `Failed to load country information for "${code}"`,
      0,
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Get multiple countries by their codes
 * Useful for fetching border countries
 */
export async function getCountriesByCodes(codes: string[]): Promise<CountryDetailType[]> {
  if (!Array.isArray(codes) || codes.length === 0) {
    return [];
  }

  try {
    const validCodes = codes.filter(code => 
      typeof code === 'string' && code.trim().length > 0
    );

    if (validCodes.length === 0) {
      return [];
    }

    const codesParam = validCodes.map(code => code.toLowerCase()).join(',');
    const url = `${REST_COUNTRIES_API}/alpha?codes=${codesParam}`;
    
    const data = await fetchWithErrorHandling<unknown[]>(url);

    if (!Array.isArray(data)) {
      return [];
    }

    // Validate and transform each country
    const validatedCountries: CountryDetailType[] = [];
    
    for (const item of data) {
      const result = safeValidateCountryDetail(item);
      
      if (result.success) {
        validatedCountries.push(result.data);
      } else {
        console.warn('Invalid border country data:', item, result.error);
      }
    }

    return validatedCountries;
  } catch (error) {
    console.error('Error fetching countries by codes:', error);
    return []; // Return empty array instead of throwing for border countries
  }
}

/**
 * Search countries by name
 * Uses debounced search for better performance
 */
export async function searchCountriesByName(name: string): Promise<CountryBasic[]> {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return [];
  }

  try {
    const trimmedName = name.trim();
    const url = `${REST_COUNTRIES_API}/name/${encodeURIComponent(trimmedName)}?fields=name,cca2,cca3,region,population,flags,capital`;
    
    const data = await fetchWithErrorHandling<unknown[]>(url);

    if (!Array.isArray(data)) {
      return [];
    }

    // Validate and transform each country
    const validatedCountries: CountryBasic[] = [];
    
    for (const item of data) {
      const result = safeValidateCountryBasic(item);
      
      if (result.success) {
        validatedCountries.push(result.data);
      }
    }

    return validatedCountries;
  } catch (error) {
    console.error(`Error searching countries by name "${name}":`, error);
    return []; // Return empty array for search failures
  }
}

/**
 * Get countries by region
 */
export async function getCountriesByRegion(region: string): Promise<CountryBasic[]> {
  if (!region || typeof region !== 'string') {
    return [];
  }

  try {
    const url = `${REST_COUNTRIES_API}/region/${encodeURIComponent(region)}?fields=name,cca2,cca3,region,population,flags,capital`;
    
    const data = await fetchWithErrorHandling<unknown[]>(url);

    if (!Array.isArray(data)) {
      return [];
    }

    // Validate and transform each country
    const validatedCountries: CountryBasic[] = [];
    
    for (const item of data) {
      const result = safeValidateCountryBasic(item);
      
      if (result.success) {
        validatedCountries.push(result.data);
      }
    }

    return validatedCountries;
  } catch (error) {
    console.error(`Error fetching countries by region "${region}":`, error);
    return [];
  }
}

/**
 * Get all available regions
 * Cached for better performance
 */
export async function getAvailableRegions(): Promise<string[]> {
  try {
    // Get all countries and extract unique regions
    const countries = await getAllCountries();
    const regions = new Set<string>();
    
    countries.forEach(country => {
      if (country.region) {
        regions.add(country.region);
      }
    });

    return Array.from(regions).sort();
  } catch (error) {
    console.error('Error fetching available regions:', error);
    // Return common regions as fallback
    return ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
  }
}

/**
 * Check if a country code is valid
 */
export function isValidCountryCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  const normalized = code.trim().toLowerCase();
  return normalized.length === 2 || normalized.length === 3;
} 