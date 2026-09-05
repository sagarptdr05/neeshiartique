import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Mode 1: Supabase Session Verification (If credentials configured)
  if (supabaseUrl && supabaseAnonKey) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Protect /admin routes
      if (path.startsWith('/admin')) {
        if (!user) {
          // Check fallback cookie
          const sessionCookie = request.cookies.get('neeshi_session');
          if (sessionCookie?.value) {
            try {
              const decoded = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf8'));
              if (decoded.role === 'admin') return response;
            } catch {}
          }
          return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url));
        }

        // Automatic admin grant for primary admin email
        if (user.email?.toLowerCase() === 'neeshita.art27@gmail.com') {
          return response;
        }

        // Fetch role from profiles table
        let role = 'customer';
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('auth_user_id', user.id)
            .maybeSingle();

          if (profile?.role) role = profile.role;
        } catch {}

        if (role !== 'admin') {
          return NextResponse.redirect(new URL('/account', request.url));
        }
      }

      // Protect gated customer routes
      const gatedPaths = ['/account', '/wishlist', '/custom-orders', '/checkout', '/track-order', '/order-received'];
      const isGated = gatedPaths.some(p => path.startsWith(p));
      if (isGated) {
        if (!user) {
          const sessionCookie = request.cookies.get('neeshi_session');
          if (!sessionCookie?.value) {
            return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url));
          }
        }
      }

      // Redirect authenticated users trying to access login/register
      if (path === '/login' || path === '/register') {
        if (user) {
          if (user.email?.toLowerCase() === 'neeshita.art27@gmail.com') {
            return NextResponse.redirect(new URL('/admin', request.url));
          }

          let role = 'customer';
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('auth_user_id', user.id)
              .maybeSingle();

            if (profile?.role) role = profile.role;
          } catch {}

          if (role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
          } else {
            return NextResponse.redirect(new URL('/account', request.url));
          }
        }
      }

      return response;
    } catch (err) {
      console.error('Supabase middleware auth exception:', err);
    }
  }

  // Mode 2: Local Session Fallback (If Supabase NOT configured)
  const session = request.cookies.get('neeshi_session');

  // Protect /admin routes
  if (path.startsWith('/admin')) {
    if (!session || !session.value) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url));
    }
    try {
      const decoded = JSON.parse(Buffer.from(session.value, 'base64').toString('utf8'));
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/account', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect gated customer routes
  const gatedPaths = ['/account', '/wishlist', '/custom-orders', '/checkout', '/track-order', '/order-received'];
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
        // Fall through on corrupt cookie
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/login',
    '/register',
    '/wishlist/:path*',
    '/custom-orders/:path*',
    '/checkout/:path*',
    '/track-order/:path*',
    '/order-received/:path*'
  ],
};
