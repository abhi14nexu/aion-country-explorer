import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  isAuthenticated: boolean;
  favorites: string[];
  login: () => void;
  logout: () => void;
  toggleFavorite: (code: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      favorites: [],

      // Actions
      login: () => {
        set({ isAuthenticated: true });
      },

      logout: () => {
        set({ 
          isAuthenticated: false,
          favorites: [] // Clear favorites on logout
        });
      },

      toggleFavorite: (code: string) => {
        const { favorites } = get();
        const isCurrentlyFavorited = favorites.includes(code);
        
        if (isCurrentlyFavorited) {
          // Remove from favorites
          set({
            favorites: favorites.filter(fav => fav !== code)
          });
        } else {
          // Add to favorites
          set({
            favorites: [...favorites, code]
          });
        }
      },
    }),
    {
      name: 'aion-country-explorer-storage', // Key for localStorage
      // Only persist favorites and auth state
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        favorites: state.favorites,
      }),
    }
  )
); 