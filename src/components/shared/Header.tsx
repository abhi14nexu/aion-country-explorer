'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/hooks/useTheme';

export default function Header() {
  const { isAuthenticated, logout } = useAppStore();
  const router = useRouter();
  const [theme, toggleTheme] = useTheme();

  const handleLogout = () => {
    // Clear authentication cookie
    document.cookie = 'aion-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    
    // Update Zustand store
    logout();
    
    // Redirect to home
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm border-b dark:bg-neutral-900 dark:border-neutral-800 transition-colors">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">🌍</div>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">Aion Explorer</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
            >
              Countries
            </Link>
            
            {isAuthenticated && (
              <Link 
                href="/favorites" 
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Favorites
              </Link>
            )}
          </nav>

          {/* Authentication Controls + Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" /></svg>
              )}
            </button>
            {/* Auth Controls */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">Welcome, testuser!</span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex space-x-6">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Countries
              </Link>
              <Link 
                href="/favorites" 
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Favorites
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
} 