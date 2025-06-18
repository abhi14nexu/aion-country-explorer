import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedSearch, useDebounceMultiple } from '@/hooks/useDebounce';

// Mock timers
jest.useFakeTimers();

describe('useDebounce Hook', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('useDebounce', () => {
    test('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      
      expect(result.current).toBe('initial');
    });

    test('should debounce value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      expect(result.current).toBe('initial');

      // Change value
      rerender({ value: 'changed', delay: 500 });
      expect(result.current).toBe('initial'); // Should still be initial

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('changed');
    });

    test('should reset timer on subsequent value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      // First change
      rerender({ value: 'change1', delay: 500 });
      
      // Advance time partially
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(result.current).toBe('initial'); // Still initial

      // Second change (should reset timer)
      rerender({ value: 'change2', delay: 500 });
      
      // Advance remaining time from first change
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      expect(result.current).toBe('initial'); // Should still be initial

      // Advance full delay for second change
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(result.current).toBe('change2');
    });

    test('should handle delay changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      // Change value and delay
      rerender({ value: 'changed', delay: 1000 });
      
      // Advance time with old delay
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      expect(result.current).toBe('initial'); // Should use new delay

      // Advance remaining time
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      expect(result.current).toBe('changed');
    });

    test('should cleanup timer on unmount', () => {
      const { unmount } = renderHook(() => useDebounce('test', 500));
      
      // Should not throw any errors
      expect(() => unmount()).not.toThrow();
    });

    test('should handle zero delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 0 } }
      );

      rerender({ value: 'changed', delay: 0 });
      
      act(() => {
        jest.advanceTimersByTime(0);
      });
      
      expect(result.current).toBe('changed');
    });

    test('should handle negative delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: -100 } }
      );

      rerender({ value: 'changed', delay: -100 });
      
      // Should treat negative delay as 0
      act(() => {
        jest.advanceTimersByTime(0);
      });
      
      expect(result.current).toBe('changed');
    });
  });

  describe('useDebouncedSearch', () => {
    const mockCallback = jest.fn();

    beforeEach(() => {
      mockCallback.mockClear();
    });

    test('should initialize correctly', () => {
      const { result } = renderHook(() => useDebouncedSearch(mockCallback, 500));
      
      expect(result.current.searchTerm).toBe('');
      expect(result.current.debouncedSearchTerm).toBe('');
      expect(result.current.isSearching).toBe(false);
    });

    test('should handle search term changes', () => {
      const { result } = renderHook(() => useDebouncedSearch(mockCallback, 300));
      
      act(() => {
        result.current.setSearchTerm('test');
      });

      expect(result.current.searchTerm).toBe('test');
      expect(result.current.isSearching).toBe(true);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.debouncedSearchTerm).toBe('test');
      expect(result.current.isSearching).toBe(false);
      expect(mockCallback).toHaveBeenCalledWith('test');
    });

    test('should reset search correctly', () => {
      const { result } = renderHook(() => useDebouncedSearch(mockCallback, 300));
      
      // Set search term
      act(() => {
        result.current.setSearchTerm('test');
      });

      expect(result.current.searchTerm).toBe('test');
      expect(result.current.isSearching).toBe(true);

      // Reset
      act(() => {
        result.current.resetSearch();
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.debouncedSearchTerm).toBe('');
      expect(result.current.isSearching).toBe(false);
      expect(mockCallback).toHaveBeenCalledWith('');
    });

    test('should handle rapid search term changes', () => {
      const { result } = renderHook(() => useDebouncedSearch(mockCallback, 300));
      
      // Rapid changes
      act(() => {
        result.current.setSearchTerm('a');
      });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      act(() => {
        result.current.setSearchTerm('ab');
      });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      act(() => {
        result.current.setSearchTerm('abc');
      });

      expect(result.current.searchTerm).toBe('abc');
      expect(result.current.isSearching).toBe(true);
      expect(mockCallback).not.toHaveBeenCalled();

      // Complete the debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.debouncedSearchTerm).toBe('abc');
      expect(result.current.isSearching).toBe(false);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith('abc');
    });

    test('should not call callback for empty strings when skipEmpty is true', () => {
      const { result } = renderHook(() => useDebouncedSearch(mockCallback, 300, true));
      
      act(() => {
        result.current.setSearchTerm('test');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockCallback).toHaveBeenCalledWith('test');
      mockCallback.mockClear();

      // Set to empty
      act(() => {
        result.current.setSearchTerm('');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('should call callback for empty strings when skipEmpty is false', () => {
      const { result } = renderHook(() => useDebouncedSearch(mockCallback, 300, false));
      
      act(() => {
        result.current.setSearchTerm('test');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockCallback).toHaveBeenCalledWith('test');
      mockCallback.mockClear();

      // Set to empty
      act(() => {
        result.current.setSearchTerm('');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockCallback).toHaveBeenCalledWith('');
    });

    test('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { result } = renderHook(() => useDebouncedSearch(errorCallback, 300));
      
      act(() => {
        result.current.setSearchTerm('test');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(errorCallback).toHaveBeenCalled();
      expect(result.current.isSearching).toBe(false);
      
      consoleError.mockRestore();
    });
  });

  describe('useDebounceMultiple', () => {
    test('should handle multiple values', () => {
      const initialValues = { name: '', email: '' };
      const { result } = renderHook(() => useDebounceMultiple(initialValues, 300));
      
      act(() => {
        result.current.setValue('name', 'John');
      });

      expect(result.current.values.name).toBe('John');
      expect(result.current.debouncedValues.name).toBe('');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.debouncedValues.name).toBe('John');
    });

    test('should update individual values immediately but debounce together', () => {
      const initialValues = { name: '', email: '' };
      const { result } = renderHook(() => useDebounceMultiple(initialValues, 300));
      
      act(() => {
        result.current.setValue('name', 'John');
      });

      expect(result.current.values.name).toBe('John');
      expect(result.current.debouncedValues.name).toBe('');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.debouncedValues.name).toBe('John');
    });

    test('should handle multiple field updates', () => {
      const initialValues = { name: '', email: '', phone: '' };
      const { result } = renderHook(() => useDebounceMultiple(initialValues, 300));
      
      // Update multiple fields rapidly
      act(() => {
        result.current.setValue('name', 'John');
      });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      act(() => {
        result.current.setValue('email', 'john@example.com');
      });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      act(() => {
        result.current.setValue('phone', '123-456-7890');
      });

      // Values should be updated immediately
      expect(result.current.values).toEqual({
        name: 'John',
        email: 'john@example.com',
        phone: '123-456-7890'
      });

      // Debounced values should still be initial
      expect(result.current.debouncedValues).toEqual(initialValues);

      // Complete debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.debouncedValues).toEqual({
        name: 'John',
        email: 'john@example.com',
        phone: '123-456-7890'
      });
    });

    test('should reset all values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' };
      const { result } = renderHook(() => useDebounceMultiple(initialValues, 300));
      
      // Update values
      act(() => {
        result.current.setValue('name', 'Jane');
        result.current.setValue('email', 'jane@example.com');
      });

      expect(result.current.values).toEqual({
        name: 'Jane',
        email: 'jane@example.com'
      });

      // Reset
      act(() => {
        result.current.resetValues();
      });

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.debouncedValues).toEqual(initialValues);
    });

    test('should reset timer on subsequent value changes', () => {
      const initialValues = { name: '' };
      const { result } = renderHook(() => useDebounceMultiple(initialValues, 500));
      
      // First change
      act(() => {
        result.current.setValue('name', 'John');
      });
      
      // Advance time partially
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(result.current.debouncedValues.name).toBe('');

      // Second change (should reset timer)
      act(() => {
        result.current.setValue('name', 'Jane');
      });
      
      // Advance remaining time from first change
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      expect(result.current.debouncedValues.name).toBe('');

      // Advance full delay for second change
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(result.current.debouncedValues.name).toBe('Jane');
    });

    test('should handle unknown field updates gracefully', () => {
      const initialValues = { name: 'John' };
      const { result } = renderHook(() => useDebounceMultiple(initialValues, 300));
      
      // Try to update unknown field
      act(() => {
        result.current.setValue('unknownField' as any, 'value');
      });

      // Should not crash and should add the field
      expect(result.current.values).toEqual({
        name: 'John',
        unknownField: 'value'
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle changing delay dynamically in useDebounce', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      // Change value
      rerender({ value: 'changed', delay: 500 });
      
      // Change delay mid-debounce
      rerender({ value: 'changed', delay: 1000 });
      
      // Advance original delay time
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      expect(result.current).toBe('initial');
      
      // Advance remaining time for new delay
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      expect(result.current).toBe('changed');
    });

    test('should handle very large delays', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: Number.MAX_SAFE_INTEGER } }
      );

      rerender({ value: 'changed', delay: Number.MAX_SAFE_INTEGER });
      
      // Should not crash with very large delays
      expect(result.current).toBe('initial');
    });

    test('should handle multiple hooks independently', () => {
      const { result: result1 } = renderHook(() => useDebounce('value1', 300));
      const { result: result2 } = renderHook(() => useDebounce('value2', 500));
      
      expect(result1.current).toBe('value1');
      expect(result2.current).toBe('value2');
    });
  });
}); 