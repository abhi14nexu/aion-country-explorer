import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllCountries, getCountryByCode, getCountriesByCodes, isValidCountryCode } from '@/lib/api';
import { Country } from '@/types/country';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import CountryDetailClient from './CountryDetailClient';

interface CountryPageProps {
  params: { id: string };
}

// Generate static params for all countries at build time
export async function generateStaticParams() {
  try {
    const countries = await getAllCountries();
    
    return countries.map((country) => ({
      id: country.cca2.toLowerCase(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    // Return empty array if we can't fetch countries
    return [];
  }
}

// Generate metadata for each country page
export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  try {
    const countryCode = params.id;
    
    if (!isValidCountryCode(countryCode)) {
      return {
        title: 'Country Not Found - Aion Country Explorer',
        description: 'The requested country could not be found.',
      };
    }

    const country = await getCountryByCode(countryCode);
    
    return {
      title: `${country.name.common} - Aion Country Explorer`,
      description: `Explore detailed information about ${country.name.common}, including population, capital, languages, currencies, and more.`,
      keywords: [
        country.name.common,
        country.name.official,
        country.region,
        country.subregion,
        'country information',
        'geography',
        'demographics'
      ].filter(Boolean).join(', '),
      openGraph: {
        title: `${country.name.common} - Country Information`,
        description: `Learn about ${country.name.common}: Population ${country.population?.toLocaleString()}, Region: ${country.region}`,
        images: [
          {
            url: country.flags.png,
            width: 400,
            height: 300,
            alt: `Flag of ${country.name.common}`,
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Country Not Found - Aion Country Explorer',
      description: 'The requested country could not be found.',
    };
  }
}

// Server component for fetching data
export default async function CountryPage({ params }: CountryPageProps) {
  const countryCode = params.id;

  // Validate country code format
  if (!isValidCountryCode(countryCode)) {
    notFound();
  }

  try {
    // Fetch country data and border countries in parallel
    const [country, borderCountries] = await Promise.allSettled([
      getCountryByCode(countryCode),
      // Fetch border countries if they exist
      getCountryByCode(countryCode).then(async (country) => {
        if (country.borders && country.borders.length > 0) {
          return getCountriesByCodes(country.borders);
        }
        return [];
      })
    ]);

    // Handle country fetch result
    if (country.status === 'rejected') {
      console.error('Failed to fetch country:', country.reason);
      notFound();
    }

    // Handle border countries (non-critical)
    const borders = borderCountries.status === 'fulfilled' ? borderCountries.value : [];

    return (
      <ErrorBoundary
        showDetails={process.env.NODE_ENV === 'development'}
      >
        <ProtectedRoute>
          <CountryDetailClient 
            country={country.value} 
            borderCountries={borders}
          />
        </ProtectedRoute>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Unexpected error in country page:', error);
    notFound();
  }
} 