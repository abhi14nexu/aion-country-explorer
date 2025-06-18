import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '@/store/appStore';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AppStore', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset store state
    useAppStore.setState({
      isAuthenticated: false,
      favorites: [],
      recentlyAdded: [],
      favoritesMetadata: {},
    });
  });

  describe('Authentication', () => {
    test('should initially be unauthenticated', () => {
      const { result } = renderHook(() => useAppStore());
      expect(result.current.isAuthenticated).toBe(false);
    });

    test('should authenticate user on login', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.login();
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    test('should logout user and clear favorites', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Set up authenticated state with favorites
      act(() => {
        result.current.login();
        result.current.addToFavorites('us');
        result.current.addToFavorites('ca');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.favorites).toHaveLength(2);

      // Logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.favorites).toHaveLength(0);
      expect(result.current.recentlyAdded).toHaveLength(0);
      expect(result.current.favoritesMetadata).toEqual({});
    });
  });

  describe('Favorites Management', () => {
    test('should add country to favorites', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.addToFavorites('us');
      });

      expect(result.current.favorites).toContain('us');
      expect(result.current.recentlyAdded).toContain('us');
      expect(result.current.favoritesMetadata.us).toBeDefined();
      expect(result.current.favoritesMetadata.us.addedAt).toBeGreaterThan(0);
    });

    test('should add country with notes', () => {
      const { result } = renderHook(() => useAppStore());
      const testNote = 'Great place to visit';
      
      act(() => {
        result.current.addToFavorites('us', testNote);
      });

      expect(result.current.favorites).toContain('us');
      expect(result.current.favoritesMetadata.us.notes).toBe(testNote);
    });

    test('should not add duplicate favorites', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.addToFavorites('us');
        result.current.addToFavorites('us'); // Try to add again
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites.filter(fav => fav === 'us')).toHaveLength(1);
    });

    test('should remove country from favorites', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Add first
      act(() => {
        result.current.addToFavorites('us');
        result.current.addToFavorites('ca');
      });

      expect(result.current.favorites).toHaveLength(2);

      // Remove one
      act(() => {
        result.current.removeFromFavorites('us');
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites).not.toContain('us');
      expect(result.current.favorites).toContain('ca');
      expect(result.current.favoritesMetadata.us).toBeUndefined();
      expect(result.current.recentlyAdded).not.toContain('us');
    });

    test('should toggle favorites correctly', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Toggle to add
      act(() => {
        result.current.toggleFavorite('us');
      });

      expect(result.current.favorites).toContain('us');
      expect(result.current.favoritesMetadata.us).toBeDefined();

      // Toggle to remove
      act(() => {
        result.current.toggleFavorite('us');
      });

      expect(result.current.favorites).not.toContain('us');
      expect(result.current.favoritesMetadata.us).toBeUndefined();
    });

    test('should normalize country codes to lowercase', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.addToFavorites('US'); // Uppercase
      });

      expect(result.current.favorites).toContain('us'); // Should be lowercase
      expect(result.current.favoritesMetadata.us).toBeDefined();
    });
  });

  describe('Notes Management', () => {
    test('should add note to existing favorite', () => {
      const { result } = renderHook(() => useAppStore());
      const testNote = 'Beautiful country';
      
      // Add favorite first
      act(() => {
        result.current.addToFavorites('us');
      });

      // Add note
      act(() => {
        result.current.addFavoriteNote('us', testNote);
      });

      expect(result.current.favoritesMetadata.us.notes).toBe(testNote);
    });

    test('should update existing note', () => {
      const { result } = renderHook(() => useAppStore());
      const originalNote = 'Nice place';
      const updatedNote = 'Amazing destination';
      
      // Add favorite with note
      act(() => {
        result.current.addToFavorites('us', originalNote);
      });

      expect(result.current.favoritesMetadata.us.notes).toBe(originalNote);

      // Update note
      act(() => {
        result.current.addFavoriteNote('us', updatedNote);
      });

      expect(result.current.favoritesMetadata.us.notes).toBe(updatedNote);
    });

    test('should remove note from favorite', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Add favorite with note
      act(() => {
        result.current.addToFavorites('us', 'Test note');
      });

      expect(result.current.favoritesMetadata.us.notes).toBe('Test note');

      // Remove note
      act(() => {
        result.current.removeFavoriteNote('us');
      });

      expect(result.current.favoritesMetadata.us.notes).toBeUndefined();
      expect(result.current.favoritesMetadata.us.addedAt).toBeDefined(); // Other metadata should remain
    });

    test('should not add note to non-existent favorite', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.addFavoriteNote('nonexistent', 'Test note');
      });

      expect(result.current.favoritesMetadata.nonexistent).toBeUndefined();
    });
  });

  describe('Recently Added', () => {
    test('should track recently added countries', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.addToFavorites('us');
        result.current.addToFavorites('ca');
        result.current.addToFavorites('mx');
      });

      const recent = result.current.getRecentlyAdded();
      expect(recent).toHaveLength(3);
      expect(recent[0]).toBe('mx'); // Most recent first
      expect(recent[1]).toBe('ca');
      expect(recent[2]).toBe('us');
    });

    test('should limit recently added to specified count', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Add more countries than the limit
      const countries = ['us', 'ca', 'mx', 'br', 'ar', 'pe'];
      act(() => {
        countries.forEach(country => result.current.addToFavorites(country));
      });

      const recent = result.current.getRecentlyAdded(3);
      expect(recent).toHaveLength(3);
      expect(recent[0]).toBe('pe'); // Most recent
    });

    test('should maintain recently added order when re-adding', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.addToFavorites('us');
        result.current.addToFavorites('ca');
        result.current.addToFavorites('us'); // Re-add (should move to front)
      });

      const recent = result.current.getRecentlyAdded();
      expect(recent[0]).toBe('us'); // Should be first now
      expect(recent[1]).toBe('ca');
      expect(recent).toHaveLength(2); // No duplicates
    });

    test('should limit recently added queue to 10 items', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Add 12 countries
      const countries = Array.from({ length: 12 }, (_, i) => `country${i}`);
      act(() => {
        countries.forEach(country => result.current.addToFavorites(country));
      });

      expect(result.current.recentlyAdded).toHaveLength(10);
      expect(result.current.recentlyAdded[0]).toBe('country11'); // Most recent
      expect(result.current.recentlyAdded[9]).toBe('country2'); // Oldest in queue
    });
  });

  describe('Bulk Operations', () => {
    test('should clear all favorites', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Add some favorites
      act(() => {
        result.current.addToFavorites('us');
        result.current.addToFavorites('ca');
        result.current.addToFavorites('mx');
      });

      expect(result.current.favorites).toHaveLength(3);
      expect(result.current.recentlyAdded).toHaveLength(3);
      expect(Object.keys(result.current.favoritesMetadata)).toHaveLength(3);

      // Clear all
      act(() => {
        result.current.clearAllFavorites();
      });

      expect(result.current.favorites).toHaveLength(0);
      expect(result.current.recentlyAdded).toHaveLength(0);
      expect(result.current.favoritesMetadata).toEqual({});
    });

    test('should get favorites sorted by date', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Add favorites with different timestamps
      act(() => {
        result.current.addToFavorites('us');
      });
      
      // Wait a bit and add another
      setTimeout(() => {
        act(() => {
          result.current.addToFavorites('ca');
        });
      }, 10);

      setTimeout(() => {
        act(() => {
          result.current.addToFavorites('mx');
        });
      }, 20);

      const sortedDesc = result.current.getFavoritesByDate(false); // Newest first
      const sortedAsc = result.current.getFavoritesByDate(true);   // Oldest first

      expect(sortedDesc[0]).toBe('mx'); // Newest
      expect(sortedAsc[0]).toBe('us');  // Oldest
    });
  });

  describe('Export/Import', () => {
    test('should export favorites as JSON', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Add some favorites with notes
      act(() => {
        result.current.addToFavorites('us', 'Great country');
        result.current.addToFavorites('ca');
      });

      const exportedData = result.current.exportFavorites();
      const parsed = JSON.parse(exportedData);

      expect(parsed.version).toBe('1.0');
      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.favorites).toHaveLength(2);
      expect(parsed.favorites[0].code).toBe('us');
      expect(parsed.favorites[0].notes).toBe('Great country');
      expect(parsed.favorites[0].addedAt).toBeDefined();
    });

    test('should import favorites successfully', () => {
      const { result } = renderHook(() => useAppStore());
      
      const importData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        favorites: [
          { code: 'us', addedAt: Date.now(), notes: 'Test note' },
          { code: 'ca', addedAt: Date.now() }
        ]
      };

      const success = result.current.importFavorites(JSON.stringify(importData));

      expect(success).toBe(true);
      expect(result.current.favorites).toContain('us');
      expect(result.current.favorites).toContain('ca');
      expect(result.current.favoritesMetadata.us.notes).toBe('Test note');
    });

    test('should reject invalid import data', () => {
      const { result } = renderHook(() => useAppStore());
      
      const invalidData = { invalid: 'data' };
      const success = result.current.importFavorites(JSON.stringify(invalidData));

      expect(success).toBe(false);
      expect(result.current.favorites).toHaveLength(0);
    });

    test('should handle malformed JSON gracefully', () => {
      const { result } = renderHook(() => useAppStore());
      
      const success = result.current.importFavorites('invalid json');

      expect(success).toBe(false);
      expect(result.current.favorites).toHaveLength(0);
    });

    test('should merge imported favorites with existing ones', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Add existing favorite
      act(() => {
        result.current.addToFavorites('us');
      });

      // Import additional favorites
      const importData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        favorites: [
          { code: 'ca', addedAt: Date.now() },
          { code: 'mx', addedAt: Date.now() }
        ]
      };

      const success = result.current.importFavorites(JSON.stringify(importData));

      expect(success).toBe(true);
      expect(result.current.favorites).toHaveLength(3);
      expect(result.current.favorites).toContain('us');
      expect(result.current.favorites).toContain('ca');
      expect(result.current.favorites).toContain('mx');
    });

    test('should not import duplicate favorites', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Add existing favorite
      act(() => {
        result.current.addToFavorites('us');
      });

      // Try to import the same favorite
      const importData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        favorites: [
          { code: 'us', addedAt: Date.now() },
          { code: 'ca', addedAt: Date.now() }
        ]
      };

      const success = result.current.importFavorites(JSON.stringify(importData));

      expect(success).toBe(true);
      expect(result.current.favorites).toHaveLength(2); // Should only add 'ca'
      expect(result.current.favorites.filter(fav => fav === 'us')).toHaveLength(1);
    });
  });
}); 