import { useState, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with TypeScript support
 * Provides a React state-like interface for localStorage values
 * 
 * @param key - The localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns [value, setValue, removeValue] tuple
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for managing localStorage with additional utilities
 * Includes error handling, existence checking, and batch operations
 * 
 * @param key - The localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Object with value, setter, utilities, and status
 */
export const useLocalStorageState = <T>(key: string, initialValue: T) => {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);
  const [error, setError] = useState<string | null>(null);

  // Check if key exists in localStorage
  const exists = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(key) !== null;
  }, [key]);

  // Get raw string value from localStorage
  const getRawValue = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  }, [key]);

  // Set value with error handling
  const setValueSafe = useCallback(
    (newValue: T | ((val: T) => T)) => {
      try {
        setValue(newValue);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error(`Error updating localStorage key "${key}":`, err);
      }
    },
    [setValue, key]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    value,
    setValue: setValueSafe,
    removeValue,
    exists,
    getRawValue,
    error,
    clearError,
    hasError: error !== null,
  };
};

/**
 * Utility function for managing multiple localStorage keys
 * Note: This is not a hook and should not be used inside React components
 * Use individual useLocalStorage calls instead
 * 
 * @param keys - Array of localStorage keys with their initial values
 * @returns Object with batch operations
 */
export const createLocalStorageBatch = <T extends Record<string, unknown>>(
  keys: Record<keyof T, unknown>
) => {
  // Get all values
  const getAllValues = (): T => {
    const result = {} as Record<string, unknown>;
    Object.entries(keys).forEach(([key, initialValue]) => {
      try {
        const item = window.localStorage.getItem(key);
        result[key] = item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        result[key] = initialValue;
      }
    });
    return result as T;
  };

  // Set multiple values
  const setValues = (values: Partial<T>) => {
    Object.entries(values).forEach(([key, value]) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    });
  };

  // Clear all values
  const clearAll = () => {
    Object.keys(keys).forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Error removing localStorage key "${key}":`, error);
      }
    });
  };

  return {
    getAllValues,
    setValues,
    clearAll,
  };
}; 