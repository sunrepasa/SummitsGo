import { Router } from 'express'
import mongoose from 'mongoose'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)

router.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1
  res.json({ status: 'ok', database: connected ? 'connected' : 'disconnected', time: new Date().toISOString() })
})

export default router
