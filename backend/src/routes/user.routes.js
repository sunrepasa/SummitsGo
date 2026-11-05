import { Router } from 'express'
import { usernameAvailable } from '../controllers/user.controller.js'
import { validate } from '../middleware/validate.js'
import { usernameQuerySchema } from '../utils/schemas.js'

const router = Router()

// tanpa token: dipakai form daftar sebelum pengguna punya akun
router.get('/username-available', validate(usernameQuerySchema, 'query'), usernameAvailable)

export default router
