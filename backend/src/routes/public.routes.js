import { Router } from 'express'
import { getRouteMap } from '../controllers/mountain.controller.js'

const router = Router()

// peta jalur wajib bisa dibuka tamu; Fase 5 menambahkan /users dan /entries di sini
router.get('/mountains/:id/routes/:routeName/map', getRouteMap)

export default router
