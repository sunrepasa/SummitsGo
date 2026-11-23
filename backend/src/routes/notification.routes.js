import { Router } from 'express'
import {
  deleteNotification,
  deleteNotifications,
  listNotifications,
  markAllRead,
  markRead,
  unreadCount,
} from '../controllers/notification.controller.js'
import { auth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { notificationDeleteQuerySchema } from '../utils/schemas.js'

const router = Router()

// notifikasi selalu milik pengguna yang login
router.use(auth)

router.get('/', listNotifications)
// sebelum /:id supaya "unread-count" tidak dianggap id
router.get('/unread-count', unreadCount)
router.post('/read-all', markAllRead)
router.patch('/:id/read', markRead)
router.delete('/', validate(notificationDeleteQuerySchema, 'query'), deleteNotifications)
router.delete('/:id', deleteNotification)

export default router
