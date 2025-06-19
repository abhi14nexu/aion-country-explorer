'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { CountryDetailSkeleton } from '@/components/ui/LoadingSkeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

/**
 * Client component wrapper for protected routes
 * Automatically redirects unauthenticated users to login
 * Shows loading state during auth check
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  fallback,
  requireAuth = true,
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { isAuthenticated } = useAppStore();
  const router = useRouter();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle authentication redirect
  useEffect(() => {
    if (isHydrated && requireAuth && !isAuthenticated && !isRedirecting) {
      setIsRedirecting(true);
      const currentPath = window.location.pathname;
      const loginUrl = redirectTo.includes('?') 
        ? `${redirectTo}&from=${encodeURIComponent(currentPath)}`
        : `${redirectTo}?from=${encodeURIComponent(currentPath)}`;
      
      // Small delay to prevent hydration issues
      setTimeout(() => {
        router.push(loginUrl);
      }, 100);
    }
  }, [isHydrated, isAuthenticated, requireAuth, redirectTo, router, isRedirecting]);

  // Show loading state during hydration or redirect
  if (!isHydrated || isRedirecting) {
    return fallback || <CountryDetailSkeleton />;
  }

  // If authentication is not required, show children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If user is authenticated, show protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback during redirect
  return fallback || <CountryDetailSkeleton />;
};

export default ProtectedRoute;

/**
 * HOC for protecting pages
 * Usage: export default withProtection(MyPage);
 */
export const withProtection = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) => {
  const ProtectedComponent = (props: P) => {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };

  ProtectedComponent.displayName = `withProtection(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ProtectedComponent;
};

/**
 * Lightweight protection for components that should hide content for unauthenticated users
 * but not redirect (useful for conditional UI elements)
 */
export const ConditionalProtection: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
  showToUnauthenticated?: boolean;
}> = ({ 
  children, 
  fallback = null, 
  showToUnauthenticated = false 
}) => {
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated } = useAppStore();

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <>{fallback}</>;
  }

  if (isAuthenticated || showToUnauthenticated) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}; 