import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip auth check for public routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/unauthorized'
  ) {
    return NextResponse.next()
  }

  // Check for auth token in cookie
  const authToken = request.cookies.get('auth_token')?.value

  // If no token is present, redirect to login
  if (!authToken) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // For API routes, set the Authorization header
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('Authorization', `Bearer ${authToken}`)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|favicon.ico).*)',
  ],
} 