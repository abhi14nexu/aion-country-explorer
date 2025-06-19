'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { CountryBasic } from '@/types/country';
import CountryCard from './CountryCard';
import SearchAndFilter from './SearchAndFilter';
import { useDebouncedSearch } from '@/hooks/useDebounce';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface CountryListContainerProps {
  countries: CountryBasic[];
}

// Get unique regions from countries
const getUniqueRegions = (countries: CountryBasic[]): string[] => {
  const regions = new Set<string>();
  countries.forEach(country => {
    if (country.region) {
      regions.add(country.region);
    }
  });
  return Array.from(regions).sort();
};

export default function CountryListContainer({ countries }: CountryListContainerProps) {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'population' | 'area'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Debounced search for better performance
  const { debouncedSearchTerm, isSearching, hasActiveSearch } = useDebouncedSearch(searchTerm, 300);

  // Get unique regions for filter dropdown
  const availableRegions = useMemo(() => getUniqueRegions(countries), [countries]);

  // Filter and sort countries
  const filteredAndSortedCountries = useMemo(() => {
    const filtered = countries.filter(country => {
      // Region filter
      const matchesRegion = selectedRegion === '' || country.region === selectedRegion;
      
      // Search filter (name, capital, region)
      const matchesSearch = !debouncedSearchTerm.trim() || (
        country.name.common.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        country.name.official.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (country.capital && country.capital.some(cap => 
          cap.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )) ||
        country.region.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      
      return matchesRegion && matchesSearch;
    });

    // Sort countries
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.common.localeCompare(b.name.common);
          break;
        case 'population':
          comparison = a.population - b.population;
          break;
        case 'area':
          // Note: area not available in basic country data, fallback to population
          comparison = a.population - b.population;
          break;
        default:
          comparison = a.name.common.localeCompare(b.name.common);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [countries, selectedRegion, debouncedSearchTerm, sortBy, sortOrder]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedRegion('');
  }, []);

  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error) => {
        console.error('Country list error:', error);
      }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 dark:text-gray-100">
            Explore Countries Around the World
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            Discover detailed information about {countries.length} countries, including population, 
            regions, capitals, and more. Use the search and filters below to find specific countries.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <SearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          availableRegions={availableRegions}
          totalCountries={countries.length}
          filteredCount={filteredAndSortedCountries.length}
          debouncedSearchTerm={debouncedSearchTerm}
          isSearching={isSearching}
          hasActiveSearch={hasActiveSearch}
        />

        {/* No Results */}
        {filteredAndSortedCountries.length === 0 && !isSearching && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2 dark:text-gray-100">
              No countries found
            </h3>
            <p className="text-gray-600 mb-6 dark:text-gray-300">
              Try adjusting your search terms or filters to find what you&apos;re looking for.
            </p>
            <button
              onClick={clearAllFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Countries Grid */}
        {filteredAndSortedCountries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedCountries.map((country, index) => (
              <div key={country.cca2}>
                <CountryCard 
                  country={country}
                  priority={index < 8} // Priority for first 8 cards
                />
              </div>
            ))}
          </div>
        )}

        {/* Loading State for Search */}
        {isSearching && filteredAndSortedCountries.length === 0 && (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Searching countries...</p>
          </div>
        )}

        {/* Footer Stats */}
        {filteredAndSortedCountries.length > 0 && (
          <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-neutral-900">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {filteredAndSortedCountries.length}
                </div>
                <div className="text-sm">Countries Shown</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-neutral-900">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {new Set(filteredAndSortedCountries.map(c => c.region)).size}
                </div>
                <div className="text-sm">Regions</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-neutral-900">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(filteredAndSortedCountries.reduce((sum, country) => sum + country.population, 0) / 1000000)}M
                </div>
                <div className="text-sm">Total Population</div>
              </div>
            </div>
            
            <p className="mt-6 text-xs">
              Data provided by REST Countries API • 
              Showing results for {hasActiveSearch || selectedRegion ? 'filtered' : 'all'} countries
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
} 