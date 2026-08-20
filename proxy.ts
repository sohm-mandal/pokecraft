import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = (req.auth?.user as { role?: string })?.role
  const isLoggedIn = !!req.auth

  // Always allow login page and auth API
  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password') || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
  }

  // Admin only
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
}
