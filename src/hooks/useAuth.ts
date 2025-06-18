import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';

interface UseAuthOptions {
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
}

export const useAuth = (options: UseAuthOptions = {}) => {
  const { redirectTo = '/login', redirectIfAuthenticated = false } = options;
  const { isAuthenticated, login, logout } = useAppStore();
  const router = useRouter();

  // Redirect logic based on authentication state
  useEffect(() => {
    if (!isAuthenticated && redirectTo && !redirectIfAuthenticated) {
      // User is not authenticated and should be redirected to login
      const currentPath = window.location.pathname;
      const loginUrl = redirectTo.includes('?') 
        ? `${redirectTo}&from=${encodeURIComponent(currentPath)}`
        : `${redirectTo}?from=${encodeURIComponent(currentPath)}`;
      router.push(loginUrl);
    } else if (isAuthenticated && redirectIfAuthenticated && redirectTo) {
      // User is authenticated but should be redirected (e.g., away from login page)
      router.push(redirectTo);
    }
  }, [isAuthenticated, redirectTo, redirectIfAuthenticated, router]);

  // Enhanced login function with cookie management
  const enhancedLogin = () => {
    // Set authentication cookie for middleware
    document.cookie = 'aion-auth=authenticated; path=/; max-age=86400'; // 24 hours
    login();
  };

  // Enhanced logout function with cookie cleanup
  const enhancedLogout = () => {
    // Clear authentication cookie
    document.cookie = 'aion-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    logout();
    router.push('/');
  };

  // Check if user should have access to current route
  const canAccess = (requiredAuth: boolean = true) => {
    return requiredAuth ? isAuthenticated : true;
  };

  // Get authentication status with loading state
  const getAuthStatus = () => {
    return {
      isAuthenticated,
      isLoading: false, // Could be enhanced with actual loading state
      isReady: true,
    };
  };

  return {
    isAuthenticated,
    login: enhancedLogin,
    logout: enhancedLogout,
    canAccess,
    getAuthStatus,
  };
};

// Hook specifically for protecting pages
export const useRequireAuth = (redirectTo: string = '/login') => {
  return useAuth({ redirectTo, redirectIfAuthenticated: false });
};

// Hook for pages that should redirect authenticated users (e.g., login page)
export const useRedirectIfAuthenticated = (redirectTo: string = '/') => {
  return useAuth({ redirectTo, redirectIfAuthenticated: true });
}; 