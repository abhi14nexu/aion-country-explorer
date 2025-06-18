import { useState, useEffect, useCallback } from 'react';

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
 * Hook for managing multiple localStorage keys as a batch
 * Useful for managing related settings or preferences
 * 
 * @param keys - Array of localStorage keys with their initial values
 * @returns Object with batch operations
 */
export const useLocalStorageBatch = <T extends Record<string, any>>(
  keys: Record<keyof T, any>
) => {
  const storageHooks = Object.entries(keys).reduce((acc, [key, initialValue]) => {
    const [value, setValue, removeValue] = useLocalStorage(key, initialValue);
    acc[key] = { value, setValue, removeValue };
    return acc;
  }, {} as Record<string, any>);

  // Get all values
  const getAllValues = useCallback(() => {
    return Object.entries(storageHooks).reduce((acc, [key, hook]) => {
      acc[key] = hook.value;
      return acc;
    }, {} as T);
  }, [storageHooks]);

  // Set multiple values
  const setValues = useCallback(
    (values: Partial<T>) => {
      Object.entries(values).forEach(([key, value]) => {
        if (storageHooks[key]) {
          storageHooks[key].setValue(value);
        }
      });
    },
    [storageHooks]
  );

  // Clear all values
  const clearAll = useCallback(() => {
    Object.values(storageHooks).forEach((hook: any) => {
      hook.removeValue();
    });
  }, [storageHooks]);

  return {
    values: getAllValues(),
    setValues,
    clearAll,
    individual: storageHooks,
  };
}; 