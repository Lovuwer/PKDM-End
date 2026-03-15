import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect teacher routes
  if (pathname.startsWith('/teacher')) {
    // Check for session cookie or header (since we use localStorage on client,
    // this middleware primarily prevents direct external URL access in production.
    // For full SSR protection, swap to httpOnly cookies or next-auth.)
    // For now, we let the client-side auth check in each page handle the redirect.
    // This middleware is a placeholder for future next-auth integration.
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Same as above — admin pages check localStorage on mount
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/teacher/:path*', '/admin/:path*']
};
