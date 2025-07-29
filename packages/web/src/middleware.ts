import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('ai-JWTtoken');
  // console.log('middleware', token);

  if (!token) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url).toString());
  }
}

export const config = {
  matcher: '/dashboard/:path*', // Matches routes that start with 'dashboard/'
};