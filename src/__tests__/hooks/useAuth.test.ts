import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth, useRequireAuth, useRedirectIfAuthenticated } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the app store
jest.mock('@/store/appStore', () => ({
  useAppStore: jest.fn(),
}));

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

describe('useAuth Hook', () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset document.cookie
    document.cookie = '';
    
    // Setup router mock
    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);

    // Setup default store mock
    mockUseAppStore.mockReturnValue({
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
    } as any);
  });

  describe('useAuth', () => {
    test('should return authentication state and methods', () => {
      const mockLogin = jest.fn();
      const mockLogout = jest.fn();
      
      mockUseAppStore.mockReturnValue({
        isAuthenticated: true,
        login: mockLogin,
        logout: mockLogout,
      } as any);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.login).toBe(mockLogin);
      expect(result.current.logout).toBe(mockLogout);
    });

    test('should enhance login with cookie setting', async () => {
      const mockStoreLogin = jest.fn();
      
      mockUseAppStore.mockReturnValue({
        isAuthenticated: false,
        login: mockStoreLogin,
        logout: jest.fn(),
      } as any);

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.login();
      });

      expect(mockStoreLogin).toHaveBeenCalled();
      expect(document.cookie).toContain('auth-token=authenticated');
      expect(document.cookie).toContain('path=/');
      expect(document.cookie).toContain('max-age=86400'); // 24 hours
    });

    test('should enhance logout with cookie removal and redirect', () => {
      const mockStoreLogout = jest.fn();
      
      // Set initial cookie
      document.cookie = 'auth-token=authenticated; path=/; max-age=86400';
      
      mockUseAppStore.mockReturnValue({
        isAuthenticated: true,
        login: jest.fn(),
        logout: mockStoreLogout,
      } as any);

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.logout();
      });

      expect(mockStoreLogout).toHaveBeenCalled();
      expect(document.cookie).toContain('auth-token=; expires=Thu, 01 Jan 1970');
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    test('should set secure cookie in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const mockStoreLogin = jest.fn();
      
      mockUseAppStore.mockReturnValue({
        isAuthenticated: false,
        login: mockStoreLogin,
        logout: jest.fn(),
      } as any);

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.login();
      });

      expect(document.cookie).toContain('secure');
      expect(document.cookie).toContain('samesite=strict');

      process.env.NODE_ENV = originalEnv;
    });

    test('should not set secure cookie in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockStoreLogin = jest.fn();
      
      mockUseAppStore.mockReturnValue({
        isAuthenticated: false,
        login: mockStoreLogin,
        logout: jest.fn(),
      } as any);

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.login();
      });

      expect(document.cookie).not.toContain('secure');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('useRequireAuth', () => {
    test('should not redirect when user is authenticated', () => {
      mockUseAppStore.mockReturnValue({
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
      } as any);

      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('should redirect to login when user is not authenticated', () => {
      mockUseAppStore.mockReturnValue({
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any);

      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    test('should redirect to custom path when specified', () => {
      mockUseAppStore.mockReturnValue({
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any);

      renderHook(() => useRequireAuth('/custom-login'));

      expect(mockPush).toHaveBeenCalledWith('/custom-login');
    });

    test('should show loading state initially', () => {
      mockUseAppStore.mockReturnValue({
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any);

      const { result } = renderHook(() => useRequireAuth());

      // In real implementation, there might be a loading state
      // Here we test the immediate behavior
      expect(result.current.isLoading).toBe(false);
    });

    test('should handle authentication state changes', () => {
      let authState = false;
      
      mockUseAppStore.mockImplementation(() => ({
        isAuthenticated: authState,
        login: jest.fn(),
        logout: jest.fn(),
      } as any));

      const { result, rerender } = renderHook(() => useRequireAuth());

      // Initially not authenticated - should redirect
      expect(mockPush).toHaveBeenCalledWith('/login');

      // Change auth state
      authState = true;
      rerender();

      // Should no longer redirect (but previous redirect call remains)
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('useRedirectIfAuthenticated', () => {
    test('should redirect to home when user is authenticated', () => {
      mockUseAppStore.mockReturnValue({
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
      } as any);

      const { result } = renderHook(() => useRedirectIfAuthenticated());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.shouldShow).toBe(false);
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    test('should not redirect when user is not authenticated', () => {
      mockUseAppStore.mockReturnValue({
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any);

      const { result } = renderHook(() => useRedirectIfAuthenticated());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.shouldShow).toBe(true);
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('should redirect to custom path when specified', () => {
      mockUseAppStore.mockReturnValue({
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
      } as any);

      renderHook(() => useRedirectIfAuthenticated('/dashboard'));

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    test('should show loading state initially', () => {
      mockUseAppStore.mockReturnValue({
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any);

      const { result } = renderHook(() => useRedirectIfAuthenticated());

      // Test immediate state
      expect(result.current.isLoading).toBe(false);
      expect(result.current.shouldShow).toBe(true);
    });

    test('should handle authentication state changes', () => {
      let authState = false;
      
      mockUseAppStore.mockImplementation(() => ({
        isAuthenticated: authState,
        login: jest.fn(),
        logout: jest.fn(),
      } as any));

      const { result, rerender } = renderHook(() => useRedirectIfAuthenticated());

      // Initially not authenticated - should show
      expect(result.current.shouldShow).toBe(true);
      expect(mockPush).not.toHaveBeenCalled();

      // Change auth state to authenticated
      authState = true;
      rerender();

      // Should redirect and not show
      expect(result.current.shouldShow).toBe(false);
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Cookie Management', () => {
    test('should properly format authentication cookie', () => {
      const mockStoreLogin = jest.fn();
      
      mockUseAppStore.mockReturnValue({
        isAuthenticated: false,
        login: mockStoreLogin,
        logout: jest.fn(),
      } as any);

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.login();
      });

      const cookieParts = document.cookie.split(';').map(part => part.trim());
      
      expect(cookieParts).toContain('auth-token=authenticated');
      expect(cookieParts.some(part => part.startsWith('path=/'))).toBe(true);
      expect(cookieParts.some(part => part.startsWith('max-age='))).toBe(true);
    });

    test('should properly remove authentication cookie on logout', () => {
      // Set initial cookie
      document.cookie = 'auth-token=authenticated; path=/; max-age=86400';
      expect(document.cookie).toContain('auth-token=authenticated');

      const mockStoreLogout = jest.fn();
      
      mockUseAppStore.mockReturnValue({
        isAuthenticated: true,
        login: jest.fn(),
        logout: mockStoreLogout,
      } as any);

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.logout();
      });

      // Cookie should be expired (set to past date)
      expect(document.cookie).toContain('auth-token=; expires=Thu, 01 Jan 1970');
    });
  });

  describe('Router Integration', () => {
    test('should handle router push errors gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockPush.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      mockUseAppStore.mockReturnValue({
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any);

      // Should not throw error even if router.push fails
      expect(() => {
        renderHook(() => useRequireAuth());
      }).not.toThrow();

      consoleError.mockRestore();
    });

    test('should not call router methods if router is not available', () => {
      mockUseRouter.mockReturnValue(null as any);

      mockUseAppStore.mockReturnValue({
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any);

      // Should not throw error when router is not available
      expect(() => {
        renderHook(() => useRequireAuth());
      }).not.toThrow();
    });
  });
}); 