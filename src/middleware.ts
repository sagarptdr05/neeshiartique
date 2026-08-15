import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = request.cookies.get('neeshi_session');

  // Protect /admin routes
  if (path.startsWith('/admin')) {
    if (!session || !session.value) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url));
    }
    try {
      const decoded = JSON.parse(Buffer.from(session.value, 'base64').toString('utf8'));
      if (decoded.role !== 'admin') {
        // Redirection to account if role is not admin
        return NextResponse.redirect(new URL('/account', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect gated customer routes
  const gatedPaths = ['/account', '/wishlist', '/custom-orders', '/checkout', '/track-order'];
  const isGated = gatedPaths.some(p => path.startsWith(p));
  if (isGated) {
    if (!session || !session.value) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url));
    }
  }

  // Redirect authenticated users trying to access login/register
  if (path === '/login' || path === '/register') {
    if (session && session.value) {
      try {
        const decoded = JSON.parse(Buffer.from(session.value, 'base64').toString('utf8'));
        if (decoded.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        } else {
          return NextResponse.redirect(new URL('/account', request.url));
        }
      } catch (e) {
        // Continue if corrupt
      }
    }
  }

  return NextResponse.next();
}

// Configure routes middleware runs on
export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/login',
    '/register',
    '/wishlist/:path*',
    '/custom-orders/:path*',
    '/checkout/:path*',
    '/track-order/:path*'
  ],
};
