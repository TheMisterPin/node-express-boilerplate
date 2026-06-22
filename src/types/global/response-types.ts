import { ApiError } from './error-types'

export type ApiResponse<T> = {
	data: T
	message: string
	statusCode: number
	timestamp: string
	success: boolean
	errors?: ApiError[]
}
