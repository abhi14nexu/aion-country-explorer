'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';

/**
 * Provider component that syncs authentication state between cookies and store
 * Should be placed high in the component tree to ensure auth state is synced early
 */
export default function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { syncAuthWithCookie } = useAppStore();

  useEffect(() => {
    // Sync auth state on mount
    syncAuthWithCookie();

    // Set up a periodic check to keep auth state in sync
    const interval = setInterval(() => {
      syncAuthWithCookie();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [syncAuthWithCookie]);

  return <>{children}</>;
} 