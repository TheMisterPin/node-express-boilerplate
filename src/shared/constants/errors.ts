export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: unknown

  constructor(message: string, statusCode: number, code: string, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    if (details !== undefined) {
      this.details = details
    }
  }
}

export function notFound(resource: string): AppError {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND')
}

export function unauthorized(message = 'Authentication required'): AppError {
  return new AppError(message, 401, 'UNAUTHORIZED')
}

export function forbidden(message = 'Insufficient permissions'): AppError {
  return new AppError(message, 403, 'FORBIDDEN')
}

export function conflict(field: string): AppError {
  return new AppError(`${field} already exists`, 409, 'CONFLICT', { field })
}

export function validationError(details: unknown): AppError {
  return new AppError('Validation failed', 400, 'VALIDATION_ERROR', details)
}

export function internal(message = 'Internal server error'): AppError {
  return new AppError(message, 500, 'INTERNAL_ERROR')
}

export function tooManyRequests(message = 'Too many requests'): AppError {
  return new AppError(message, 429, 'RATE_LIMITED')
}
