import * as controller from './health.controller'
import { Router } from 'express'

const router = Router()

router.get('/', controller.check)

export default router
