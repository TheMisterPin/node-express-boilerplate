import { randomUUID } from 'node:crypto'

import { env } from '../../config/env'
import { HttpError } from '../../errors/http-error'
import { getUserByEmail, toPublicUser } from '../../models/users/user-queries'
import { signToken } from './jwt'
import { comparePassword } from './password'
import { createSession } from './session'

export type LoginResult = {
	token: string
	user: ReturnType<typeof toPublicUser>
}

export const login = async (
	email: string,
	password: string,
): Promise<LoginResult> => 
{
	const user = await getUserByEmail(email)

	if (!user) 
{
		throw new HttpError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
	}

	const isValidPassword = await comparePassword(password, user.password)

	if (!isValidPassword) 
{
		throw new HttpError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
	}

	const jti = randomUUID()

	const expiresAt = new Date(Date.now() + parseExpiresInMs(env.jwtExpiresIn))

	await createSession(user.id, jti, expiresAt)

	const token = signToken({
		sub: user.id,
		email: user.email,
		role: user.role,
		jti,
	})

	return {
		token,
		user: toPublicUser(user),
	}
}

const parseExpiresInMs = (expiresIn: string): number => 
{
	const match = expiresIn.match(/^(\d+)([smhd])$/)

	if (!match) 
{
		return 7 * 24 * 60 * 60 * 1000
	}

	const value = Number(match[1])

	const unit = match[2]

	switch (unit) 
{
		case 's':
			return value * 1000
		case 'm':
			return value * 60 * 1000
		case 'h':
			return value * 60 * 60 * 1000
		case 'd':
			return value * 24 * 60 * 60 * 1000
		default:
			return 7 * 24 * 60 * 60 * 1000
	}
}
