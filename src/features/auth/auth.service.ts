import * as authQueries from './auth.queries'
import type { AuthUser, LoginDto, RefreshDto, TokenPair } from './auth.types'
import { unauthorized } from '@/shared/constants/errors'
import {
  generateRefreshToken,
  getRefreshTokenExpiry,
  signAccessToken,
} from '@/shared/lib/jwt'
import { comparePassword } from '@/shared/lib/password'
import { env } from '@/config/env'

const LOCKOUT_MESSAGE = 'Account temporarily locked due to too many failed attempts'

export async function login(dto: LoginDto): Promise<TokenPair> {
  const user = await authQueries.findUserByEmail(dto.email)
  if (!user) {
    throw unauthorized('Invalid email or password')
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw unauthorized(LOCKOUT_MESSAGE)
  }

  const valid = await comparePassword(dto.password, user.passwordHash)
  if (!valid) {
    await authQueries.incrementFailedAttempts(user.id)
    throw unauthorized('Invalid email or password')
  }

  await authQueries.resetFailedAttempts(user.id)

  const refreshToken = generateRefreshToken()
  const expiresAt = getRefreshTokenExpiry()
  const { token: accessToken, jti } = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role.name,
    roleId: user.roleId,
    organizationId: user.organizationId,
  })

  await authQueries.createSession({
    userId: user.id,
    refreshToken,
    accessTokenJti: jti,
    expiresAt,
  })

  return {
    accessToken,
    refreshToken,
    expiresIn: env.JWT_ACCESS_EXPIRES,
  }
}

export async function refresh(dto: RefreshDto): Promise<TokenPair> {
  const session = await authQueries.findSessionByToken(dto.refreshToken)
  if (!session?.user) {
    throw unauthorized('Invalid or expired refresh token')
  }

  await authQueries.revokeSession(session.id)

  const refreshToken = generateRefreshToken()
  const expiresAt = getRefreshTokenExpiry()
  const { token: accessToken, jti } = signAccessToken({
    sub: session.user.id,
    email: session.user.email,
    role: session.user.role.name,
    roleId: session.user.roleId,
    organizationId: session.user.organizationId,
  })

  await authQueries.createSession({
    userId: session.user.id,
    refreshToken,
    accessTokenJti: jti,
    expiresAt,
  })

  return {
    accessToken,
    refreshToken,
    expiresIn: env.JWT_ACCESS_EXPIRES,
  }
}

export async function logout(userId: string, jti: string): Promise<void> {
  await authQueries.revokeSessionByJti(jti)
  void userId
}

export async function getMe(userId: string): Promise<AuthUser> {
  const user = await authQueries.findUserById(userId)
  if (!user) {
    throw unauthorized('User not found')
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name,
    roleId: user.roleId,
    organizationId: user.organizationId,
  }
}
