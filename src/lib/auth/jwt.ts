import jwt, { type SignOptions } from 'jsonwebtoken'

import type { Role } from '../../../generated/prisma/client'
import { env } from '../../config/env'

export type JwtPayload = {
	sub: string
	email: string
	role: Role
	jti: string
}

export const signToken = (payload: JwtPayload): string => 
{
	const options: SignOptions = {
		expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
		jwtid: payload.jti,
	}

	return jwt.sign(
		{ sub: payload.sub, email: payload.email, role: payload.role },
		env.jwtSecret,
		options,
	)
}

export const verifyToken = (token: string): JwtPayload => 
{
	const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload & {
		email: string
		role: Role
	}

	return {
		sub: decoded.sub!,
		email: decoded.email,
		role: decoded.role,
		jti: decoded.jti!,
	}
}
