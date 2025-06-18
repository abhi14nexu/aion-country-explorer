'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { getAllCountries } from '@/lib/api';
import { CountryBasic } from '@/types/country';
import CountryCard from '@/components/shared/CountryCard';
import { CountryGridSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { toast } from '@/components/ui/Toast';

type SortOption = 'name' | 'dateAdded' | 'population' | 'region';
type SortOrder = 'asc' | 'desc';

const FavoritesClient: React.FC = () => {
  const { 
    favorites, 
    isAuthenticated, 
    favoritesMetadata, 
    exportFavorites, 
    importFavorites, 
    clearAllFavorites,
    getRecentlyAdded,
    getFavoritesByDate
  } = useAppStore();
  
  const [allCountries, setAllCountries] = useState<CountryBasic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [showRecentlyAdded, setShowRecentlyAdded] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all countries to match with favorites
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const countries = await getAllCountries();
        setAllCountries(countries);
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Failed to load countries. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCountries();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Filter countries to show only favorites
  const favoriteCountries = useMemo(() => {
    if (!allCountries.length || !favorites.length) {
      return [];
    }

    return allCountries.filter(country =>
      favorites.includes(country.cca2.toLowerCase())
    );
  }, [allCountries, favorites]);

  // Apply filtering and sorting
  const filteredAndSortedFavorites = useMemo(() => {
    let filtered = [...favoriteCountries];

    // Filter by region if selected
    if (selectedRegion) {
      filtered = filtered.filter(country => country.region === selectedRegion);
    }

    // Filter by recently added if enabled
    if (showRecentlyAdded) {
      const recentCodes = getRecentlyAdded(10);
      filtered = filtered.filter(country => recentCodes.includes(country.cca2.toLowerCase()));
    }

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
        case 'region':
          comparison = a.region.localeCompare(b.region);
          break;
        case 'dateAdded':
          const aTime = favoritesMetadata[a.cca2.toLowerCase()]?.addedAt || 0;
          const bTime = favoritesMetadata[b.cca2.toLowerCase()]?.addedAt || 0;
          comparison = aTime - bTime;
          break;
        default:
          comparison = a.name.common.localeCompare(b.name.common);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [favoriteCountries, selectedRegion, showRecentlyAdded, sortBy, sortOrder, favoritesMetadata, getRecentlyAdded]);

  // Get unique regions from favorites
  const availableRegions = useMemo(() => {
    const regions = new Set(favoriteCountries.map(country => country.region));
    return Array.from(regions).sort();
  }, [favoriteCountries]);

  // Recently added countries for quick access
  const recentlyAddedCountries = useMemo(() => {
    const recentCodes = getRecentlyAdded(5);
    return favoriteCountries.filter(country => 
      recentCodes.includes(country.cca2.toLowerCase())
    );
  }, [favoriteCountries, getRecentlyAdded]);

  // Handle sort change
  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  // Export favorites
  const handleExport = () => {
    try {
      const jsonData = exportFavorites();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aion-favorites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Favorites exported successfully!', {
        duration: 4000,
      });
    } catch (error) {
      toast.error('Failed to export favorites');
    }
  };

  // Import favorites
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importFavorites(content);
        
        if (success) {
          toast.success('Favorites imported successfully!', {
            duration: 4000,
          });
        } else {
          toast.error('Invalid file format. Please check your file and try again.');
        }
      } catch (error) {
        toast.error('Failed to read the file');
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clear all favorites with confirmation
  const handleClearAll = () => {
    if (favorites.length === 0) return;
    
    const isConfirmed = window.confirm(
      `Are you sure you want to remove all ${favorites.length} countries from your favorites? This action cannot be undone.`
    );
    
    if (isConfirmed) {
      clearAllFavorites();
      toast.info('All favorites cleared', {
        duration: 3000,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return <CountryGridSkeleton count={8} />;
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Favorites
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty favorites state
  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💙</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Favorite Countries Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start exploring countries and add them to your favorites by clicking the heart icon!
          </p>
          <a
            href="/"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explore Countries
          </a>
        </div>
      </div>
    );
  }

  // Main favorites display
  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error) => {
        console.error('Favorites page error:', error);
      }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            My Favorite Countries
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            You have {favorites.length} favorite {favorites.length === 1 ? 'country' : 'countries'}. 
            Organize, sort, and manage your collection with the tools below.
          </p>
        </div>

        {/* Recently Added Quick Access */}
        {recentlyAddedCountries.length > 0 && !showRecentlyAdded && (
          <div className="mb-8 bg-blue-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-blue-800">
                Recently Added
              </h2>
              <button
                onClick={() => setShowRecentlyAdded(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All Recent
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentlyAddedCountries.map(country => (
                <a
                  key={country.cca2}
                  href={`/country/${country.cca2.toLowerCase()}`}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm rounded-full transition-colors"
                >
                  <span className="mr-1">{country.flags.png}</span>
                  {country.name.common}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filtering */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter & View</h3>
              <div className="space-y-3">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">All Regions</option>
                  {availableRegions.map(region => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showRecentlyAdded}
                    onChange={(e) => setShowRecentlyAdded(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Recently added only</span>
                </label>
              </div>
            </div>

            {/* Sorting */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Sort By</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'dateAdded', label: 'Date Added' },
                  { key: 'population', label: 'Population' },
                  { key: 'region', label: 'Region' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleSortChange(key as SortOption)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      sortBy === key
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label} {sortBy === key && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Manage</h3>
              <div className="space-y-2">
                <button
                  onClick={handleExport}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Export Favorites
                </button>
                
                <label className="block">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="sr-only"
                  />
                  <span className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer inline-block text-center">
                    Import Favorites
                  </span>
                </label>
                
                <button
                  onClick={handleClearAll}
                  disabled={favorites.length === 0}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredAndSortedFavorites.length}
              </div>
              <div className="text-sm text-gray-600">
                {selectedRegion || showRecentlyAdded ? 'Shown' : 'Total'} Favorites
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(filteredAndSortedFavorites.map(c => c.region)).size}
              </div>
              <div className="text-sm text-gray-600">Regions</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(filteredAndSortedFavorites.reduce((sum, country) => sum + country.population, 0) / 1000000)}M
              </div>
              <div className="text-sm text-gray-600">Total Population</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getRecentlyAdded().length}
              </div>
              <div className="text-sm text-gray-600">Recent Additions</div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedRegion || showRecentlyAdded) && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedRegion && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  Region: {selectedRegion}
                  <button
                    onClick={() => setSelectedRegion('')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {showRecentlyAdded && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Recently Added
                  <button
                    onClick={() => setShowRecentlyAdded(false)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedRegion('');
                  setShowRecentlyAdded(false);
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Regions Breakdown */}
        {filteredAndSortedFavorites.length > 0 && !selectedRegion && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Favorites by Region
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from(new Set(favoriteCountries.map(c => c.region))).map(region => {
                const count = favoriteCountries.filter(c => c.region === region).length;
                return (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm rounded-full transition-colors cursor-pointer"
                  >
                    {region} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results After Filtering */}
        {filteredAndSortedFavorites.length === 0 && favorites.length > 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No favorites match your filters
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filter settings to see more results.
            </p>
            <button
              onClick={() => {
                setSelectedRegion('');
                setShowRecentlyAdded(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Countries Grid */}
        {filteredAndSortedFavorites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedFavorites.map((country, index) => (
              <CountryCard 
                key={country.cca2} 
                country={country}
                priority={index < 8} // Priority for first 8 cards
              />
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-12 text-center">
          <div className="space-y-4">
            <p className="text-gray-600">
              Ready to discover more amazing countries?
            </p>
            <div className="space-x-4">
              <a
                href="/"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explore All Countries
              </a>
              
              {favorites.length > 0 && (
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'My Favorite Countries',
                        text: `Check out my ${favorites.length} favorite countries: ${filteredAndSortedFavorites.slice(0, 3).map(c => c.name.common).join(', ')}${favorites.length > 3 ? ' and more!' : '!'}`,
                        url: window.location.href,
                      });
                    } else {
                      // Fallback for browsers without Web Share API
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard!');
                    }
                  }}
                  className="inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Favorites
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default FavoritesClient; 