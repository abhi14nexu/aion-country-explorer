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
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Memoized formatters to prevent re-creation on every render
  const formatPopulation = useCallback((pop: number): string => {
    return new Intl.NumberFormat('en-US').format(pop);
  }, []);

  // Get capital names
  const getCapital = useCallback((): string => {
    if (!capital || capital.length === 0) return 'No capital';
    return capital[0]; // Show first capital if multiple
  }, [capital]);

  // Create sparkle effect function
  const createSparkleEffect = useCallback((button: HTMLElement) => {
    const sparkles = 12;
    const buttonRect = button.getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;

    // Add vibration if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 20, 50]);
    }

    const sparkleColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

    for (let i = 0; i < sparkles; i++) {
      const sparkle = document.createElement('div');
      const color = sparkleColors[i % sparkleColors.length];
      const size = 3 + Math.random() * 4;
      
      sparkle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        left: ${centerX}px;
        top: ${centerY}px;
        opacity: 1;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 6px ${color};
      `;

      document.body.appendChild(sparkle);

      const angle = (i / sparkles) * Math.PI * 2;
      const distance = 40 + Math.random() * 30;
      const duration = 800 + Math.random() * 400;

      sparkle.animate([
        {
          transform: 'translate(-50%, -50%) scale(0) rotate(0deg)',
          opacity: 1
        },
        {
          transform: `translate(-50%, -50%) scale(1.2) rotate(180deg) translate(${Math.cos(angle) * distance * 0.7}px, ${Math.sin(angle) * distance * 0.7}px)`,
          opacity: 0.9,
          offset: 0.6
        },
        {
          transform: `translate(-50%, -50%) scale(0) rotate(360deg) translate(${Math.cos(angle) * distance * 1.5}px, ${Math.sin(angle) * distance * 1.5}px)`,
          opacity: 0
        }
      ], {
        duration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => {
        if (document.body.contains(sparkle)) {
          document.body.removeChild(sparkle);
        }
      };
    }
  }, []);

  // Memoized favorite click handler
  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    
    if (isAuthenticated) {
      const wasAlreadyFavorited = isFavorited;
      
      // Trigger heart-beat animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
      
      // Add visual feedback animation
      const button = e.currentTarget as HTMLButtonElement;
      button.style.transform = 'scale(0.8)';
      
      // Create sparkle effect for adding to favorites
      if (!wasAlreadyFavorited) {
        createSparkleEffect(button);
      }
      
      setTimeout(() => {
        button.style.transform = 'scale(1.1)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 150);
      }, 100);
      
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
  }, [isAuthenticated, toggleFavorite, cca2, isFavorited, name.common, createSparkleEffect]);



  // Memoized formatted values
  const formattedPopulation = formatPopulation(population);
  const capitalCity = getCapital();

  return (
    // Use article for semantic grouping of card content
    <article
      className="group block transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
      role="article"
      aria-labelledby={`country-card-title-${cca2}`}
      tabIndex={0} // Make card focusable for keyboard users
    >
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden dark:bg-neutral-900 dark:shadow-lg border border-gray-100 dark:border-gray-800 backdrop-blur-sm relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none">
        {/* Flag Image */}
        <Link 
          href={`/country/${cca2.toLowerCase()}`}
          aria-label={`View details for ${name.common}`}
          className="block"
        >
          <div className="relative h-48 w-full overflow-hidden">
            {/* Gradient overlay for modern effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 group-hover:from-black/30 transition-all duration-300"></div>
            <Image
              src={flags.png}
              alt={`Flag of ${name.common}`} // Descriptive alt text
              fill
              className="object-cover group-hover:brightness-110 group-hover:scale-110 transition-all duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Rw="
            />
          </div>
        </Link>

        {/* Card Content */}
        <div className="p-6 relative z-20">
          {/* Country Name */}
          <Link 
            href={`/country/${cca2.toLowerCase()}`}
            id={`country-card-title-${cca2}`}
            className="focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            aria-label={`View details for ${name.common}`}
          >
            <h3 className="font-bold text-xl mb-5 text-gray-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 dark:text-gray-100 dark:group-hover:text-blue-400 tracking-tight">
              {name.common}
            </h3>
          </Link>

          {/* Country Details */}
          <section className="space-y-3 text-gray-600 dark:text-gray-300 mb-6" aria-label="Country details">
            <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 rounded-xl transition-colors duration-200">
              <span className="font-semibold min-w-20 flex-shrink-0 text-sm text-gray-700 dark:text-gray-200">Population:</span>
              <span className="truncate text-sm font-medium">{formattedPopulation}</span>
            </div>
            
            <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 rounded-xl transition-colors duration-200">
              <span className="font-semibold min-w-20 flex-shrink-0 text-sm text-gray-700 dark:text-gray-200">Region:</span>
              <span className="truncate text-sm font-medium">{region}</span>
            </div>
            
            <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 rounded-xl transition-colors duration-200">
              <span className="font-semibold min-w-20 flex-shrink-0 text-sm text-gray-700 dark:text-gray-200">Capital:</span>
              <span className="truncate text-sm font-medium">{capitalCity}</span>
            </div>
          </section>

          {/* Favorite Icon */}
          <div className="flex justify-end">
            <button
              onClick={handleFavoriteClick}
              disabled={!isAuthenticated}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border group/heart favorite-button-glow ${
                isFavorited && isAuthenticated ? 'favorited' : ''
              } ${isAnimating ? 'animate-heart-beat' : ''} ${
                isAuthenticated
                  ? 'hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700 border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-700 hover:scale-110 hover:shadow-lg active:scale-95'
                  : 'cursor-not-allowed opacity-50 border-gray-200 dark:border-gray-700'
              }`}
              style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s ease-out'
              }}
              title={isAuthenticated ? (isFavorited ? 'Remove from favorites' : 'Add to favorites') : 'Login to add favorites'}
              aria-label={isAuthenticated ? (isFavorited ? `Remove ${name.common} from favorites` : `Add ${name.common} to favorites`) : 'Login to add favorites'}
              aria-pressed={isFavorited && isAuthenticated ? 'true' : 'false'} // Indicate toggle state
              tabIndex={0} // Ensure button is focusable
            >
              {/* Pulse effect for favorited items */}
              {isFavorited && isAuthenticated && (
                <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" />
              )}
              
              {/* Heart icon with enhanced animations */}
              <span 
                className={`relative text-lg transition-all duration-300 ease-out transform ${
                  isFavorited && isAuthenticated 
                    ? 'text-red-500 dark:text-red-400 scale-110 animate-pulse' 
                    : isAuthenticated 
                      ? 'text-gray-400 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-300 group-hover/heart:scale-110' 
                      : 'text-gray-300 dark:text-gray-600'
                }`}
                style={{
                  filter: isFavorited && isAuthenticated ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))' : 'none',
                  transition: 'all 0.3s ease-out, filter 0.3s ease-out'
                }}
                aria-hidden="true"
              >
                {isFavorited && isAuthenticated ? (
                  <span className="relative">
                    ❤️
                    {/* Add subtle glow effect */}
                    <span className="absolute inset-0 text-red-500 opacity-50 blur-sm">❤️</span>
                  </span>
                ) : (
                  '🤍'
                )}
              </span>
              
              {/* Floating hearts animation for active favorites */}
              {isFavorited && isAuthenticated && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <span className="absolute top-0 left-1/2 text-xs text-red-400 animate-floating-heart" style={{ animationDelay: '0s' }}>
                    💖
                  </span>
                  <span className="absolute top-0 left-1/2 text-xs text-pink-400 animate-floating-heart" style={{ animationDelay: '0.5s' }}>
                    💕
                  </span>
                  <span className="absolute top-0 left-1/2 text-xs text-red-300 animate-floating-heart" style={{ animationDelay: '1s' }}>
                    💗
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
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