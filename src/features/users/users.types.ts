export interface UserDto {
  id: string
  email: string
  name: string | null
  roleId: string
  roleName: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserDto {
  email: string
  password: string
  name?: string
  roleId: string
}

export interface UpdateUserDto {
  email?: string
  name?: string
  roleId?: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}
