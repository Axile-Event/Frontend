import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Redirect public event discovery back to landing domain
  if (pathname === '/events' || pathname.startsWith('/events/')) {
    const url = new URL(request.url)
    return NextResponse.redirect(`https://axile.ng${pathname}${url.search}`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/events/:path*'],
}
