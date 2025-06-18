import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

/**
 * Basic skeleton component for loading states
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = false,
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  const roundedClasses = rounded ? 'rounded-full' : 'rounded';
  
  return (
    <div
      className={`${baseClasses} ${roundedClasses} ${className}`}
      style={{ width, height }}
    />
  );
};

/**
 * Skeleton for country card loading state
 */
export const CountryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Flag Image Skeleton */}
      <Skeleton height="12rem" className="rounded-none" />
      
      {/* Card Content Skeleton */}
      <div className="p-6">
        {/* Country Name */}
        <Skeleton height="1.5rem" width="70%" className="mb-4" />
        
        {/* Country Details */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Skeleton width="5rem" height="1rem" className="mr-2" />
            <Skeleton width="40%" height="1rem" />
          </div>
          <div className="flex items-center">
            <Skeleton width="5rem" height="1rem" className="mr-2" />
            <Skeleton width="30%" height="1rem" />
          </div>
          <div className="flex items-center">
            <Skeleton width="5rem" height="1rem" className="mr-2" />
            <Skeleton width="35%" height="1rem" />
          </div>
        </div>
        
        {/* Favorite Icon */}
        <div className="mt-4 flex justify-end">
          <Skeleton width="2rem" height="2rem" rounded />
        </div>
      </div>
    </div>
  );
};

/**
 * Grid of country card skeletons
 */
export const CountryGridSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="text-center mb-8">
        <Skeleton height="2.5rem" width="60%" className="mx-auto mb-4" />
        <Skeleton height="1.25rem" width="80%" className="mx-auto" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }, (_, index) => (
          <CountryCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for search/filter components
 */
export const SearchFilterSkeleton: React.FC = () => {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input Skeleton */}
        <Skeleton height="2.5rem" className="flex-1" />
        
        {/* Filter Dropdown Skeleton */}
        <Skeleton height="2.5rem" width="12rem" />
      </div>
      
      {/* Results Count Skeleton */}
      <Skeleton height="1rem" width="10rem" />
    </div>
  );
};

/**
 * Skeleton for navigation/header
 */
export const HeaderSkeleton: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Skeleton */}
          <div className="flex items-center space-x-2">
            <Skeleton width="2rem" height="2rem" rounded />
            <Skeleton width="8rem" height="1.5rem" />
          </div>

          {/* Navigation Skeleton */}
          <div className="hidden md:flex items-center space-x-6">
            <Skeleton width="4rem" height="1rem" />
            <Skeleton width="4rem" height="1rem" />
          </div>

          {/* Auth Controls Skeleton */}
          <div className="flex items-center space-x-4">
            <Skeleton width="6rem" height="1rem" />
            <Skeleton width="4rem" height="2rem" />
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * Generic list skeleton
 */
export const ListSkeleton: React.FC<{ 
  items?: number; 
  itemHeight?: string;
  showBullets?: boolean;
}> = ({ 
  items = 5, 
  itemHeight = '1rem',
  showBullets = false 
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="flex items-center">
          {showBullets && (
            <Skeleton width="0.5rem" height="0.5rem" rounded className="mr-3 flex-shrink-0" />
          )}
          <Skeleton 
            height={itemHeight} 
            width={`${Math.random() * 40 + 60}%`} // Random width between 60-100%
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for detailed country page
 */
export const CountryDetailSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button Skeleton */}
        <Skeleton width="4rem" height="2rem" className="mb-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Flag Image Skeleton */}
          <div>
            <Skeleton height="20rem" className="rounded-lg" />
          </div>
          
          {/* Country Info Skeleton */}
          <div className="space-y-6">
            {/* Country Name */}
            <Skeleton height="3rem" width="80%" />
            
            {/* Basic Info */}
            <div className="space-y-3">
              <Skeleton height="1.25rem" width="100%" />
              <Skeleton height="1.25rem" width="90%" />
              <Skeleton height="1.25rem" width="85%" />
              <Skeleton height="1.25rem" width="95%" />
            </div>
            
            {/* Languages & Currencies */}
            <div className="space-y-4">
              <div>
                <Skeleton height="1.5rem" width="6rem" className="mb-2" />
                <ListSkeleton items={3} itemHeight="1rem" />
              </div>
              
              <div>
                <Skeleton height="1.5rem" width="6rem" className="mb-2" />
                <ListSkeleton items={2} itemHeight="1rem" />
              </div>
            </div>
            
            {/* Borders */}
            <div>
              <Skeleton height="1.5rem" width="4rem" className="mb-3" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} width="4rem" height="2rem" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 