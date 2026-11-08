import { Router } from 'express'
import {
  getMountain,
  getMountainRoutes,
  getMountainWeather,
  listMountains,
  listProvinces,
  recommendedMountains,
} from '../controllers/mountain.controller.js'
import { validate } from '../middleware/validate.js'
import { mountainListQuerySchema } from '../utils/schemas.js'

const router = Router()

// semua tanpa token (akses tamu). /provinces dan /recommended harus di atas /:id
router.get('/', validate(mountainListQuerySchema, 'query'), listMountains)
router.get('/provinces', listProvinces)
router.get('/recommended', recommendedMountains)
router.get('/:id', getMountain)
router.get('/:id/routes', getMountainRoutes)
router.get('/:id/weather', getMountainWeather)

export default router
