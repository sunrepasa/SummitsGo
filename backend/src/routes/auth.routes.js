import { Router } from 'express'
import { login, register } from '../controllers/auth.controller.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { validate } from '../middleware/validate.js'
import { loginSchema, registerSchema } from '../utils/schemas.js'

const router = Router()

router.post('/register', authLimiter, validate(registerSchema), register)
router.post('/login', authLimiter, validate(loginSchema), login)

export default router
