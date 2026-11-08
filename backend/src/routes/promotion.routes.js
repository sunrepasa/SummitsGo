import { Router } from 'express'
import { promotions } from '../data/promotions.js'

const router = Router()

router.get('/', (req, res) => res.json(promotions))

export default router
