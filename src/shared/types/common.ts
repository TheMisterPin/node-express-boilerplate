export type Action = 'create' | 'read' | 'update' | 'delete' | 'export'

export type ResourceKey =
  | 'users'
  | 'roles'
  | 'permissions'
  | 'products'
  | 'categories'
  | 'organizations'
  | 'audit-logs'

export interface ITokenUser {
  id: string
  email: string
  role: string
  roleId: string
  organizationId: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: PaginationMeta
}

export interface ApiErrorBody {
  code: string
  message: string
  details?: unknown
}

export interface ApiErrorResponse {
  success: false
  error: ApiErrorBody
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export interface ListQuery {
  page?: number
  limit?: number
}
