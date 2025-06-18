'use client';

import { CountryBasic } from '@/types/country';
import CountryCard from './CountryCard';

interface CountryListContainerProps {
  countries: CountryBasic[];
}

export default function CountryListContainer({ countries }: CountryListContainerProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Explore Countries Around the World
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover detailed information about {countries.length} countries, including population, 
          regions, capitals, and more. Click on any country to learn more!
        </p>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {countries.map((country) => (
          <CountryCard 
            key={country.cca2} 
            country={country} 
          />
        ))}
      </div>

      {/* Footer Info */}
      <div className="text-center mt-12 text-gray-500">
        <p>Data provided by REST Countries API</p>
      </div>
    </div>
  );
} 