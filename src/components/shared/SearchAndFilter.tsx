'use client';

import React, { useCallback } from 'react';

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  sortBy: 'name' | 'population' | 'area';
  setSortBy: (sort: 'name' | 'population' | 'area') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  availableRegions: string[];
  totalCountries: number;
  filteredCount: number;
  debouncedSearchTerm: string;
  isSearching: boolean;
  hasActiveSearch: boolean;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  setSearchTerm,
  selectedRegion,
  setSelectedRegion,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  availableRegions,
  totalCountries,
  filteredCount,
  debouncedSearchTerm,
  isSearching,
  hasActiveSearch,
}) => {
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSelectedRegion('');
  }, [setSearchTerm, setSelectedRegion]);

  // Clear only search term
  const clearSearchTerm = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  // Clear only region filter
  const clearRegionFilter = useCallback(() => {
    setSelectedRegion('');
  }, [setSelectedRegion]);

  // Handle sort change
  const handleSortChange = useCallback((newSortBy: 'name' | 'population' | 'area') => {
    if (sortBy === newSortBy) {
      // Toggle order if same sort field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field with ascending order
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder, setSortBy, setSortOrder]);

  return (
    <div className="mb-8">
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search countries by name, capital, or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-gray-100 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={clearSearchTerm}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {isSearching && (
              <div className="absolute inset-y-0 right-8 flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Region Filter */}
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-gray-100 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
            >
              <option value="">All Regions</option>
              {availableRegions.map(region => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {selectedRegion && (
              <button
                onClick={clearRegionFilter}
                className="absolute inset-y-0 right-8 flex items-center text-gray-400 hover:text-gray-600"
                title="Clear region filter"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSortChange('name')}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                sortBy === 'name'
                  ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800'
              }`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('population')}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                sortBy === 'population'
                  ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800'
              }`}
            >
              Population {sortBy === 'population' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>

          {/* Clear All Filters */}
          {(hasActiveSearch || selectedRegion) && (
            <button
              onClick={clearSearch}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex flex-wrap items-center justify-between mb-6 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex flex-wrap items-center gap-4">
            <span>
              Showing {filteredCount} of {totalCountries} countries
              {isSearching && <span className="text-blue-600 ml-1">(searching...)</span>}
            </span>
            
            {/* Active Filters */}
            <div className="flex flex-wrap gap-2">
              {hasActiveSearch && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded dark:bg-blue-900 dark:text-blue-200">
                  Search: &quot;{debouncedSearchTerm}&quot;
                  <button
                    onClick={clearSearchTerm}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedRegion && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded dark:bg-green-900 dark:text-green-200">
                  Region: {selectedRegion}
                  <button
                    onClick={clearRegionFilter}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Sort Indicator */}
          <div className="text-xs text-gray-500">
            Sorted by {sortBy} ({sortOrder === 'asc' ? 'ascending' : 'descending'})
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter; 