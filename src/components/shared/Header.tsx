'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';

export default function Header() {
  const { isAuthenticated, logout } = useAppStore();
  const router = useRouter();

  const handleLogout = () => {
    // Clear authentication cookie
    document.cookie = 'aion-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    
    // Update Zustand store
    logout();
    
    // Redirect to home
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">🌍</div>
            <span className="text-xl font-bold text-gray-800">Aion Explorer</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              Countries
            </Link>
            
            {isAuthenticated && (
              <Link 
                href="/favorites" 
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Favorites
              </Link>
            )}
          </nav>

          {/* Authentication Controls */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, testuser!</span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
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