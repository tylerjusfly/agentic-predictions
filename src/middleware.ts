import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('ai-JWTtoken');
  const { pathname } = request.nextUrl;

  // If accessing /dashboard and no token → redirect to /login
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing /login and token exists → redirect to /dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Otherwise continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'], // Apply to both dashboard and login
};
