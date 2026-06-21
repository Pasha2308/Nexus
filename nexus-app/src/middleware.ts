import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('nexus_auth');

  // Protect /dashboard and /chat
  if (!authCookie && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/chat'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/chat/:path*'],
};
