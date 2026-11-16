import { Router } from 'express'
import {
  addItem,
  cancelInvitation,
  claimItem,
  createChecklist,
  createInviteLink,
  deleteChecklist,
  deleteItem,
  getChecklist,
  inviteUser,
  listChecklists,
  removeMember,
  saveAsTemplate,
  setItemDone,
  unclaimItem,
} from '../controllers/checklist.controller.js'
import { auth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  checklistCreateSchema,
  checklistItemSchema,
  inviteUsernameSchema,
  itemDoneSchema,
  templateNameSchema,
} from '../utils/schemas.js'

const router = Router()

// semua endpoint /checklists wajib login
router.use(auth)

router.get('/', listChecklists)
router.post('/', validate(checklistCreateSchema), createChecklist)
router.get('/:id', getChecklist)
router.delete('/:id', deleteChecklist)
router.post('/:id/template', validate(templateNameSchema), saveAsTemplate)

router.post('/:id/items', validate(checklistItemSchema), addItem)
router.patch('/:id/items/:itemId', validate(itemDoneSchema), setItemDone)
router.delete('/:id/items/:itemId', deleteItem)
router.post('/:id/items/:itemId/claim', claimItem)
router.delete('/:id/items/:itemId/claim', unclaimItem)

router.delete('/:id/members/:memberId', removeMember)

router.post('/:id/invite-link', createInviteLink)
router.post('/:id/invitations', validate(inviteUsernameSchema), inviteUser)
router.delete('/:id/invitations/:invitationId', cancelInvitation)

export default router
