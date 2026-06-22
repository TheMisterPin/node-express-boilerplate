import type { NextFunction, Request, Response } from 'express'

import type { Role } from '../../generated/prisma/client'
import { HttpError } from '../errors/http-error'
import { verifyToken } from '../lib/auth/jwt'
import { getActiveSession } from '../lib/auth/session'

export const authenticate = async (
	req: Request,
	_res: Response,
	next: NextFunction,
) => 
{
	try 
{
		const authHeader = req.headers.authorization

		if (!authHeader?.startsWith('Bearer ')) 
{
			throw new HttpError(
				'Missing or invalid authorization header',
				401,
				'UNAUTHORIZED',
			)
		}

		const token = authHeader.slice('Bearer '.length)

		const payload = verifyToken(token)

		const session = await getActiveSession(payload.jti)

		if (!session) 
{
			throw new HttpError('Session expired or revoked', 401, 'UNAUTHORIZED')
		}

		req.user = {
			id: payload.sub,
			email: payload.email,
			role: payload.role,
		}

		next()
	}
 catch (error) 
{
		if (error instanceof HttpError) 
{
			next(error)

			return
		}

		next(new HttpError('Invalid or expired token', 401, 'UNAUTHORIZED'))
	}
}

export const authorize =
	(...allowedRoles: Role[]) =>
	(req: Request, _res: Response, next: NextFunction) => 
{
		if (!req.user) 
{
			next(new HttpError('Authentication required', 401, 'UNAUTHORIZED'))

			return
		}

		if (!allowedRoles.includes(req.user.role)) 
{
			next(new HttpError('Insufficient permissions', 403, 'FORBIDDEN'))

			return
		}

		next()
	}
