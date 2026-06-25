import { env } from '@/config/env'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

export interface AccessTokenPayload {
  sub: string
  email: string
  role: string
  roleId: string
  organizationId: string
  jti: string
}

export interface VerifiedAccessToken extends AccessTokenPayload {
  iat: number
  exp: number
}

export function signAccessToken(payload: Omit<AccessTokenPayload, 'jti'> & { jti?: string }): {
  token: string
  jti: string
} {
  const jti = payload.jti ?? uuidv4()
  const token = jwt.sign(
    {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      roleId: payload.roleId,
      organizationId: payload.organizationId,
      jti,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES,
      algorithm: 'HS256',
    } as SignOptions,
  )
  return { token, jti }
}

export function verifyAccessToken(token: string): VerifiedAccessToken {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] })
  if (typeof decoded === 'string' || !decoded.sub) {
    throw new Error('Invalid token payload')
  }
  return decoded as VerifiedAccessToken
}

export function generateRefreshToken(): string {
  return uuidv4()
}

export function getRefreshTokenExpiry(): Date {
  const expiresIn = env.JWT_REFRESH_EXPIRES
  const match = /^(\d+)([dhms])$/.exec(expiresIn)
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
  const value = parseInt(match[1] ?? '7', 10)
  const unit = match[2]
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }
  const ms = value * (multipliers[unit ?? 'd'] ?? 24 * 60 * 60 * 1000)
  return new Date(Date.now() + ms)
}
