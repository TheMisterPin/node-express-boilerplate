export interface PermissionDto {
  id: string
  roleId: string
  roleName: string
  resource: string
  action: string
  organizationId: string
}

export interface CreatePermissionDto {
  roleId: string
  resource: string
  action: string
}

export interface PermissionMatrix {
  roles: string[]
  resources: string[]
  actions: string[]
  grants: Record<string, Record<string, string[]>>
}
