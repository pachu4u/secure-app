import { auth } from "./auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  const isPublicRoute = [
    '/auth/signin',
    '/api/auth',
    '/_next',
    '/favicon.ico',
  ].some(route => pathname.startsWith(route))

  // Redirect unauthenticated users to the login page
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

// Optionally configure middleware to match specific paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 