import * as usersService from './users.service'
import type { ListUsersInput } from './users.schema'
import type { RequestHandler } from 'express'
import { sendSuccess } from '@/shared/lib/response'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const query = req.query as unknown as ListUsersInput
    const result = await usersService.listUsers(query, req.user!)
    sendSuccess(res, result.data, 200, result.meta)
  } catch (error) {
    next(error)
  }
}

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const user = await usersService.getUserById(id, req.user!)
    sendSuccess(res, user)
  } catch (error) {
    next(error)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const user = await usersService.createUser(req.body, req.user!)
    sendSuccess(res, user, 201)
  } catch (error) {
    next(error)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const user = await usersService.updateUser(id, req.body, req.user!)
    sendSuccess(res, user)
  } catch (error) {
    next(error)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    await usersService.removeUser(id, req.user!)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    await usersService.changePassword(id, req.body, req.user!)
    sendSuccess(res, { message: 'Password updated successfully' })
  } catch (error) {
    next(error)
  }
}
