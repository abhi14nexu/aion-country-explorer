import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * Useful for search inputs to avoid excessive API calls or filtering operations
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before delay is reached
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for debouncing search terms with additional utilities
 * Provides loading state and search trigger functionality
 * 
 * @param searchTerm - The search term to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Object with debounced search term, loading state, and utilities
 */
export const useDebouncedSearch = (searchTerm: string, delay: number = 300) => {
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  // Reset search
  const clearSearch = () => {
    setIsSearching(false);
  };

  // Check if search is active
  const hasActiveSearch = debouncedSearchTerm.trim().length > 0;

  return {
    debouncedSearchTerm,
    isSearching,
    hasActiveSearch,
    clearSearch,
  };
};

/**
 * Custom hook for debouncing multiple values at once
 * Useful when you need to debounce multiple form fields or filters
 * 
 * @param values - Object with values to debounce
 * @param delay - Delay in milliseconds
 * @returns Object with debounced values
 */
export const useDebounceMultiple = <T extends Record<string, any>>(
  values: T,
  delay: number
): T => {
  const [debouncedValues, setDebouncedValues] = useState<T>(values);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValues(values);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [values, delay]);

  return debouncedValues;
}; 