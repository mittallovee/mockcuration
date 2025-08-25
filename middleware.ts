// @ts-ignore - Next runtime types may not be available in this environment
import { NextResponse } from 'next/server';
// @ts-ignore
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow next internals, api routes, the root login page and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/' ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/assets')
  ) {
    return NextResponse.next();
  }

  // Check for a simple cookie named `auth-token`.
  // This is intentionally simple for this app; replace with proper session validation for production.
  const token = req.cookies.get('auth-token')?.value;
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/';
    loginUrl.search = `from=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/welcome', '/welcome/:path*'],
};
