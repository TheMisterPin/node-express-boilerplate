import { unauthorized } from '@/shared/constants/errors'
import { setAuditContext } from '@/shared/lib/audit'
import { verifyAccessToken } from '@/shared/lib/jwt'
import type { ITokenUser } from '@/shared/types/common'
import type { RequestHandler } from 'express'
import * as authQueries from '@/features/auth/auth.queries'

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      throw unauthorized('Missing or invalid authorization header')
    }

    const token = header.slice(7)
    const payload = verifyAccessToken(token)

    const session = await authQueries.findActiveSessionByJti(payload.jti)
    if (!session) {
      throw unauthorized('Session revoked or expired')
    }

    const user: ITokenUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      roleId: payload.roleId,
      organizationId: payload.organizationId,
    }

    req.user = user
    setAuditContext(user.id, user.organizationId)
    next()
  } catch (error) {
    next(error instanceof Error ? unauthorized(error.message) : unauthorized())
  }
}
