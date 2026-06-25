export interface OrganizationDto {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateOrganizationDto {
  name: string
  slug: string
  isActive?: boolean
}

export interface UpdateOrganizationDto {
  name?: string
  slug?: string
  isActive?: boolean
}
