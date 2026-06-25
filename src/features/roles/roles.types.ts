export interface RoleDto {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateRoleDto {
  name: string
  description?: string
}

export interface UpdateRoleDto {
  name?: string
  description?: string
}
