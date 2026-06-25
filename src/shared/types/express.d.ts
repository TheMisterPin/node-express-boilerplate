import type { ITokenUser } from './common'

declare global {
  namespace Express {
    interface Request {
      id: string
      user?: ITokenUser
    }
  }
}

export {}
