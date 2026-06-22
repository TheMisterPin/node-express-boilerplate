import express from 'express'

import { Role } from '../../generated/prisma/client'
import { HttpError } from '../errors/http-error'
import { login } from '../lib/auth/login'
import { logout } from '../lib/auth/logout'
import { hashPassword } from '../lib/auth/password'
import { authenticate, authorize } from '../middleware/auth-middleware'
import {
	createUser,
	getUserByEmail,
	getUserById,
	getUsers,
	toPublicUser,
} from '../models/users/user-queries'

export const usersRouter = express.Router()

usersRouter.post('/register', async (req, res, next) => 
{
	try 
{
		const { email, password } = req.body as {
			email?: string
			password?: string
		}

		if (!email || !password) 
{
			throw new HttpError(
				'Email and password are required',
				400,
				'VALIDATION_ERROR',
			)
		}

		if (password.length < 8) 
{
			throw new HttpError(
				'Password must be at least 8 characters',
				400,
				'VALIDATION_ERROR',
			)
		}

		const existingUser = await getUserByEmail(email)

		if (existingUser) 
{
			throw new HttpError('Email already in use', 409, 'EMAIL_IN_USE')
		}

		const hashedPassword = await hashPassword(password)
		await createUser({ email, password: hashedPassword })

		const auth = await login(email, password)

		res.status(201).json(auth)
	}
 catch (error) 
{
		next(error)
	}
})

usersRouter.post('/login', async (req, res, next) => 
{
	try 
{
		const { email, password } = req.body as {
			email?: string
			password?: string
		}

		if (!email || !password) 
{
			throw new HttpError(
				'Email and password are required',
				400,
				'VALIDATION_ERROR',
			)
		}

		const result = await login(email, password)

		res.json(result)
	}
 catch (error) 
{
		next(error)
	}
})

usersRouter.post('/logout', authenticate, async (req, res, next) => 
{
	try 
{
		const authHeader = req.headers.authorization!

		const token = authHeader.slice('Bearer '.length)

		await logout(token)

		res.json({ message: 'Logged out successfully' })
	}
 catch (error) 
{
		next(error)
	}
})

usersRouter.get('/me', authenticate, async (req, res, next) => 
{
	try 
{
		const user = await getUserById(req.user!.id)

		if (!user) 
{
			throw new HttpError('User not found', 404, 'NOT_FOUND')
		}

		res.json({ user: toPublicUser(user) })
	}
 catch (error) 
{
		next(error)
	}
})

usersRouter.get(
	'/',
	authenticate,
	authorize(Role.ADMIN),
	async (_req, res, next) => 
{
		try 
{
			const users = await getUsers()

			res.json({ users: users.map(toPublicUser) })
		}
 catch (error) 
{
			next(error)
		}
	},
)

usersRouter.get('/:id', authenticate, async (req, res, next) => 
{
	try 
{
		const id = req.params.id as string

		const isAdmin = req.user!.role === Role.ADMIN

		const isSelf = req.user!.id === id

		if (!isAdmin && !isSelf) 
{
			throw new HttpError('Insufficient permissions', 403, 'FORBIDDEN')
		}

		const user = await getUserById(id)

		if (!user) 
{
			throw new HttpError('User not found', 404, 'NOT_FOUND')
		}

		res.json({ user: toPublicUser(user) })
	}
 catch (error) 
{
		next(error)
	}
})
