import * as authService from './auth.service'
import type { RequestHandler } from 'express'
import { sendSuccess } from '@/shared/lib/response'
import { verifyAccessToken } from '@/shared/lib/jwt'

export const login: RequestHandler = async (req, res, next) => {
  try {
    const tokens = await authService.login(req.body)
    sendSuccess(res, tokens)
  } catch (error) {
    next(error)
  }
}

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const tokens = await authService.refresh(req.body)
    sendSuccess(res, tokens)
  } catch (error) {
    next(error)
  }
}

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : ''
    const payload = verifyAccessToken(token)
    await authService.logout(req.user!.id, payload.jti)
    sendSuccess(res, { message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}

export const me: RequestHandler = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user!.id)
    sendSuccess(res, user)
  } catch (error) {
    next(error)
  }
}

export const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    // TODO(template): integrate email service to send reset link
    void req.body.email
    sendSuccess(res, { message: 'If the email exists, a reset link has been sent' })
  } catch (error) {
    next(error)
  }
}

export const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    // TODO(template): validate reset token and update password
    void req.body
    sendSuccess(res, { message: 'Password has been reset' })
  } catch (error) {
    next(error)
  }
}
