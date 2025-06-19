import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  isAuthenticated: boolean;
  favorites: string[];
  recentlyAdded: string[];
  favoritesMetadata: Record<string, { addedAt: number; notes?: string }>;
  login: () => void;
  logout: () => void;
  toggleFavorite: (code: string) => void;
  addToFavorites: (code: string, notes?: string) => void;
  removeFromFavorites: (code: string) => void;
  addFavoriteNote: (code: string, note: string) => void;
  removeFavoriteNote: (code: string) => void;
  clearAllFavorites: () => void;
  exportFavorites: () => string;
  importFavorites: (jsonData: string) => boolean;
  getRecentlyAdded: (limit?: number) => string[];
  getFavoritesByDate: (ascending?: boolean) => string[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      favorites: [],
      recentlyAdded: [],
      favoritesMetadata: {},

      // Actions
      login: () => {
        // Set authentication cookie for middleware compatibility
        if (typeof document !== 'undefined') {
          document.cookie = 'aion-auth=authenticated; path=/; max-age=86400'; // 24 hours
        }
        set({ isAuthenticated: true });
      },

      logout: () => {
        // Clear authentication cookie
        if (typeof document !== 'undefined') {
          document.cookie = 'aion-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        }
        set({ 
          isAuthenticated: false,
          favorites: [], // Clear favorites on logout
          recentlyAdded: [],
          favoritesMetadata: {}
        });
      },

      toggleFavorite: (code: string) => {
        const { favorites, favoritesMetadata, recentlyAdded } = get();
        const normalizedCode = code.toLowerCase();
        const isCurrentlyFavorited = favorites.includes(normalizedCode);
        
        if (isCurrentlyFavorited) {
          // Remove from favorites
          const newFavorites = favorites.filter(fav => fav !== normalizedCode);
          const newMetadata = { ...favoritesMetadata };
          delete newMetadata[normalizedCode];
          
          set({
            favorites: newFavorites,
            favoritesMetadata: newMetadata,
            recentlyAdded: recentlyAdded.filter(code => code !== normalizedCode)
          });
        } else {
          // Add to favorites
          const now = Date.now();
          const newRecentlyAdded = [normalizedCode, ...recentlyAdded.filter(c => c !== normalizedCode)].slice(0, 10);
          
          set({
            favorites: [...favorites, normalizedCode],
            favoritesMetadata: {
              ...favoritesMetadata,
              [normalizedCode]: { addedAt: now }
            },
            recentlyAdded: newRecentlyAdded
          });
        }
      },

      addToFavorites: (code: string, notes?: string) => {
        const { favorites, favoritesMetadata, recentlyAdded } = get();
        const normalizedCode = code.toLowerCase();
        
        if (!favorites.includes(normalizedCode)) {
          const now = Date.now();
          const newRecentlyAdded = [normalizedCode, ...recentlyAdded.filter(c => c !== normalizedCode)].slice(0, 10);
          
          set({
            favorites: [...favorites, normalizedCode],
            favoritesMetadata: {
              ...favoritesMetadata,
              [normalizedCode]: { addedAt: now, notes }
            },
            recentlyAdded: newRecentlyAdded
          });
        }
      },

      removeFromFavorites: (code: string) => {
        const { favorites, favoritesMetadata, recentlyAdded } = get();
        const normalizedCode = code.toLowerCase();
        
        if (favorites.includes(normalizedCode)) {
          const newFavorites = favorites.filter(fav => fav !== normalizedCode);
          const newMetadata = { ...favoritesMetadata };
          delete newMetadata[normalizedCode];
          
          set({
            favorites: newFavorites,
            favoritesMetadata: newMetadata,
            recentlyAdded: recentlyAdded.filter(code => code !== normalizedCode)
          });
        }
      },

      addFavoriteNote: (code: string, note: string) => {
        const { favoritesMetadata } = get();
        const normalizedCode = code.toLowerCase();
        
        if (favoritesMetadata[normalizedCode]) {
          set({
            favoritesMetadata: {
              ...favoritesMetadata,
              [normalizedCode]: {
                ...favoritesMetadata[normalizedCode],
                notes: note
              }
            }
          });
        }
      },

      removeFavoriteNote: (code: string) => {
        const { favoritesMetadata } = get();
        const normalizedCode = code.toLowerCase();
        
        if (favoritesMetadata[normalizedCode]) {
          const updatedMetadata = { ...favoritesMetadata[normalizedCode] };
          delete updatedMetadata.notes;
          
          set({
            favoritesMetadata: {
              ...favoritesMetadata,
              [normalizedCode]: updatedMetadata
            }
          });
        }
      },

      clearAllFavorites: () => {
        set({
          favorites: [],
          recentlyAdded: [],
          favoritesMetadata: {}
        });
      },

      exportFavorites: () => {
        const { favorites, favoritesMetadata } = get();
        
        const exportData = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          favorites: favorites.map(code => ({
            code,
            addedAt: favoritesMetadata[code]?.addedAt || Date.now(),
            notes: favoritesMetadata[code]?.notes
          }))
        };
        
        return JSON.stringify(exportData, null, 2);
      },

      importFavorites: (jsonData: string) => {
        try {
          const importData = JSON.parse(jsonData);
          
          // Validate import data structure
          if (!importData.favorites || !Array.isArray(importData.favorites)) {
            return false;
          }
          
          const { favorites: currentFavorites, favoritesMetadata: currentMetadata } = get();
          const newFavorites = [...currentFavorites];
          const newMetadata = { ...currentMetadata };
          let addedCount = 0;
          
          importData.favorites.forEach((item: { code?: string; addedAt?: number; notes?: string }) => {
            if (item.code && typeof item.code === 'string') {
              const normalizedCode = item.code.toLowerCase();
              
              if (!newFavorites.includes(normalizedCode)) {
                newFavorites.push(normalizedCode);
                newMetadata[normalizedCode] = {
                  addedAt: item.addedAt || Date.now(),
                  notes: item.notes
                };
                addedCount++;
              }
            }
          });
          
          if (addedCount > 0) {
            const newRecentlyAdded = newFavorites.slice(-10).reverse();
            
            set({
              favorites: newFavorites,
              favoritesMetadata: newMetadata,
              recentlyAdded: newRecentlyAdded
            });
          }
          
          return true;
        } catch (error) {
          console.error('Failed to import favorites:', error);
          return false;
        }
      },

      getRecentlyAdded: (limit = 5) => {
        const { recentlyAdded } = get();
        return recentlyAdded.slice(0, limit);
      },

      getFavoritesByDate: (ascending = false) => {
        const { favorites, favoritesMetadata } = get();
        
        return [...favorites].sort((a, b) => {
          const aTime = favoritesMetadata[a]?.addedAt || 0;
          const bTime = favoritesMetadata[b]?.addedAt || 0;
          return ascending ? aTime - bTime : bTime - aTime;
        });
      },
    }),
    {
      name: 'aion-country-explorer-storage', // Key for localStorage
      // Persist all state except auth when logging out
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        favorites: state.favorites,
        recentlyAdded: state.recentlyAdded,
        favoritesMetadata: state.favoritesMetadata,
      }),
    }
  )
); 