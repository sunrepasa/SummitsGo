import { Router } from 'express'
import { acceptInvitation, declineInvitation, inviteInfo, joinByCode, myInvitations } from '../controllers/invitation.controller.js'
import { listTemplates } from '../controllers/checklist.controller.js'
import { auth } from '../middleware/auth.js'
import { optionalAuth } from '../middleware/optionalAuth.js'

// Tiga kelompok kecil yang dipasang di path berbeda (lihat routes/index.js)

// /checklist-templates
export const templateRoutes = Router()
templateRoutes.get('/', auth, listTemplates)

// /invitations — undangan langsung untuk pengguna yang login
export const invitationRoutes = Router()
invitationRoutes.use(auth)
invitationRoutes.get('/me', myInvitations)
invitationRoutes.post('/:id/accept', acceptInvitation)
invitationRoutes.post('/:id/decline', declineInvitation)

// /invites/:code — tautan undangan; pratinjau terbuka untuk tamu, bergabung wajib login
export const inviteLinkRoutes = Router()
inviteLinkRoutes.get('/:code', optionalAuth, inviteInfo)
inviteLinkRoutes.post('/:code/join', auth, joinByCode)
