import { Router } from 'express'
import { getRouteMap } from '../controllers/mountain.controller.js'
import { getPublicEntry, getPublicProfile, likePublicEntry } from '../controllers/public.controller.js'
import { auth } from '../middleware/auth.js'
import { optionalAuth } from '../middleware/optionalAuth.js'

const router = Router()

// peta jalur wajib bisa dibuka tamu
router.get('/mountains/:id/routes/:routeName/map', getRouteMap)

// profil dan entri publik: tamu boleh; token dibaca opsional hanya untuk mengisi likedByMe
router.get('/users/:username', optionalAuth, getPublicProfile)
router.get('/entries/:slug', optionalAuth, getPublicEntry)

// menyukai wajib login
router.put('/entries/:slug/like', auth, likePublicEntry)
router.delete('/entries/:slug/like', auth, likePublicEntry)

export default router
