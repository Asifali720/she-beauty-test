import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server'

import { SignJWT, decodeJwt } from 'jose'

export async function getToken(user: object) {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 60 * 60 // one hour

  return new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(process.env.TOKEN_SECRET!))
  
}

export async function verifyToken(token: string) {
  if (!token) return

  const claims: any = decodeJwt(token)

  const currentTimestamp = Math.floor(Date.now() / 1000)
  const expirationTime: any = claims.exp

  // check expiration time
  if (currentTimestamp > expirationTime) {
    const token = await getToken(claims.user)

    // Create a new response object
    const response = new NextResponse()

    response.cookies.set('token', token, {
      httpOnly: true
    })
  }

  const user: any = claims?.user

  return user
}

export function isPathMatching(url: string, pattern: string) {
  const regex = new RegExp(pattern)

  return regex.test(url)
}

export function checkRole(decodedUser: any, role: string, endpoint: string, req: NextRequest) {
  return (
    (decodedUser && decodedUser.role === role && isPathMatching(req.url, `/api/${endpoint}/`)) ||
    (decodedUser && decodedUser.role === role && isPathMatching(req.url, '/api/auth/'))
  )
}
