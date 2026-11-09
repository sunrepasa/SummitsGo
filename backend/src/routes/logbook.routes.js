import { Router } from 'express'
import {
  addPhoto,
  confirmDraft,
  createLogbook,
  deleteLogbook,
  dismissDraft,
  getLogbook,
  likeOwn,
  listDrafts,
  listMyLogbooks,
  setVisibility,
  updateNote,
} from '../controllers/logbook.controller.js'
import { auth } from '../middleware/auth.js'
import { uploadPhoto } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'
import { logbookCreateSchema, logbookNoteSchema, logbookVisibilitySchema } from '../utils/schemas.js'

const router = Router()

// Semua endpoint logbook wajib login. auth dipasang paling depan, sebelum pembaca unggahan (multer),
// supaya foto dari tamu ditolak sebelum isinya dibaca server.
router.use(auth)

// path tetap (/me, /drafts) harus di atas /:id supaya kata "me" tidak dianggap id entri
router.get('/me', listMyLogbooks)
router.get('/drafts', listDrafts)
router.post('/drafts/:id/confirm', confirmDraft)
router.delete('/drafts/:id', dismissDraft)

// multipart: uploadPhoto mengisi req.body (teks) dan req.file (foto), baru kemudian divalidasi
router.post('/', uploadPhoto, validate(logbookCreateSchema), createLogbook)

router.get('/:id', getLogbook)
router.put('/:id', validate(logbookNoteSchema), updateNote)
router.delete('/:id', deleteLogbook)
router.post('/:id/photos', uploadPhoto, addPhoto)
router.patch('/:id/visibility', validate(logbookVisibilitySchema), setVisibility)
router.post('/:id/like', likeOwn)
router.delete('/:id/like', likeOwn)

export default router
