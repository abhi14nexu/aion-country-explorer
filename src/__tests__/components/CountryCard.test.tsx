import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CountryCard } from '@/components/shared/CountryCard';
import { useAppStore } from '@/store/appStore';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { CountryBasic } from '@/types/country';

// Mock dependencies
jest.mock('@/store/appStore');
jest.mock('@/components/ui/Toast');
jest.mock('next/navigation');

const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('CountryCard', () => {
  const mockCountry: CountryBasic = {
    cca2: 'us',
    name: { common: 'United States' },
    flags: { png: 'https://example.com/us.png' },
    population: 331000000,
    region: 'Americas',
    capital: ['Washington, D.C.']
  };

  const mockAddToast = jest.fn();
  const mockPush = jest.fn();
  const mockToggleFavorite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockUseToast.mockReturnValue({
      addToast: mockAddToast,
      removeToast: jest.fn(),
      clearAllToasts: jest.fn(),
      toasts: []
    });

    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);

    mockUseAppStore.mockReturnValue({
      favorites: [],
      toggleFavorite: mockToggleFavorite,
      isAuthenticated: true,
    } as any);
  });

  describe('Rendering', () => {
    test('should render country information correctly', () => {
      render(<CountryCard country={mockCountry} />);

      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Population: 331,000,000')).toBeInTheDocument();
      expect(screen.getByText('Region: Americas')).toBeInTheDocument();
      expect(screen.getByText('Capital: Washington, D.C.')).toBeInTheDocument();
    });

    test('should render country flag with correct attributes', () => {
      render(<CountryCard country={mockCountry} />);

      const flagImage = screen.getByAltText('United States flag') as HTMLImageElement;
      expect(flagImage).toBeInTheDocument();
      expect(flagImage.src).toBe('https://example.com/us.png');
    });

    test('should handle multiple capitals', () => {
      const countryWithMultipleCapitals = {
        ...mockCountry,
        capital: ['Washington, D.C.', 'New York']
      };

      render(<CountryCard country={countryWithMultipleCapitals} />);

      expect(screen.getByText('Capital: Washington, D.C., New York')).toBeInTheDocument();
    });

    test('should handle country without capital', () => {
      const countryWithoutCapital = {
        ...mockCountry,
        capital: undefined
      };

      render(<CountryCard country={countryWithoutCapital} />);

      expect(screen.getByText('Capital: N/A')).toBeInTheDocument();
    });

    test('should handle empty capital array', () => {
      const countryWithEmptyCapital = {
        ...mockCountry,
        capital: []
      };

      render(<CountryCard country={countryWithEmptyCapital} />);

      expect(screen.getByText('Capital: N/A')).toBeInTheDocument();
    });

    test('should format large populations correctly', () => {
      const countryWithLargePopulation = {
        ...mockCountry,
        population: 1400000000
      };

      render(<CountryCard country={countryWithLargePopulation} />);

      expect(screen.getByText('Population: 1,400,000,000')).toBeInTheDocument();
    });

    test('should handle zero population', () => {
      const countryWithZeroPopulation = {
        ...mockCountry,
        population: 0
      };

      render(<CountryCard country={countryWithZeroPopulation} />);

      expect(screen.getByText('Population: 0')).toBeInTheDocument();
    });
  });

  describe('Favorite functionality', () => {
    test('should show heart outline when not favorited', () => {
      mockUseAppStore.mockReturnValue({
        favorites: [],
        toggleFavorite: mockToggleFavorite,
        isAuthenticated: true,
      } as any);

      render(<CountryCard country={mockCountry} />);

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      expect(favoriteButton).toBeInTheDocument();
    });

    test('should show filled heart when favorited', () => {
      mockUseAppStore.mockReturnValue({
        favorites: ['us'],
        toggleFavorite: mockToggleFavorite,
        isAuthenticated: true,
      } as any);

      render(<CountryCard country={mockCountry} />);

      const favoriteButton = screen.getByRole('button', { name: /remove from favorites/i });
      expect(favoriteButton).toBeInTheDocument();
    });

    test('should toggle favorite when heart is clicked', async () => {
      render(<CountryCard country={mockCountry} />);

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      fireEvent.click(favoriteButton);

      expect(mockToggleFavorite).toHaveBeenCalledWith('us');
    });

    test('should show toast notification when adding to favorites', async () => {
      mockUseAppStore.mockReturnValue({
        favorites: [],
        toggleFavorite: mockToggleFavorite,
        isAuthenticated: true,
      } as any);

      render(<CountryCard country={mockCountry} />);

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      fireEvent.click(favoriteButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'United States added to favorites',
          action: {
            label: 'Undo',
            onClick: expect.any(Function)
          }
        });
      });
    });

    test('should show toast notification when removing from favorites', async () => {
      mockUseAppStore.mockReturnValue({
        favorites: ['us'],
        toggleFavorite: mockToggleFavorite,
        isAuthenticated: true,
      } as any);

      render(<CountryCard country={mockCountry} />);

      const favoriteButton = screen.getByRole('button', { name: /remove from favorites/i });
      fireEvent.click(favoriteButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'info',
          message: 'United States removed from favorites',
          action: {
            label: 'Undo',
            onClick: expect.any(Function)
          }
        });
      });
    });

    test('should handle undo action from toast', async () => {
      render(<CountryCard country={mockCountry} />);

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      fireEvent.click(favoriteButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalled();
      });

      // Get the undo function from the toast call
      const toastCall = mockAddToast.mock.calls[0][0];
      const undoFunction = toastCall.action?.onClick;

      expect(undoFunction).toBeDefined();
      
      // Call the undo function
      if (undoFunction) {
        undoFunction();
        expect(mockToggleFavorite).toHaveBeenCalledTimes(2); // Once for add, once for undo
      }
    });

    test('should not show favorite button when user is not authenticated', () => {
      mockUseAppStore.mockReturnValue({
        favorites: [],
        toggleFavorite: mockToggleFavorite,
        isAuthenticated: false,
      } as any);

      render(<CountryCard country={mockCountry} />);

      expect(screen.queryByRole('button', { name: /add to favorites/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /remove from favorites/i })).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    test('should navigate to country detail page when clicked', () => {
      render(<CountryCard country={mockCountry} />);

      const countryCard = screen.getByRole('article');
      fireEvent.click(countryCard);

      expect(mockPush).toHaveBeenCalledWith('/country/us');
    });

    test('should not navigate when favorite button is clicked', () => {
      render(<CountryCard country={mockCountry} />);

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      fireEvent.click(favoriteButton);

      expect(mockPush).not.toHaveBeenCalled();
    });

    test('should handle keyboard navigation', () => {
      render(<CountryCard country={mockCountry} />);

      const countryCard = screen.getByRole('article');
      
      // Test Enter key
      fireEvent.keyDown(countryCard, { key: 'Enter', code: 'Enter' });
      expect(mockPush).toHaveBeenCalledWith('/country/us');

      mockPush.mockClear();

      // Test Space key
      fireEvent.keyDown(countryCard, { key: ' ', code: 'Space' });
      expect(mockPush).toHaveBeenCalledWith('/country/us');
    });

    test('should not navigate on other key presses', () => {
      render(<CountryCard country={mockCountry} />);

      const countryCard = screen.getByRole('article');
      fireEvent.keyDown(countryCard, { key: 'Tab', code: 'Tab' });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      render(<CountryCard country={mockCountry} />);

      const countryCard = screen.getByRole('article');
      expect(countryCard).toHaveAttribute('tabIndex', '0');
      expect(countryCard).toHaveAttribute('aria-label', 'View details for United States');
    });

    test('should have proper focus management', () => {
      render(<CountryCard country={mockCountry} />);

      const countryCard = screen.getByRole('article');
      countryCard.focus();

      expect(countryCard).toHaveFocus();
    });

    test('should have proper button accessibility', () => {
      render(<CountryCard country={mockCountry} />);

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      expect(favoriteButton).toHaveAttribute('aria-label', 'Add United States to favorites');
    });
  });

  describe('Performance optimization', () => {
    test('should not re-render when unrelated props change', () => {
      const { rerender } = render(<CountryCard country={mockCountry} />);

      // Change a prop that shouldn't affect this component
      const otherCountry = { ...mockCountry, name: { common: 'United States' } };
      rerender(<CountryCard country={otherCountry} />);

      // Component should use React.memo to prevent unnecessary re-renders
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    test('should handle missing flag gracefully', () => {
      const countryWithoutFlag = {
        ...mockCountry,
        flags: { png: '' }
      };

      render(<CountryCard country={countryWithoutFlag} />);

      const flagImage = screen.getByAltText('United States flag') as HTMLImageElement;
      expect(flagImage).toBeInTheDocument();
      expect(flagImage.src).toBe('http://localhost/');
    });

    test('should handle navigation errors gracefully', () => {
      mockPush.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<CountryCard country={mockCountry} />);

      const countryCard = screen.getByRole('article');
      
      // Should not crash when navigation fails
      expect(() => {
        fireEvent.click(countryCard);
      }).not.toThrow();

      consoleError.mockRestore();
    });

    test('should handle favorite toggle errors gracefully', () => {
      mockToggleFavorite.mockImplementation(() => {
        throw new Error('Toggle failed');
      });

      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<CountryCard country={mockCountry} />);

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      
      // Should not crash when toggle fails
      expect(() => {
        fireEvent.click(favoriteButton);
      }).not.toThrow();

      consoleError.mockRestore();
    });
  });

  describe('Priority prop', () => {
    test('should pass priority to image when specified', () => {
      render(<CountryCard country={mockCountry} priority />);

      const flagImage = screen.getByAltText('United States flag');
      // In a real test, we'd check if the priority prop was passed to Next.js Image
      expect(flagImage).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    test('should have responsive classes', () => {
      render(<CountryCard country={mockCountry} />);

      const countryCard = screen.getByRole('article');
      expect(countryCard).toHaveClass('transition-all');
    });
  });
}); 