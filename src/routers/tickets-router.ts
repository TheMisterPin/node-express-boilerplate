import express from 'express'

import { Role, TicketStatus } from '../../generated/prisma/client'
import { HttpError } from '../errors/http-error'
import { authenticate, authorize } from '../middleware/auth-middleware'
import {
	assignTicket,
	createTicket,
	getClosedTickets,
	getOpenTickets,
	getResolvedTickets,
	getTicketById,
	getTickets,
	getTicketsBySubmitter,
	getTicketsByTechnician,
	getUsersWithoutAssignedTickets,
	toPublicTicket,
	updateTicketStatus,
} from '../models/tickets/ticket-queries'
import { getUserById, toPublicUser } from '../models/users/user-queries'

export const ticketsRouter = express.Router()

const isTicketStatus = (value: string): value is TicketStatus =>
	Object.values(TicketStatus).includes(value as TicketStatus)

const canManageTickets = (role: Role) =>
	role === Role.ADMIN || role === Role.TECHNICIAN

ticketsRouter.post('/', authenticate, async (req, res, next) =>
{
	try
	{
		const { title, description } = req.body as {
			title?: string
			description?: string
		}

		if (!title || !description)
		{
			throw new HttpError(
				'Title and description are required',
				400,
				'VALIDATION_ERROR',
			)
		}

		const ticket = await createTicket({
			title,
			description,
			submitterId: req.user!.id,
		})

		res.status(201).json({ ticket: toPublicTicket(ticket) })
	}
	catch (error)
	{
		next(error)
	}
})

ticketsRouter.get(
	'/',
	authenticate,
	authorize(Role.ADMIN, Role.TECHNICIAN),
	async (_req, res, next) =>
	{
		try
		{
			const tickets = await getTickets()

			res.json({ tickets: tickets.map(toPublicTicket) })
		}
		catch (error)
		{
			next(error)
		}
	},
)

ticketsRouter.get(
	'/open',
	authenticate,
	authorize(Role.ADMIN, Role.TECHNICIAN),
	async (_req, res, next) =>
	{
		try
		{
			const tickets = await getOpenTickets()

			res.json({ tickets: tickets.map(toPublicTicket) })
		}
		catch (error)
		{
			next(error)
		}
	},
)

ticketsRouter.get(
	'/resolved',
	authenticate,
	authorize(Role.ADMIN, Role.TECHNICIAN),
	async (_req, res, next) =>
	{
		try
		{
			const tickets = await getResolvedTickets()

			res.json({ tickets: tickets.map(toPublicTicket) })
		}
		catch (error)
		{
			next(error)
		}
	},
)

ticketsRouter.get(
	'/closed',
	authenticate,
	authorize(Role.ADMIN, Role.TECHNICIAN),
	async (_req, res, next) =>
	{
		try
		{
			const tickets = await getClosedTickets()

			res.json({ tickets: tickets.map(toPublicTicket) })
		}
		catch (error)
		{
			next(error)
		}
	},
)

ticketsRouter.get(
	'/unassigned-users',
	authenticate,
	authorize(Role.ADMIN, Role.TECHNICIAN),
	async (_req, res, next) =>
	{
		try
		{
			const users = await getUsersWithoutAssignedTickets()

			res.json({ users: users.map(toPublicUser) })
		}
		catch (error)
		{
			next(error)
		}
	},
)

ticketsRouter.get('/by-submitter/:userId', authenticate, async (req, res, next) =>
{
	try
	{
		const userId = req.params.userId as string

		const isAdmin = req.user!.role === Role.ADMIN

		const isSelf = req.user!.id === userId

		if (!isAdmin && !isSelf)
		{
			throw new HttpError('Insufficient permissions', 403, 'FORBIDDEN')
		}

		const tickets = await getTicketsBySubmitter(userId)

		res.json({ tickets: tickets.map(toPublicTicket) })
	}
	catch (error)
	{
		next(error)
	}
})

ticketsRouter.get(
	'/by-technician/:userId',
	authenticate,
	async (req, res, next) =>
	{
		try
		{
			const userId = req.params.userId as string

			const isAdmin = req.user!.role === Role.ADMIN

			const isSelf = req.user!.id === userId

			const isTechnician = canManageTickets(req.user!.role)

			if (!isAdmin && !isSelf && !isTechnician)
			{
				throw new HttpError('Insufficient permissions', 403, 'FORBIDDEN')
			}

			const tickets = await getTicketsByTechnician(userId)

			res.json({ tickets: tickets.map(toPublicTicket) })
		}
		catch (error)
		{
			next(error)
		}
	},
)

ticketsRouter.get('/:id', authenticate, async (req, res, next) =>
{
	try
	{
		const id = req.params.id as string

		const ticket = await getTicketById(id)

		if (!ticket)
		{
			throw new HttpError('Ticket not found', 404, 'NOT_FOUND')
		}

		const isAdmin = req.user!.role === Role.ADMIN

		const isSubmitter = req.user!.id === ticket.submitterId

		const isTechnician = req.user!.id === ticket.technicianId

		if (!isAdmin && !isSubmitter && !isTechnician)
		{
			throw new HttpError('Insufficient permissions', 403, 'FORBIDDEN')
		}

		res.json({ ticket: toPublicTicket(ticket) })
	}
	catch (error)
	{
		next(error)
	}
})

ticketsRouter.patch(
	'/:id/assign',
	authenticate,
	authorize(Role.ADMIN, Role.TECHNICIAN),
	async (req, res, next) =>
	{
		try
		{
			const id = req.params.id as string

			const { technicianId } = req.body as { technicianId?: string }

			if (!technicianId)
			{
				throw new HttpError(
					'technicianId is required',
					400,
					'VALIDATION_ERROR',
				)
			}

			const ticket = await getTicketById(id)

			if (!ticket)
			{
				throw new HttpError('Ticket not found', 404, 'NOT_FOUND')
			}

			const technician = await getUserById(technicianId)

			if (!technician)
			{
				throw new HttpError('Technician not found', 404, 'NOT_FOUND')
			}

			if (
				technician.role !== Role.TECHNICIAN &&
				technician.role !== Role.ADMIN
			)
			{
				throw new HttpError(
					'User cannot be assigned as a technician',
					400,
					'VALIDATION_ERROR',
				)
			}

			const updated = await assignTicket(id, technicianId)

			res.json({ ticket: toPublicTicket(updated) })
		}
		catch (error)
		{
			next(error)
		}
	},
)

ticketsRouter.patch('/:id/status', authenticate, async (req, res, next) =>
{
	try
	{
		const id = req.params.id as string

		const { status } = req.body as { status?: string }

		if (!status || !isTicketStatus(status))
		{
			throw new HttpError('Valid status is required', 400, 'VALIDATION_ERROR')
		}

		const ticket = await getTicketById(id)

		if (!ticket)
		{
			throw new HttpError('Ticket not found', 404, 'NOT_FOUND')
		}

		const isAdmin = req.user!.role === Role.ADMIN

		const isAssignedTechnician = req.user!.id === ticket.technicianId

		if (!isAdmin && !isAssignedTechnician)
		{
			throw new HttpError('Insufficient permissions', 403, 'FORBIDDEN')
		}

		const updated = await updateTicketStatus(id, status)

		res.json({ ticket: toPublicTicket(updated) })
	}
	catch (error)
	{
		next(error)
	}
})
