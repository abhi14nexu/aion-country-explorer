import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// We'll need to create a mock component that simulates the auth flow
const MockLoginPage = () => {
  const { login } = useAppStore();
  const router = useRouter();
  
  const handleLogin = () => {
    login();
    (router as any).push('/');
  };

  return (
    <div>
      <h1>Login Page</h1>
      <button onClick={handleLogin}>Sign In</button>
    </div>
  );
};

const MockProtectedPage = () => {
  const { isAuthenticated, logout } = useAppStore();
  const router = useRouter();
  
  if (!isAuthenticated) {
    (router as any).push('/login');
    return <div>Redirecting...</div>;
  }

  const handleLogout = () => {
    logout();
    (router as any).push('/login');
  };

  return (
    <div>
      <h1>Protected Content</h1>
      <button onClick={handleLogout}>Sign Out</button>
    </div>
  );
};

describe('Authentication Flow Integration', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset store state
    useAppStore.setState({
      isAuthenticated: false,
      favorites: [],
      recentlyAdded: [],
      favoritesMetadata: {},
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  describe('Login Flow', () => {
    test('should allow user to login and navigate to protected content', async () => {
      // Start at login page
      const { rerender } = render(<MockLoginPage />);
      
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();

      // Click login button
      fireEvent.click(screen.getByText('Sign In'));

      // Check that login was called and navigation occurred
      expect(mockPush).toHaveBeenCalledWith('/');

      // Simulate navigation to protected page
      rerender(<MockProtectedPage />);

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    test('should redirect unauthenticated users from protected pages', () => {
      // Try to access protected page without authentication
      render(<MockProtectedPage />);

      expect(screen.getByText('Redirecting...')).toBeInTheDocument();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('Logout Flow', () => {
    test('should logout user and redirect to login page', async () => {
      // Start with authenticated user
      useAppStore.setState({ isAuthenticated: true });
      
      const { rerender } = render(<MockProtectedPage />);
      
      expect(screen.getByText('Protected Content')).toBeInTheDocument();

      // Click logout
      fireEvent.click(screen.getByText('Sign Out'));

      // Should redirect to login
      expect(mockPush).toHaveBeenCalledWith('/login');

      // Simulate navigation to login page
      rerender(<MockLoginPage />);

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  describe('Authentication State Persistence', () => {
    test('should maintain authentication state across page changes', () => {
      // Login
      const { rerender } = render(<MockLoginPage />);
      fireEvent.click(screen.getByText('Sign In'));

      // Navigate to protected page
      rerender(<MockProtectedPage />);
      expect(screen.getByText('Protected Content')).toBeInTheDocument();

      // Navigate to another page (simulated)
      rerender(<MockProtectedPage />);
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});

describe('Favorites Integration Flow', () => {
  beforeEach(() => {
    // Start with authenticated user
    useAppStore.setState({ 
      isAuthenticated: true,
      favorites: [],
      recentlyAdded: [],
      favoritesMetadata: {},
    });
  });

  const MockCountryCard = ({ countryCode }: { countryCode: string }) => {
    const { favorites, toggleFavorite } = useAppStore();
    const isFavorite = favorites.includes(countryCode);

    return (
      <div>
        <h3>Country: {countryCode.toUpperCase()}</h3>
        <button 
          onClick={() => toggleFavorite(countryCode)}
          data-testid={`favorite-${countryCode}`}
        >
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
      </div>
    );
  };

  const MockFavoritesPage = () => {
    const { favorites } = useAppStore();

    return (
      <div>
        <h1>My Favorites</h1>
        {favorites.length === 0 ? (
          <p>No favorites yet</p>
        ) : (
          <ul>
            {favorites.map(country => (
              <li key={country}>{country.toUpperCase()}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  test('should allow adding and removing favorites', async () => {
    const { rerender } = render(
      <div>
        <MockCountryCard countryCode="us" />
        <MockCountryCard countryCode="ca" />
        <MockFavoritesPage />
      </div>
    );

    // Initially no favorites
    expect(screen.getByText('No favorites yet')).toBeInTheDocument();

    // Add US to favorites
    fireEvent.click(screen.getByTestId('favorite-us'));

    // Re-render to see updated state
    rerender(
      <div>
        <MockCountryCard countryCode="us" />
        <MockCountryCard countryCode="ca" />
        <MockFavoritesPage />
      </div>
    );

    expect(screen.getByText('Remove from Favorites')).toBeInTheDocument();
    expect(screen.getByText('US')).toBeInTheDocument();

    // Add Canada to favorites
    fireEvent.click(screen.getByTestId('favorite-ca'));

    rerender(
      <div>
        <MockCountryCard countryCode="us" />
        <MockCountryCard countryCode="ca" />
        <MockFavoritesPage />
      </div>
    );

    expect(screen.getByText('US')).toBeInTheDocument();
    expect(screen.getByText('CA')).toBeInTheDocument();

    // Remove US from favorites
    fireEvent.click(screen.getByTestId('favorite-us'));

    rerender(
      <div>
        <MockCountryCard countryCode="us" />
        <MockCountryCard countryCode="ca" />
        <MockFavoritesPage />
      </div>
    );

    expect(screen.queryByText('US')).not.toBeInTheDocument();
    expect(screen.getByText('CA')).toBeInTheDocument();
  });

  test('should clear all favorites on logout', () => {
    // Add some favorites
    const { toggleFavorite, logout } = useAppStore.getState();
    toggleFavorite('us');
    toggleFavorite('ca');

    // Verify favorites exist
    expect(useAppStore.getState().favorites).toEqual(['us', 'ca']);

    // Logout
    logout();

    // Favorites should be cleared
    expect(useAppStore.getState().favorites).toEqual([]);
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });
});

describe('Search and Filter Integration', () => {
  const mockCountries = [
    { cca2: 'us', name: { common: 'United States' }, region: 'Americas', population: 331000000 },
    { cca2: 'ca', name: { common: 'Canada' }, region: 'Americas', population: 38000000 },
    { cca2: 'de', name: { common: 'Germany' }, region: 'Europe', population: 83000000 },
    { cca2: 'jp', name: { common: 'Japan' }, region: 'Asia', population: 125000000 },
  ];

  const MockSearchableCountryList = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedRegion, setSelectedRegion] = React.useState('');

    const filteredCountries = mockCountries.filter(country => {
      const matchesSearch = country.name.common.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = !selectedRegion || country.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });

    return (
      <div>
        <input
          type="text"
          placeholder="Search countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="search-input"
        />
        
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          data-testid="region-filter"
        >
          <option value="">All Regions</option>
          <option value="Americas">Americas</option>
          <option value="Europe">Europe</option>
          <option value="Asia">Asia</option>
        </select>

        <div data-testid="results-count">
          Found {filteredCountries.length} countries
        </div>

        <ul>
          {filteredCountries.map(country => (
            <li key={country.cca2}>{country.name.common}</li>
          ))}
        </ul>
      </div>
    );
  };

  test('should filter countries by search term', async () => {
    render(<MockSearchableCountryList />);

    // Initially all countries should be shown
    expect(screen.getByText('Found 4 countries')).toBeInTheDocument();

    // Search for "united"
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'united' }
    });

    expect(screen.getByText('Found 1 countries')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.queryByText('Canada')).not.toBeInTheDocument();
  });

  test('should filter countries by region', async () => {
    render(<MockSearchableCountryList />);

    // Filter by Americas
    fireEvent.change(screen.getByTestId('region-filter'), {
      target: { value: 'Americas' }
    });

    expect(screen.getByText('Found 2 countries')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.queryByText('Germany')).not.toBeInTheDocument();
  });

  test('should combine search and region filters', async () => {
    render(<MockSearchableCountryList />);

    // Filter by Americas and search for "canada"
    fireEvent.change(screen.getByTestId('region-filter'), {
      target: { value: 'Americas' }
    });
    
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'canada' }
    });

    expect(screen.getByText('Found 1 countries')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.queryByText('United States')).not.toBeInTheDocument();
  });
});

// Mock React for the integration tests
const React = {
  useState: (initial: any) => {
    const [state, setState] = (globalThis as any).mockUseState(initial);
    return [state, setState];
  }
};

// Setup mock useState for the integration tests
beforeAll(() => {
  (globalThis as any).mockUseState = jest.fn((initial: any) => {
    let value = initial;
    const setValue = jest.fn((newValue: any) => {
      value = typeof newValue === 'function' ? newValue(value) : newValue;
    });
    setValue.mockImplementation((newValue: any) => {
      value = typeof newValue === 'function' ? newValue(value) : newValue;
    });
    return [() => value, setValue];
  });
}); 