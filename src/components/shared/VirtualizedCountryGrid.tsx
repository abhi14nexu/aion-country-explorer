'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CountryBasic } from '@/types/country';
import CountryCard from './CountryCard';
import { CountryGridSkeleton } from '@/components/ui/LoadingSkeleton';

interface VirtualizedCountryGridProps {
  countries: CountryBasic[];
  isLoading?: boolean;
  searchTerm?: string;
  selectedRegion?: string;
}

const CARD_HEIGHT = 400; // Height of each country card in pixels
const CARDS_PER_ROW = {
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
};

/**
 * Virtualized country grid that only renders visible items
 * Improves performance for large datasets (250+ countries)
 */
const VirtualizedCountryGrid: React.FC<VirtualizedCountryGridProps> = ({
  countries,
  isLoading = false,
  searchTerm = '',
  selectedRegion = '',
}) => {
  const [containerHeight, setContainerHeight] = useState(600);
  const [scrollTop, setScrollTop] = useState(0);
  const [cardsPerRow, setCardsPerRow] = useState(CARDS_PER_ROW.lg);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search and region
  const filteredCountries = useMemo(() => {
    return countries.filter(country => {
      const matchesSearch = !searchTerm || 
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = !selectedRegion || 
        country.region === selectedRegion;
      
      return matchesSearch && matchesRegion;
    });
  }, [countries, searchTerm, selectedRegion]);

  // Calculate responsive cards per row
  useEffect(() => {
    const updateCardsPerRow = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCardsPerRow(CARDS_PER_ROW.sm);
      } else if (width < 768) {
        setCardsPerRow(CARDS_PER_ROW.md);
      } else if (width < 1024) {
        setCardsPerRow(CARDS_PER_ROW.lg);
      } else {
        setCardsPerRow(CARDS_PER_ROW.xl);
      }
    };

    updateCardsPerRow();
    window.addEventListener('resize', updateCardsPerRow);
    return () => window.removeEventListener('resize', updateCardsPerRow);
  }, []);

  // Update container height
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerHeight(window.innerHeight - rect.top - 100); // 100px for footer
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Calculate visible items
  const totalRows = Math.ceil(filteredCountries.length / cardsPerRow);
  const totalHeight = totalRows * (CARD_HEIGHT + 24); // 24px for gap
  
  const visibleStartRow = Math.floor(scrollTop / (CARD_HEIGHT + 24));
  const visibleEndRow = Math.min(
    visibleStartRow + Math.ceil(containerHeight / (CARD_HEIGHT + 24)) + 1,
    totalRows
  );

  const visibleCountries = useMemo(() => {
    const startIndex = visibleStartRow * cardsPerRow;
    const endIndex = Math.min(visibleEndRow * cardsPerRow, filteredCountries.length);
    
    return filteredCountries.slice(startIndex, endIndex).map((country, index) => ({
      country,
      index: startIndex + index,
      row: Math.floor((startIndex + index) / cardsPerRow),
      col: (startIndex + index) % cardsPerRow,
    }));
  }, [filteredCountries, visibleStartRow, visibleEndRow, cardsPerRow]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Loading state
  if (isLoading) {
    return <CountryGridSkeleton count={12} />;
  }

  // No results state
  if (filteredCountries.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No countries found
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedRegion 
              ? 'Try adjusting your search or filter criteria.'
              : 'Unable to load country data.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-green-50/60 via-emerald-50/40 to-transparent dark:from-green-900/15 dark:via-emerald-900/10 dark:to-transparent">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 pt-8 pb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 dark:text-gray-100">
            Explore Countries Around the World
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            {searchTerm || selectedRegion ? (
              <>
                Found {filteredCountries.length} countries
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedRegion && ` in ${selectedRegion}`}
              </>
            ) : (
              <>
                Discover detailed information about {filteredCountries.length} countries, including population, 
                regions, capitals, and more. Click on any country to learn more!
              </>
            )}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Virtualized Grid Container */}
      <div
        ref={containerRef}
        className="relative overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* Total height spacer */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Visible items */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translateY(${visibleStartRow * (CARD_HEIGHT + 24)}px)`,
            }}
          >
            <div 
              className="grid gap-6"
              style={{
                gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))`,
              }}
            >
              {visibleCountries.map(({ country, index }) => (
                <div
                  key={country.cca2}
                  style={{ height: CARD_HEIGHT }}
                >
                  <CountryCard 
                    country={country} 
                    priority={index < cardsPerRow * 2} // Priority for first 2 rows
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

        {/* Footer Info */}
        <div className="text-center mt-12 text-gray-500">
          <p>
            Showing {visibleCountries.length} of {filteredCountries.length} countries • 
            Data provided by REST Countries API
          </p>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedCountryGrid; 