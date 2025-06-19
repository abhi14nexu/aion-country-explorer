'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/hooks/useTheme';

export default function Header() {
  const { isAuthenticated, logout } = useAppStore();
  const router = useRouter();
  const [theme, toggleTheme] = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // Clear authentication cookie
    document.cookie = 'aion-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    
    // Update Zustand store
    logout();
    
    // Redirect to home
    router.push('/');
    
    // Close mobile menu
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Spacer to prevent content overlap with floating header */}
      <div className="h-16 sm:h-20"></div>
      
      {/* Floating Navigation with Glassmorphism */}
      <header className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[99%] sm:w-[97%] lg:w-[95%] max-w-7xl">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 shadow-lg rounded-xl sm:rounded-2xl">
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Logo/Brand with Globe Icon */}
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group" onClick={closeMobileMenu}>
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden group-hover:scale-125 transition-transform duration-500 ease-out">
                  <Image
                    src="/images/globe.png"
                    alt="Aion Explorer Globe Logo"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 32px, 40px"
                    priority
                  />
                </div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Aion Explorer
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                <Link 
                  href="/" 
                  className="relative px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
                >
                  <span className="relative z-10">Countries</span>
                  <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
                </Link>
                
                {isAuthenticated && (
                  <Link 
                    href="/favorites" 
                    className="relative px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
                  >
                    <span className="relative z-10">Favorites</span>
                    <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
                  </Link>
                )}
              </nav>

              {/* Right Side Controls */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-1.5 sm:p-2 rounded-full bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-600/30 hover:bg-white/70 dark:hover:bg-gray-700/50 transition-all duration-300 backdrop-blur-sm"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                    </svg>
                  )}
                </button>

                {/* Desktop Authentication Controls */}
                <div className="hidden lg:flex items-center space-x-2 sm:space-x-3">
                  {isAuthenticated ? (
                    <>
                      <span className="hidden xl:inline text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Welcome, testuser!
                      </span>
                      <button
                        onClick={handleLogout}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-xs sm:text-sm font-medium rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm font-medium rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Login
                    </Link>
                  )}
                </div>

                {/* Mobile Hamburger Menu Button */}
                <button
                  onClick={toggleMobileMenu}
                  className="lg:hidden p-1.5 sm:p-2 rounded-full bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-600/30 hover:bg-white/70 dark:hover:bg-gray-700/50 transition-all duration-300 backdrop-blur-sm"
                  aria-label="Toggle mobile menu"
                >
                  <div className="w-5 h-5 flex flex-col justify-center items-center">
                    <span className={`block w-4 h-0.5 bg-gray-700 dark:bg-gray-200 transform transition-all duration-300 ${
                      isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'
                    }`}></span>
                    <span className={`block w-4 h-0.5 bg-gray-700 dark:bg-gray-200 transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}></span>
                    <span className={`block w-4 h-0.5 bg-gray-700 dark:bg-gray-200 transform transition-all duration-300 ${
                      isMobileMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'
                    }`}></span>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <nav className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/20 dark:border-gray-700/30">
                <div className="flex flex-col space-y-1 sm:space-y-2">
                  <Link 
                    href="/" 
                    onClick={closeMobileMenu}
                    className="px-3 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                  >
                    Countries
                  </Link>
                  {isAuthenticated && (
                    <Link 
                      href="/favorites" 
                      onClick={closeMobileMenu}
                      className="px-3 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                    >
                      Favorites
                    </Link>
                  )}
                  
                  {/* Mobile Authentication */}
                  <div className="pt-2 border-t border-white/10 dark:border-gray-700/20 mt-2">
                    {isAuthenticated ? (
                      <>
                        <div className="px-3 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Welcome, testuser!
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm sm:text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        onClick={closeMobileMenu}
                        className="block px-3 py-2 text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                      >
                        Login
                      </Link>
                    )}
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
} 