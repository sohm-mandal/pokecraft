import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = (req.auth?.user as { role?: string })?.role

  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/login?callbackUrl=/admin', req.url))
    }
  }

  if (pathname.startsWith('/account')) {
    if (!req.auth) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/account', req.url))
    }
  }
})

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
