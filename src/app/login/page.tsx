'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/appStore';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({}); // Field-specific errors
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAppStore();
  
  // Get the return URL from query params
  const returnUrl = searchParams.get('from') || '/';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Trim input values to avoid leading/trailing spaces
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const newFieldErrors: { username?: string; password?: string } = {};

    // Username validation
    if (!trimmedUsername) {
      newFieldErrors.username = 'Username is required.';
    } else if (trimmedUsername.length < 4) {
      newFieldErrors.username = 'Username must be at least 4 characters.';
    }

    // Password validation
    if (!trimmedPassword) {
      newFieldErrors.password = 'Password is required.';
    } else if (trimmedPassword.length < 8) {
      newFieldErrors.password = 'Password must be at least 8 characters.';
    }

    // If there are validation errors, show them and do not submit
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials (mock)
    if (trimmedUsername === 'testuser' && trimmedPassword === 'password123') {
      document.cookie = 'aion-auth=authenticated; path=/; max-age=86400'; // 24 hours
      login();
      router.push(returnUrl);
    } else {
      setError('Invalid username or password. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access detailed country information and manage your favorites
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                minLength={4}
                aria-invalid={!!fieldErrors.username}
                aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${fieldErrors.username ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
              />
              {/* Username field error */}
              {fieldErrors.username && (
                <p id="username-error" className="mt-1 text-xs text-red-600" role="alert">{fieldErrors.username}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
              {/* Password field error */}
              {fieldErrors.password && (
                <p id="password-error" className="mt-1 text-xs text-red-600" role="alert">{fieldErrors.password}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600">
              <strong>Demo Credentials:</strong>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Username: <code className="bg-gray-100 px-1 rounded">testuser</code>
            </div>
            <div className="text-sm text-gray-500">
              Password: <code className="bg-gray-100 px-1 rounded">password123</code>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 