import { Router } from 'express'
import {
  getMountain,
  getMountainRoutes,
  getMountainWeather,
  listMountains,
  listProvinces,
  recommendedMountains,
} from '../controllers/mountain.controller.js'
import { createReview, listReviews } from '../controllers/review.controller.js'
import { auth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { mountainListQuerySchema, reviewCreateSchema } from '../utils/schemas.js'

const router = Router()

// semua GET tanpa token (akses tamu). /provinces dan /recommended harus di atas /:id
router.get('/', validate(mountainListQuerySchema, 'query'), listMountains)
router.get('/provinces', listProvinces)
router.get('/recommended', recommendedMountains)
router.get('/:id', getMountain)
router.get('/:id/routes', getMountainRoutes)
router.get('/:id/weather', getMountainWeather)

// ulasan: membaca boleh tamu, menulis wajib login (auth dijalankan sebelum validasi agar tamu dapat 401, bukan 400)
router.get('/:id/reviews', listReviews)
router.post('/:id/reviews', auth, validate(reviewCreateSchema), createReview)

export default router
