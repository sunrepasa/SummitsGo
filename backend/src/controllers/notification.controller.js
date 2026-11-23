import mongoose from 'mongoose'
import Notification from '../models/Notification.js'
import { AppError } from '../utils/AppError.js'
import { ensurePlanReminders } from '../utils/notify.js'
import { serialize } from '../utils/serializer.js'

const { ObjectId } = mongoose.Types

// batas aman isi daftar; frontend menampilkan 10 pertama lalu "Lihat semua"
const LIST_LIMIT = 100

const notFound = () => new AppError('Notifikasi tidak ditemukan', 'NOT_FOUND', 404)
const asObjectId = (value) => (ObjectId.isValid(value) && String(new ObjectId(value)) === String(value).toLowerCase() ? new ObjectId(value) : null)

// createdAt dikirim sebagai angka milidetik (keputusan #5), karena frontend menghitung "12 menit lalu"
// dengan Date.now() - createdAt
const toNotification = (doc) => {
  const { id, type, text, to, read } = serialize(doc)
  return { id, type, text, to, read, createdAt: new Date(doc.createdAt).getTime() }
}

// GET /notifications — terbaru di atas
export async function listNotifications(req, res) {
  await ensurePlanReminders(req.user.id)
  const docs = await Notification.find({ user_id: req.user.id }).sort({ createdAt: -1 }).limit(LIST_LIMIT).lean()
  res.json(docs.map(toNotification))
}

// GET /notifications/unread-count → { count }
export async function unreadCount(req, res) {
  // lonceng memanggil endpoint ini di setiap pindah halaman, jadi pengingat rencana ikut dicek di sini
  await ensurePlanReminders(req.user.id)
  const count = await Notification.countDocuments({ user_id: req.user.id, read: false })
  res.json({ count })
}

// PATCH /notifications/:id/read — notifikasi milik orang lain dianggap tidak ada (404, bukan 403)
export async function markRead(req, res) {
  const id = asObjectId(req.params.id)
  const doc = id && (await Notification.findOneAndUpdate({ _id: id, user_id: req.user.id }, { $set: { read: true } }, { returnDocument: 'after' }).lean())
  if (!doc) throw notFound()
  res.json(toNotification(doc))
}

// POST /notifications/read-all
export async function markAllRead(req, res) {
  const result = await Notification.updateMany({ user_id: req.user.id, read: false }, { $set: { read: true } })
  res.json({ message: 'Semua notifikasi ditandai dibaca', count: result.modifiedCount })
}

// DELETE /notifications/:id
export async function deleteNotification(req, res) {
  const id = asObjectId(req.params.id)
  const result = id ? await Notification.deleteOne({ _id: id, user_id: req.user.id }) : { deletedCount: 0 }
  if (result.deletedCount === 0) throw notFound()
  res.json({ message: 'Notifikasi dihapus' })
}

// DELETE /notifications — semua, atau ?status=read untuk yang sudah dibaca saja
export async function deleteNotifications(req, res) {
  const filter = { user_id: req.user.id }
  if (req.valid.query.status === 'read') filter.read = true
  const result = await Notification.deleteMany(filter)
  res.json({ message: 'Notifikasi dihapus', count: result.deletedCount })
}
