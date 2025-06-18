'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { getAllCountries } from '@/lib/api';
import { CountryBasic } from '@/types/country';
import CountryCard from '@/components/shared/CountryCard';
import { CountryGridSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const FavoritesClient: React.FC = () => {
  const { favorites, isAuthenticated } = useAppStore();
  const [allCountries, setAllCountries] = useState<CountryBasic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Sort favorites alphabetically
  const sortedFavorites = useMemo(() => {
    return [...favoriteCountries].sort((a, b) => 
      a.name.common.localeCompare(b.name.common)
    );
  }, [favoriteCountries]);

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
            Click on any country to explore detailed information or remove it from your favorites.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{favorites.length}</div>
              <div className="text-sm text-gray-600">Favorite Countries</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(sortedFavorites.map(c => c.region)).size}
              </div>
              <div className="text-sm text-gray-600">Regions</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {sortedFavorites.reduce((sum, country) => sum + country.population, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Population</div>
            </div>
          </div>
        </div>

        {/* Regions Breakdown */}
        {sortedFavorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Favorites by Region
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from(new Set(sortedFavorites.map(c => c.region))).map(region => {
                const count = sortedFavorites.filter(c => c.region === region).length;
                return (
                  <span
                    key={region}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {region} ({count})
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Countries Grid */}
        {sortedFavorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedFavorites.map((country, index) => (
              <CountryCard 
                key={country.cca2} 
                country={country}
                priority={index < 8} // Priority for first 8 cards
              />
            ))}
          </div>
        ) : (
          // Loading state for when favorites exist but countries aren't loaded yet
          <div className="text-center py-8">
            <div className="text-lg text-gray-600">Loading your favorite countries...</div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-12 text-center">
          <div className="space-y-4">
            <p className="text-gray-600">
              Want to discover more countries?
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
                        text: `Check out my ${favorites.length} favorite countries: ${sortedFavorites.slice(0, 3).map(c => c.name.common).join(', ')}${favorites.length > 3 ? ' and more!' : '!'}`,
                        url: window.location.href,
                      });
                    } else {
                      // Fallback for browsers without Web Share API
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
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