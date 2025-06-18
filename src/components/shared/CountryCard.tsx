'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CountryBasic } from '@/types/country';

interface CountryCardProps {
  country: CountryBasic;
}

export default function CountryCard({ country }: CountryCardProps) {
  const { cca2, name, flags, population, region, capital } = country;

  // Format population with commas
  const formatPopulation = (pop: number): string => {
    return new Intl.NumberFormat('en-US').format(pop);
  };

  // Get capital name or show fallback
  const getCapital = (): string => {
    if (!capital || capital.length === 0) return 'No capital';
    return capital[0]; // Show first capital if multiple
  };

  return (
    <Link 
      href={`/country/${cca2.toLowerCase()}`}
      className="group block transform transition-transform duration-200 hover:scale-105"
    >
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        {/* Flag Image */}
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

        {/* Card Content */}
        <div className="p-6">
          {/* Country Name */}
          <h3 className="font-bold text-xl mb-4 text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
            {name.common}
          </h3>

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

          {/* Favorite Icon Placeholder - Will be implemented in Phase 5 */}
          <div className="mt-4 flex justify-end">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">♡</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 