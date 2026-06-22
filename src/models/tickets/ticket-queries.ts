import {
	Role,
	type Ticket,
	TicketStatus,
	type User,
} from '../../../generated/prisma/client'
import { prisma } from '../../lib/prisma'
import { type PublicUser,toPublicUser } from '../users/user-queries'

export type PublicTicket = {
	id: string
	title: string
	description: string
	status: TicketStatus
	submitterId: string
	technicianId: string | null
	createdAt: Date
	updatedAt: Date
	submitter?: PublicUser
	technician?: PublicUser | null
}

const ticketInclude = {
	submitter: true,
	technician: true,
} as const

type TicketWithRelations = Ticket & {
	submitter: User
	technician: User | null
}

export const toPublicTicket = (ticket: TicketWithRelations): PublicTicket => ({
	id: ticket.id,
	title: ticket.title,
	description: ticket.description,
	status: ticket.status,
	submitterId: ticket.submitterId,
	technicianId: ticket.technicianId,
	createdAt: ticket.createdAt,
	updatedAt: ticket.updatedAt,
	submitter: toPublicUser(ticket.submitter),
	technician: ticket.technician ? toPublicUser(ticket.technician) : null,
})

export type CreateTicketInput = {
	title: string
	description: string
	submitterId: string
}

export const createTicket = async (
	input: CreateTicketInput,
): Promise<TicketWithRelations> =>
{
	return prisma.ticket.create({
		data: {
			title: input.title,
			description: input.description,
			submitterId: input.submitterId,
		},
		include: ticketInclude,
	})
}

export const getTicketById = async (
	id: string,
): Promise<TicketWithRelations | null> =>
{
	return prisma.ticket.findUnique({
		where: { id },
		include: ticketInclude,
	})
}

export const getTickets = async (): Promise<TicketWithRelations[]> =>
{
	return prisma.ticket.findMany({
		include: ticketInclude,
		orderBy: { createdAt: 'desc' },
	})
}

const OPEN_STATUSES: TicketStatus[] = [
	TicketStatus.NEW,
	TicketStatus.ASSIGNED,
	TicketStatus.IN_PROGRESS,
]

export const getOpenTickets = async (): Promise<TicketWithRelations[]> =>
{
	return prisma.ticket.findMany({
		where: { status: { in: OPEN_STATUSES } },
		include: ticketInclude,
		orderBy: { createdAt: 'desc' },
	})
}

export const getResolvedTickets = async (): Promise<TicketWithRelations[]> =>
{
	return prisma.ticket.findMany({
		where: { status: TicketStatus.RESOLVED },
		include: ticketInclude,
		orderBy: { createdAt: 'desc' },
	})
}

export const getClosedTickets = async (): Promise<TicketWithRelations[]> =>
{
	return prisma.ticket.findMany({
		where: { status: TicketStatus.CLOSED },
		include: ticketInclude,
		orderBy: { createdAt: 'desc' },
	})
}

export const getTicketsBySubmitter = async (
	userId: string,
): Promise<TicketWithRelations[]> =>
{
	return prisma.ticket.findMany({
		where: { submitterId: userId },
		include: ticketInclude,
		orderBy: { createdAt: 'desc' },
	})
}

export const getTicketsByTechnician = async (
	userId: string,
): Promise<TicketWithRelations[]> =>
{
	return prisma.ticket.findMany({
		where: { technicianId: userId },
		include: ticketInclude,
		orderBy: { createdAt: 'desc' },
	})
}

export const assignTicket = async (
	ticketId: string,
	technicianId: string,
): Promise<TicketWithRelations> =>
{
	return prisma.ticket.update({
		where: { id: ticketId },
		data: {
			technicianId,
			status: TicketStatus.ASSIGNED,
		},
		include: ticketInclude,
	})
}

export const updateTicketStatus = async (
	ticketId: string,
	status: TicketStatus,
): Promise<TicketWithRelations> =>
{
	return prisma.ticket.update({
		where: { id: ticketId },
		data: { status },
		include: ticketInclude,
	})
}

export const getUsersWithoutAssignedTickets = async (): Promise<User[]> =>
{
	return prisma.user.findMany({
		where: {
			role: { in: [Role.TECHNICIAN, Role.ADMIN] },
			assignedTickets: {
				none: {
					status: { in: OPEN_STATUSES },
				},
			},
		},
		orderBy: { createdAt: 'desc' },
	})
}
