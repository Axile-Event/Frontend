import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // 1. Get the shared auth cookie
  const authCookie = request.cookies.get('axile_shared_auth')?.value
  let isAuthenticated = !!authCookie

  // 2. Define path groups
  const isAuthPage = pathname === '/login' || pathname === '/signup'
  const isProtectedPage = pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname.startsWith('/settings')
  const isEventPage = pathname === '/events' || pathname.startsWith('/events/')

  // 3. Handle Event Redirects (already implemented)
  if (isEventPage) {
    return NextResponse.redirect(new URL(pathname, 'https://axile.ng'))
  }

  // 4. Redirect Authenticated users away from Login/Signup
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 5. Redirect Unauthenticated users away from Protected pages
  if (!isAuthenticated && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/events/:path*',
    '/login',
    '/signup',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*'
  ],
}
