import * as organizationsQueries from './organizations.queries'
import type {
  CreateOrganizationDto,
  OrganizationDto,
  UpdateOrganizationDto,
} from './organizations.types'
import { notFound } from '@/shared/constants/errors'
import type { ITokenUser, PaginatedResult } from '@/shared/types/common'

export async function listOrganizations(
  query: { page: number; limit: number },
): Promise<PaginatedResult<OrganizationDto>> {
  return organizationsQueries.listOrganizations(query.page, query.limit)
}

export async function getOrganizationById(id: string): Promise<OrganizationDto> {
  const org = await organizationsQueries.findOrganizationById(id)
  if (!org) {
    throw notFound('Organization')
  }
  return org
}

export async function createOrganization(dto: CreateOrganizationDto): Promise<OrganizationDto> {
  return organizationsQueries.createOrganization(dto)
}

export async function updateOrganization(
  id: string,
  dto: UpdateOrganizationDto,
): Promise<OrganizationDto> {
  return organizationsQueries.updateOrganization(id, dto)
}

export async function removeOrganization(id: string, _actor: ITokenUser): Promise<void> {
  await organizationsQueries.softDeleteOrganization(id)
}
