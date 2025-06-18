'use client';

import React, { useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Country } from '@/types/country';
import { FormattedCountryData } from '@/types/country';
import { useAppStore } from '@/store/appStore';
import { ComponentErrorBoundary } from '@/components/ui/ErrorBoundary';

interface CountryDetailClientProps {
  country: Country;
  borderCountries: Country[];
}

const CountryDetailClient: React.FC<CountryDetailClientProps> = ({
  country,
  borderCountries,
}) => {
  const router = useRouter();
  const { favorites, toggleFavorite, isAuthenticated } = useAppStore();

  const isFavorited = favorites.includes(country.cca2.toLowerCase());

  // Format country data for display
  const formattedData = useMemo((): FormattedCountryData => {
    // Basic information
    const basicInfo = {
      officialName: country.name.official || country.name.common,
      commonName: country.name.common,
      nativeNames: country.name.nativeName 
        ? Object.values(country.name.nativeName).map(name => name.common)
        : [],
      region: country.region,
      subregion: country.subregion || 'N/A',
      capital: country.capital?.join(', ') || 'No capital',
      population: country.population?.toLocaleString() || 'Unknown',
      area: country.area ? `${country.area.toLocaleString()} km²` : 'Unknown',
      independent: country.independent ?? false,
      unMember: country.unMember ?? false,
      landlocked: country.landlocked ?? false,
    };

    // Geography
    const geography = {
      coordinates: country.latlng 
        ? `${country.latlng[0]}°, ${country.latlng[1]}°`
        : 'Unknown',
      timezones: country.timezones || [],
      continents: country.continents || [],
      borders: country.borders || [],
      maps: {
        google: country.maps?.googleMaps,
        openStreetMap: country.maps?.openStreetMaps,
      },
    };

    // Culture
    const culture = {
      languages: country.languages 
        ? Object.values(country.languages)
        : [],
      currencies: country.currencies
        ? Object.entries(country.currencies).map(([code, currency]) => ({
            name: currency.name,
            symbol: currency.symbol || '',
            code,
          }))
        : [],
      demonyms: {
        male: country.demonyms?.eng?.m || 'Unknown',
        female: country.demonyms?.eng?.f || 'Unknown',
      },
      callingCodes: country.callingCodes || [],
      topLevelDomains: country.tld || [],
    };

    // Additional information
    const additional = {
      carSide: country.car?.side || 'Unknown',
      startOfWeek: country.startOfWeek || 'Unknown',
      fifaCode: country.fifa || 'N/A',
      giniIndex: country.gini 
        ? Object.entries(country.gini)
            .map(([year, value]) => `${value} (${year})`)
            .join(', ')
        : 'N/A',
      status: country.status || 'Unknown',
    };

    return {
      basicInfo,
      geography,
      culture,
      additional,
    };
  }, [country]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(() => {
    if (isAuthenticated) {
      toggleFavorite(country.cca2.toLowerCase());
    }
  }, [isAuthenticated, toggleFavorite, country.cca2]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="inline-flex items-center mb-6 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Countries
          </button>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Flag and Coat of Arms */}
            <div className="space-y-6">
              {/* Flag */}
              <ComponentErrorBoundary componentName="Flag Image">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="relative h-64 sm:h-80">
                    <Image
                      src={country.flags.png}
                      alt={country.flags.alt || `Flag of ${country.name.common}`}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-800">Flag of {country.name.common}</h3>
                    {country.flags.alt && (
                      <p className="text-sm text-gray-600 mt-1">{country.flags.alt}</p>
                    )}
                  </div>
                </div>
              </ComponentErrorBoundary>

              {/* Coat of Arms */}
              {country.coatOfArms?.png && (
                <ComponentErrorBoundary componentName="Coat of Arms">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="relative h-64">
                      <Image
                        src={country.coatOfArms.png}
                        alt={`Coat of Arms of ${country.name.common}`}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-semibold text-gray-800">Coat of Arms</h3>
                    </div>
                  </div>
                </ComponentErrorBoundary>
              )}
            </div>

            {/* Country Information */}
            <div className="space-y-6">
              {/* Header with Favorite */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {formattedData.basicInfo.commonName}
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">
                      {formattedData.basicInfo.officialName}
                    </p>
                    
                    {/* Native Names */}
                    {formattedData.basicInfo.nativeNames.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Native Names:</h3>
                        <div className="flex flex-wrap gap-2">
                          {formattedData.basicInfo.nativeNames.map((name, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={handleFavoriteToggle}
                    disabled={!isAuthenticated}
                    className={`ml-4 p-3 rounded-full transition-all duration-200 ${
                      isAuthenticated
                        ? 'hover:bg-red-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-300'
                        : 'cursor-not-allowed opacity-50'
                    }`}
                    title={isAuthenticated ? (isFavorited ? 'Remove from favorites' : 'Add to favorites') : 'Login to add favorites'}
                  >
                    <span className={`text-2xl ${
                      isFavorited && isAuthenticated 
                        ? 'text-red-500' 
                        : isAuthenticated 
                          ? 'text-gray-400 hover:text-red-400' 
                          : 'text-gray-300'
                    }`}>
                      {isFavorited && isAuthenticated ? '❤️' : '🤍'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem label="Region" value={formattedData.basicInfo.region} />
                  <InfoItem label="Subregion" value={formattedData.basicInfo.subregion} />
                  <InfoItem label="Capital" value={formattedData.basicInfo.capital} />
                  <InfoItem label="Population" value={formattedData.basicInfo.population} />
                  <InfoItem label="Area" value={formattedData.basicInfo.area} />
                  <InfoItem 
                    label="Status" 
                    value={
                      <div className="flex gap-2">
                        {formattedData.basicInfo.independent && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Independent</span>
                        )}
                        {formattedData.basicInfo.unMember && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">UN Member</span>
                        )}
                        {formattedData.basicInfo.landlocked && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Landlocked</span>
                        )}
                      </div>
                    }
                  />
                </div>
              </div>

              {/* Languages and Currencies */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Culture & Economy</h2>
                
                {/* Languages */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Languages:</h3>
                  <div className="flex flex-wrap gap-2">
                    {formattedData.culture.languages.map((language, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Currencies */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Currencies:</h3>
                  <div className="space-y-2">
                    {formattedData.culture.currencies.map((currency, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{currency.name}</span>
                        <span className="text-sm text-gray-600">
                          {currency.symbol} ({currency.code})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demonyms */}
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Male Demonym" value={formattedData.culture.demonyms.male} />
                  <InfoItem label="Female Demonym" value={formattedData.culture.demonyms.female} />
                </div>
              </div>
            </div>
          </div>

          {/* Geography Section */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Geography</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem label="Coordinates" value={formattedData.geography.coordinates} />
              <InfoItem 
                label="Continents" 
                value={formattedData.geography.continents.join(', ') || 'Unknown'} 
              />
              <InfoItem 
                label="Timezones" 
                value={formattedData.geography.timezones.slice(0, 3).join(', ') + 
                       (formattedData.geography.timezones.length > 3 ? '...' : '')} 
              />
            </div>

            {/* Maps */}
            {(formattedData.geography.maps.google || formattedData.geography.maps.openStreetMap) && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">View on Maps:</h3>
                <div className="flex gap-3">
                  {formattedData.geography.maps.google && (
                    <Link
                      href={formattedData.geography.maps.google}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                    >
                      Google Maps
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  )}
                  {formattedData.geography.maps.openStreetMap && (
                    <Link
                      href={formattedData.geography.maps.openStreetMap}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                    >
                      OpenStreetMap
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Border Countries */}
          {formattedData.geography.borders.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Border Countries ({formattedData.geography.borders.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {borderCountries.map((borderCountry) => (
                  <Link
                    key={borderCountry.cca2}
                    href={`/country/${borderCountry.cca2.toLowerCase()}`}
                    className="group block p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="text-center">
                      <div className="relative h-12 w-full mb-2">
                        <Image
                          src={borderCountry.flags.png}
                          alt={`Flag of ${borderCountry.name.common}`}
                          fill
                          className="object-cover rounded"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        />
                      </div>
                      <p className="text-xs font-medium text-gray-700 group-hover:text-blue-600 line-clamp-2">
                        {borderCountry.name.common}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem label="Driving Side" value={formattedData.additional.carSide} />
              <InfoItem label="Start of Week" value={formattedData.additional.startOfWeek} />
              <InfoItem label="FIFA Code" value={formattedData.additional.fifaCode} />
              <InfoItem label="Gini Index" value={formattedData.additional.giniIndex} />
              <InfoItem 
                label="Calling Codes" 
                value={formattedData.culture.callingCodes.map(code => `+${code}`).join(', ') || 'Unknown'} 
              />
              <InfoItem 
                label="Top Level Domains" 
                value={formattedData.culture.topLevelDomains.join(', ') || 'Unknown'} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for displaying information items
const InfoItem: React.FC<{ 
  label: string; 
  value: string | React.ReactNode; 
}> = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-sm font-semibold text-gray-700 mb-1">{label}:</dt>
    <dd className="text-sm text-gray-600 break-words">
      {typeof value === 'string' ? value : value}
    </dd>
  </div>
);

export default CountryDetailClient; 