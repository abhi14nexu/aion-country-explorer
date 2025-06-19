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
          <div className="relative group">
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <svg 
                className={`h-5 w-5 transition-colors duration-200 ${
                  searchTerm 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search countries by name, capital, or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-16 py-4 text-base font-medium bg-gradient-to-br from-white via-gray-50 to-gray-100 border-2 border-gray-300 rounded-2xl transition-all duration-300 transform focus:scale-[1.02] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none hover:shadow-lg hover:border-gray-400 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-700 dark:border-neutral-600 dark:text-gray-100 dark:focus:ring-blue-400/20 dark:focus:border-blue-400 dark:hover:border-neutral-500 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              style={{
                boxShadow: searchTerm 
                  ? '0 12px 40px -12px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 8px 30px -8px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            />
            
            {/* Clear Search Button */}
            {searchTerm && (
              <button
                onClick={clearSearchTerm}
                className="absolute inset-y-0 right-12 flex items-center text-gray-400 hover:text-red-500 transition-all duration-200 hover:scale-110 hover:rotate-90 z-10"
                title="Clear search"
              >
                <div className="w-6 h-6 bg-gray-100 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors duration-200 dark:bg-neutral-700 dark:hover:bg-red-900/30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </button>
            )}
            
            {/* Loading Spinner */}
            {isSearching && (
              <div className="absolute inset-y-0 right-4 flex items-center z-10">
                <div className="relative">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <div className="absolute inset-0 animate-ping h-5 w-5 border border-blue-400 rounded-full opacity-20"></div>
                </div>
              </div>
            )}
            
            {/* Search Bar Glow Effect */}
            <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${
              searchTerm ? 'opacity-100' : 'opacity-0'
            }`} style={{
              background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
              animation: searchTerm ? 'shimmer 2s infinite' : 'none'
            }}></div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Region Filter */}
          <div className="relative group">
            {/* Dropdown Icon */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <svg 
                className={`h-5 w-5 transition-colors duration-200 ${
                  selectedRegion 
                    ? 'text-green-500 dark:text-green-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            {/* Select Dropdown */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="block w-full pl-12 pr-12 py-3 text-sm font-medium bg-gradient-to-br from-white via-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl transition-all duration-300 transform focus:scale-[1.02] focus:ring-4 focus:ring-green-500/20 focus:border-green-500 focus:outline-none hover:shadow-lg hover:border-gray-400 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-700 dark:border-neutral-600 dark:text-gray-100 dark:focus:ring-green-400/20 dark:focus:border-green-400 dark:hover:border-neutral-500 appearance-none cursor-pointer"
              style={{
                boxShadow: selectedRegion 
                  ? '0 12px 40px -12px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 8px 30px -8px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <option value="">All Regions</option>
              {availableRegions.map(region => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            
            {/* Custom Dropdown Arrow */}
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-10">
              <svg 
                className={`h-4 w-4 transition-all duration-200 ${
                  selectedRegion 
                    ? 'text-green-500 dark:text-green-400 rotate-180' 
                    : 'text-gray-400 dark:text-gray-500'
                }`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {/* Clear Region Button */}
            {selectedRegion && (
              <button
                onClick={clearRegionFilter}
                className="absolute inset-y-0 right-10 flex items-center text-gray-400 hover:text-red-500 transition-all duration-200 hover:scale-110 hover:rotate-90 z-20"
                title="Clear region filter"
              >
                <div className="w-5 h-5 bg-gray-100 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors duration-200 dark:bg-neutral-700 dark:hover:bg-red-900/30">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </button>
            )}
            
            {/* Region Dropdown Glow Effect */}
            <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
              selectedRegion ? 'opacity-100' : 'opacity-0'
            }`} style={{
              background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.1), transparent)',
              animation: selectedRegion ? 'shimmer 2s infinite' : 'none'
            }}></div>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSortChange('name')}
              className={`group flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border-2 transition-all duration-200 transform ${
                sortBy === 'name'
                  ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 text-blue-800 shadow-lg scale-105 dark:from-blue-900/40 dark:to-blue-800/40 dark:border-blue-600 dark:text-blue-200'
                  : 'bg-gradient-to-br from-white to-gray-50 border-gray-300 text-gray-700 hover:from-gray-50 hover:to-gray-100 hover:border-gray-400 hover:scale-105 hover:shadow-md dark:from-neutral-900 dark:to-neutral-800 dark:border-neutral-700 dark:text-gray-200 dark:hover:from-neutral-800 dark:hover:to-neutral-700'
              }`}
              style={{
                boxShadow: sortBy === 'name' 
                  ? '0 8px 25px -8px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                  : '0 4px 15px -4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Name
                {sortBy === 'name' && (
                  <svg 
                    className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${
                      sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'
                    }`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </span>
            </button>
            <button
              onClick={() => handleSortChange('population')}
              className={`group flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border-2 transition-all duration-200 transform ${
                sortBy === 'population'
                  ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 text-blue-800 shadow-lg scale-105 dark:from-blue-900/40 dark:to-blue-800/40 dark:border-blue-600 dark:text-blue-200'
                  : 'bg-gradient-to-br from-white to-gray-50 border-gray-300 text-gray-700 hover:from-gray-50 hover:to-gray-100 hover:border-gray-400 hover:scale-105 hover:shadow-md dark:from-neutral-900 dark:to-neutral-800 dark:border-neutral-700 dark:text-gray-200 dark:hover:from-neutral-800 dark:hover:to-neutral-700'
              }`}
              style={{
                boxShadow: sortBy === 'population' 
                  ? '0 8px 25px -8px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                  : '0 4px 15px -4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Population
                {sortBy === 'population' && (
                  <svg 
                    className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${
                      sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'
                    }`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </span>
            </button>
          </div>

          {/* Clear All Filters */}
          {(hasActiveSearch || selectedRegion) && (
            <button
              onClick={clearSearch}
              className="group px-6 py-3 text-sm font-medium bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 text-red-800 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:from-red-100 hover:to-red-200 hover:border-red-300 dark:from-red-900/30 dark:to-red-800/30 dark:border-red-700 dark:text-red-200 dark:hover:from-red-800/40 dark:hover:to-red-700/40"
              style={{
                boxShadow: '0 8px 25px -8px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All Filters
              </span>
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