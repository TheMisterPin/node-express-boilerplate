import { conflict, notFound } from '@/shared/constants/errors'
import { prisma } from '@/shared/lib/prisma'
import { paginate, asPaginateDelegate } from '@/shared/lib/paginate'
import type { PaginatedResult } from '@/shared/types/common'
import type {
  CreateOrganizationDto,
  OrganizationDto,
  UpdateOrganizationDto,
} from './organizations.types'
import { Prisma } from '@prisma/client'

const orgSelect = {
  id: true,
  name: true,
  slug: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const

type OrgRecord = Prisma.OrganizationGetPayload<{ select: typeof orgSelect }>

function toDto(record: OrgRecord): OrganizationDto {
  return record
}

export async function listOrganizations(
  page: number,
  limit: number,
): Promise<PaginatedResult<OrganizationDto>> {
  const result = await paginate<OrgRecord>(
    asPaginateDelegate(prisma.organization),
    { where: { deletedAt: null }, orderBy: { name: 'asc' }, select: orgSelect },
    page,
    limit,
  )
  return { data: result.data.map(toDto), meta: result.meta }
}

export async function findOrganizationById(id: string): Promise<OrganizationDto | null> {
  const org = await prisma.organization.findFirst({
    where: { id, deletedAt: null },
    select: orgSelect,
  })
  return org ? toDto(org) : null
}

export async function createOrganization(data: CreateOrganizationDto): Promise<OrganizationDto> {
  try {
    const org = await prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        isActive: data.isActive ?? true,
      },
      select: orgSelect,
    })
    return toDto(org)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw conflict('slug')
    }
    throw error
  }
}

export async function updateOrganization(
  id: string,
  data: UpdateOrganizationDto,
): Promise<OrganizationDto> {
  try {
    const org = await prisma.organization.update({
      where: { id, deletedAt: null },
      data: { ...data, version: { increment: 1 } },
      select: orgSelect,
    })
    return toDto(org)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') throw conflict('slug')
      if (error.code === 'P2025') throw notFound('Organization')
    }
    throw error
  }
}

export async function softDeleteOrganization(id: string): Promise<void> {
  const result = await prisma.organization.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date(), version: { increment: 1 } },
  })
  if (result.count === 0) {
    throw notFound('Organization')
  }
}
