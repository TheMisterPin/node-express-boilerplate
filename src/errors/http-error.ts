export class HttpError extends Error 
{
	constructor(
		message: string,
		public statusCode: number,
		public errorCode?: string,
	) 
{
		super(message)
		this.name = 'HttpError'
	}
}
