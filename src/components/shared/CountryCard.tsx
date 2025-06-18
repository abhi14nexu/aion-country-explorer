'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CountryBasic } from '@/types/country';
import { useAppStore } from '@/store/appStore';

interface CountryCardProps {
  country: CountryBasic;
}

export default function CountryCard({ country }: CountryCardProps) {
  const { cca2, name, flags, population, region, capital } = country;
  const { favorites, toggleFavorite, isAuthenticated } = useAppStore();
  
  const isFavorited = favorites.includes(cca2.toLowerCase());

  // Format population with commas
  const formatPopulation = (pop: number): string => {
    return new Intl.NumberFormat('en-US').format(pop);
  };

  // Get capital name or show fallback
  const getCapital = (): string => {
    if (!capital || capital.length === 0) return 'No capital';
    return capital[0]; // Show first capital if multiple
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    
    if (isAuthenticated) {
      toggleFavorite(cca2.toLowerCase());
    }
  };

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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={false}
            />
          </div>
        </Link>

        {/* Card Content */}
        <div className="p-6">
          {/* Country Name */}
          <Link href={`/country/${cca2.toLowerCase()}`}>
            <h3 className="font-bold text-xl mb-4 text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
              {name.common}
            </h3>
          </Link>

          {/* Country Details */}
          <div className="space-y-2 text-gray-600">
            <div className="flex">
              <span className="font-semibold min-w-20">Population:</span>
              <span>{formatPopulation(population)}</span>
            </div>
            
            <div className="flex">
              <span className="font-semibold min-w-20">Region:</span>
              <span>{region}</span>
            </div>
            
            <div className="flex">
              <span className="font-semibold min-w-20">Capital:</span>
              <span>{getCapital()}</span>
            </div>
          </div>

          {/* Favorite Icon */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleFavoriteClick}
              disabled={!isAuthenticated}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isAuthenticated
                  ? 'hover:bg-red-50 cursor-pointer'
                  : 'cursor-not-allowed opacity-50'
              }`}
              title={isAuthenticated ? (isFavorited ? 'Remove from favorites' : 'Add to favorites') : 'Login to add favorites'}
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
} 