import { Router } from 'express'
import {
  changePassword,
  deleteMe,
  getSavedMountain,
  saveMountain,
  unsaveMountain,
  updateMe,
  usernameAvailable,
} from '../controllers/user.controller.js'
import { auth } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { validate } from '../middleware/validate.js'
import { passwordChangeSchema, profileUpdateSchema, usernameQuerySchema } from '../utils/schemas.js'

const router = Router()

// tanpa token: dipakai form daftar sebelum pengguna punya akun
router.get('/username-available', validate(usernameQuerySchema, 'query'), usernameAvailable)

// semua di bawah ini wajib login; auth selalu paling depan agar tamu mendapat 401, bukan 400
router.patch('/me', auth, validate(profileUpdateSchema), updateMe)
// rate limit: token yang dicuri tidak bisa dipakai menebak kata sandi lama berulang-ulang
router.put('/me/password', auth, authLimiter, validate(passwordChangeSchema), changePassword)
router.delete('/me', auth, deleteMe)

router.get('/me/saved-mountains/:mountainId', auth, getSavedMountain)
router.put('/me/saved-mountains/:mountainId', auth, saveMountain)
router.delete('/me/saved-mountains/:mountainId', auth, unsaveMountain)

// GET /users/search dikerjakan di Fase 6 karena butuh data anggota dan undangan checklist

export default router
