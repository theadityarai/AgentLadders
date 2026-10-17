import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const FALLBACK_SECRET = 'agentladders-secret-production-key-998877665544332211';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Super Admin privilege check for /admin routes
    if (pathname.startsWith('/admin')) {
      const isSuperAdmin =
        token?.role === 'SUPER_ADMIN' ||
        token?.email === 'aditya@agentladders.com' ||
        token?.email === 'admin@agentladders.com';

      if (!isSuperAdmin) {
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }

    const response = NextResponse.next();
    
    // Defense-in-depth security headers
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

    return response;
  },
  {
    secret: process.env.NEXTAUTH_SECRET || FALLBACK_SECRET,
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
