import { Router } from 'express'
import mongoose from 'mongoose'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import mountainRoutes from './mountain.routes.js'
import publicRoutes from './public.routes.js'
import promotionRoutes from './promotion.routes.js'
import logbookRoutes from './logbook.routes.js'
import checklistRoutes from './checklist.routes.js'
import { inviteLinkRoutes, invitationRoutes, templateRoutes } from './invitation.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/mountains', mountainRoutes)
router.use('/logbooks', logbookRoutes)
router.use('/checklists', checklistRoutes)
router.use('/checklist-templates', templateRoutes)
router.use('/invitations', invitationRoutes)
router.use('/invites', inviteLinkRoutes)
router.use('/public', publicRoutes)
router.use('/promotions', promotionRoutes)

router.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1
  res.json({ status: 'ok', database: connected ? 'connected' : 'disconnected', time: new Date().toISOString() })
})

export default router
