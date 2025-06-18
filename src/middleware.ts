import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check authentication for protected routes
  const protectedPaths = ['/country', '/favorites'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isProtectedPath) {
    // Check auth state from cookies or headers
    // Since we're using localStorage for Zustand persistence, we need to check for auth cookie
    const authCookie = request.cookies.get('aion-auth');
    const isAuthenticated = authCookie?.value === 'authenticated';
    
    if (!isAuthenticated) {
      // Redirect to login page with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Allow access to login page even when not authenticated
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/country/:path*', '/favorites', '/login']
}; 