import React from 'react';
import { Metadata } from 'next';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import FavoritesClient from './FavoritesClient';

export const metadata: Metadata = {
  title: 'My Favorite Countries - Aion Country Explorer',
  description: 'View and manage your favorite countries. Login required to access this page.',
  robots: {
    index: false, // Don't index this protected page
    follow: false,
  },
};

export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <FavoritesClient />
    </ProtectedRoute>
  );
} 