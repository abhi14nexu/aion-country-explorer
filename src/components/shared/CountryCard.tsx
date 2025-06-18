'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { memo, useCallback } from 'react';
import { CountryBasic } from '@/types/country';
import { useAppStore } from '@/store/appStore';
import { toast } from '@/components/ui/Toast';

interface CountryCardProps {
  country: CountryBasic;
  priority?: boolean; // For above-the-fold images
}

const CountryCard: React.FC<CountryCardProps> = ({ country, priority = false }) => {
  const { cca2, name, flags, population, region, capital } = country;
  const { favorites, toggleFavorite, isAuthenticated } = useAppStore();
  
  const isFavorited = favorites.includes(cca2.toLowerCase());

  // Memoized formatters to prevent re-creation on every render
  const formatPopulation = useCallback((pop: number): string => {
    return new Intl.NumberFormat('en-US').format(pop);
  }, []);

  // Get capital name or show fallback
  const getCapital = useCallback((): string => {
    if (!capital || capital.length === 0) return 'No capital';
    return capital[0]; // Show first capital if multiple
  }, [capital]);

  // Memoized favorite click handler
  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    
    if (isAuthenticated) {
      const wasAlreadyFavorited = isFavorited;
      toggleFavorite(cca2.toLowerCase());
      
      // Show toast notification
      if (wasAlreadyFavorited) {
        toast.info(`${name.common} removed from favorites`, {
          duration: 3000,
          action: {
            label: 'Undo',
            onClick: () => toggleFavorite(cca2.toLowerCase())
          }
        });
      } else {
        toast.success(`${name.common} added to favorites!`, {
          duration: 3000,
          action: {
            label: 'View All',
            onClick: () => window.location.href = '/favorites'
          }
        });
      }
    }
  }, [isAuthenticated, toggleFavorite, cca2, isFavorited, name.common]);

  // Memoized formatted values
  const formattedPopulation = formatPopulation(population);
  const capitalCity = getCapital();

  return (
    <div className="group block transform transition-transform duration-200 hover:scale-105">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        {/* Flag Image */}
        <Link href={`/country/${cca2.toLowerCase()}`}>
          <div className="relative h-48 w-full">
            <Image
              src={flags.png}
              alt={`Flag of ${name.common}`}
              fill
              className="object-cover group-hover:brightness-110 transition-all duration-200"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority} // Optimize loading for above-the-fold images
              quality={85} // Slight compression for faster loading
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Rw=" // Low-quality placeholder
            />
          </div>
        </Link>

        {/* Card Content */}
        <div className="p-6">
          {/* Country Name */}
          <Link href={`/country/${cca2.toLowerCase()}`}>
            <h3 className="font-bold text-xl mb-4 text-gray-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
              {name.common}
            </h3>
          </Link>

          {/* Country Details */}
          <div className="space-y-2 text-gray-600">
            <div className="flex">
              <span className="font-semibold min-w-20 flex-shrink-0">Population:</span>
              <span className="truncate">{formattedPopulation}</span>
            </div>
            
            <div className="flex">
              <span className="font-semibold min-w-20 flex-shrink-0">Region:</span>
              <span className="truncate">{region}</span>
            </div>
            
            <div className="flex">
              <span className="font-semibold min-w-20 flex-shrink-0">Capital:</span>
              <span className="truncate">{capitalCity}</span>
            </div>
          </div>

          {/* Favorite Icon */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleFavoriteClick}
              disabled={!isAuthenticated}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isAuthenticated
                  ? 'hover:bg-red-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-300'
                  : 'cursor-not-allowed opacity-50'
              }`}
              title={isAuthenticated ? (isFavorited ? 'Remove from favorites' : 'Add to favorites') : 'Login to add favorites'}
              aria-label={isAuthenticated ? (isFavorited ? 'Remove from favorites' : 'Add to favorites') : 'Login to add favorites'}
            >
              <span className={`text-lg transition-colors duration-200 ${
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
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
// Only re-render if country data, authentication status, or favorites change
export default memo(CountryCard, (prevProps, nextProps) => {
  return (
    prevProps.country.cca2 === nextProps.country.cca2 &&
    prevProps.country.name.common === nextProps.country.name.common &&
    prevProps.country.population === nextProps.country.population &&
    prevProps.country.region === nextProps.country.region &&
    prevProps.priority === nextProps.priority
  );
}); 