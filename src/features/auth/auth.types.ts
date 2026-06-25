export interface LoginDto {
  email: string
  password: string
}

export interface RefreshDto {
  refreshToken: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  token: string
  password: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: string
}

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
  roleId: string
  organizationId: string
}
