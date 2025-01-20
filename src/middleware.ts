import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { verifyToken, checkRole } from './helpers/authenticate'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/_next')) return NextResponse.next()

  const token = req.cookies.get('token')?.value || null

  const isPublicPath = pathname === '/' || pathname === '/login' || pathname === '/verifyemail'

  const decodedUser = await verifyToken(token!)

  // Middleware only for using api
  if (pathname.startsWith('/api')) {
    if (!decodedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    } else if (checkRole(decodedUser, 'master_admin', 'admin', req)) {
      // Only allow admin to access /api/admin/* routes
      return NextResponse.next()
    } else if (checkRole(decodedUser, 'staff', 'staff', req)) {
      // Only allow staff to access /api/staff/* routes
      return NextResponse.next()
    } else {
      return NextResponse.json({ error: 'You are not allowed for this operation' }, { status: 403 })
    }
  }

  // frontend development middleware
  if ((pathname === '/' || !isPublicPath) && !token) {
    req.nextUrl.pathname = '/login'

    return NextResponse.redirect(req.nextUrl)
  }

  // Middleware for frontend routes
  if (decodedUser && decodedUser.role === 'master_admin') {
    if (isPublicPath) {
      req.nextUrl.pathname = '/admin/dashboard'

      return NextResponse.redirect(req.nextUrl)
    } else {
      return NextResponse.rewrite(new URL(req.url))
    }
  } else if (decodedUser && decodedUser.role === 'staff') {
    // Only allow distributor to access staff role
    if (isPublicPath) {
      req.nextUrl.pathname = '/staff/dashboard'

      return NextResponse.redirect(req.nextUrl)
    } else {
      return NextResponse.rewrite(new URL(req.url))
    }
  } else {
    req.nextUrl.pathname = '/login'

    return NextResponse.rewrite(req.nextUrl)
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // for frontend pages
    '/',
    '/login',
    '/admin/:path*',

    // for apis
    '/api/auth/logout',
    '/api/auth/me',
    '/api/auth/update-password',

    // '/api/admin/:function*',
    '/api/staff/:function*'
  ]
}
