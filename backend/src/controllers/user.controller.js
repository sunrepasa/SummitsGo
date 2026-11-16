import mongoose from 'mongoose'
import Checklist from '../models/Checklist.js'
import ChecklistTemplate from '../models/ChecklistTemplate.js'
import Invitation from '../models/Invitation.js'
import Logbook from '../models/Logbook.js'
import User from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { checkPassword, hashPassword } from '../utils/password.js'
import { deletePhotoFiles } from '../utils/photos.js'
import { RESERVED_USERNAMES } from '../utils/schemas.js'
import { toSessionUser } from '../utils/serializer.js'
import { findMountain } from './mountain.controller.js'

const USERNAME_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // jeda ganti username 7 hari (sama dengan frontend)

const usernameTaken = () => new AppError('Username sudah dipakai', 'USERNAME_TAKEN', 409)

export async function usernameAvailable(req, res) {
  const { username } = req.valid.query
  const taken = RESERVED_USERNAMES.has(username) || (await User.exists({ username }))
  res.json({ available: !taken })
}

// PATCH /users/me — ubah profil atau privasi. Hanya field yang dikirim yang diubah.
export async function updateMe(req, res) {
  const body = req.valid.body
  const user = await User.findById(req.user.id).lean()

  const set = {}
  if (body.name !== undefined) set.name = body.name
  if (body.bio !== undefined) set.bio = body.bio
  if (body.isProfilePublic !== undefined) set.isProfilePublic = body.isProfilePublic
  // "socials.tiktok" (titik) mengubah satu isian saja tanpa menimpa isian lain di objek yang sama
  for (const [key, value] of Object.entries(body.socials ?? {})) set[`socials.${key}`] = value
  for (const [key, value] of Object.entries(body.display ?? {})) set[`display.${key}`] = value

  // frontend selalu mengirim username walau tidak diubah, jadi aturan ganti hanya berlaku bila nilainya berbeda
  if (body.username !== undefined && body.username !== user.username) {
    const unlockAt = user.usernameChangedAt ? new Date(user.usernameChangedAt).getTime() + USERNAME_COOLDOWN_MS : 0
    if (unlockAt > Date.now()) {
      throw new AppError('Username baru bisa diganti 7 hari setelah perubahan terakhir', 'USERNAME_COOLDOWN', 409)
    }
    if (RESERVED_USERNAMES.has(body.username) || (await User.exists({ username: body.username }))) throw usernameTaken()
    set.username = body.username
    set.usernameChangedAt = new Date()
  }

  let updated
  try {
    updated = await User.findByIdAndUpdate(req.user.id, { $set: set }, { returnDocument: 'after', runValidators: true }).lean()
  } catch (err) {
    // dua orang mengambil username yang sama di detik yang sama: indeks unik yang menolak
    if (err.code === 11000) throw usernameTaken()
    throw err
  }

  res.json(toSessionUser(updated))
}

// PUT /users/me/password
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.valid.body
  const user = await User.findById(req.user.id).select('+password').lean()

  // 400, bukan 401 (keputusan #4): 401 dipakai khusus untuk token yang hilang atau habis,
  // supaya frontend tidak salah mengira sesinya berakhir lalu mengeluarkan pengguna
  if (!(await checkPassword(currentPassword, user.password))) {
    throw new AppError('Kata sandi saat ini salah', 'INVALID_CREDENTIALS', 400)
  }
  if (currentPassword === newPassword) {
    throw new AppError('Kata sandi baru harus berbeda dari yang lama', 'VALIDATION_ERROR', 400)
  }

  await User.updateOne({ _id: req.user.id }, { $set: { password: await hashPassword(newPassword) } })
  res.json({ message: 'Kata sandi berhasil diubah' })
}

// DELETE /users/me — keputusan #27: akun dan data pribadinya dihapus, ulasan tetap ada
// dengan penulis "Pengguna SummitsGo" karena tetap berguna bagi pendaki lain.
export async function deleteMe(req, res) {
  const userId = req.user.id

  // akun dihapus lebih dulu: bila langkah bersih-bersih di bawah gagal di tengah jalan, pengguna
  // tetap tidak bisa masuk lagi, dan sisa data (yang tidak lagi tertaut ke akun) tidak tampil di mana pun
  await User.deleteOne({ _id: userId })

  const own = await Logbook.find({ user_id: userId }).select('photos').lean()
  await Logbook.deleteMany({ user_id: userId })
  await deletePhotoFiles(own.flatMap((e) => (e.photos ?? []).map((p) => p.url)))

  // suka yang pernah ia berikan di entri orang lain ditarik, supaya angka likes tetap sama dengan likedBy
  await Logbook.updateMany({ likedBy: userId }, { $pull: { likedBy: userId }, $inc: { likes: -1 } })
  // keluar dari daftar rombongan entri orang lain
  await Logbook.updateMany({ crew: userId }, { $pull: { crew: userId } })

  // checklist yang ia pimpin dihapus beserta undangannya (keputusan 1a)
  const led = await Checklist.find({ members: { $elemMatch: { user_id: userId, role: 'leader' } } }).select('_id').lean()
  await Checklist.deleteMany({ _id: { $in: led.map((c) => c._id) } })
  // di checklist orang lain: keluar dari anggota dan klaim barangnya dilepas (sama dengan dikeluarkan Ketua)
  const me = new mongoose.Types.ObjectId(userId)
  await Checklist.updateMany(
    { 'members.user_id': me },
    { $pull: { members: { user_id: me } }, $set: { 'items.$[mine].owner_id': null, 'items.$[mine].done': false } },
    { arrayFilters: [{ 'mine.owner_id': me }] },
  )
  // undangan untuk/dari dia, dan undangan ke checklist yang barusan dihapus
  await Invitation.deleteMany({
    $or: [{ invitedUser_id: me }, { invitedBy: me }, { checklist_id: { $in: led.map((c) => c._id) } }],
  })
  await ChecklistTemplate.deleteMany({ user_id: me })

  // Fase 7 menambah langkah di sini: hapus notifikasinya.

  // token lama otomatis tidak berlaku: middleware auth menolak akun yang sudah tidak ada
  res.json({ message: 'Akun berhasil dihapus' })
}

// GET /users/search?q=&checklistId=&limit= — cari pengguna untuk diundang (min. 2 huruf, maks. 5 hasil).
// Bentuk mengikuti mock: { id, name, username, state } dengan state 'member' | 'invited' | null.
export async function searchUsers(req, res) {
  const { q, checklistId, limit = 5 } = req.valid.query
  const keyword = q.trim().toLowerCase().replace(/^@/, '')
  if (keyword.length < 2) return res.json([]) // terlalu pendek: daftar kosong, bukan error

  // status anggota/diundang hanya boleh dilihat anggota checklist itu sendiri
  let memberIds = new Set()
  let invitedIds = new Set()
  if (checklistId) {
    const checklist = await Checklist.findById(checklistId).select('members').lean()
    if (!checklist) throw new AppError('Checklist tidak ditemukan', 'NOT_FOUND', 404)
    memberIds = new Set(checklist.members.map((m) => String(m.user_id)))
    if (!memberIds.has(req.user.id)) throw new AppError('Kamu bukan anggota checklist ini', 'FORBIDDEN', 403)
    const pending = await Invitation.find({ checklist_id: checklist._id, status: 'pending' }).select('invitedUser_id').lean()
    invitedIds = new Set(pending.map((p) => String(p.invitedUser_id)))
  }

  // kata kunci di-escape agar karakter seperti "." atau "(" tidak dibaca sebagai pola regex
  const pattern = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  const users = await User.find({ role: 'user', $or: [{ username: pattern }, { name: pattern }] })
    .select('name username')
    .sort({ username: 1 })
    .limit(limit)
    .lean()

  res.json(
    users.map((u) => ({
      id: String(u._id),
      name: u.name,
      username: u.username,
      state: memberIds.has(String(u._id)) ? 'member' : invitedIds.has(String(u._id)) ? 'invited' : null,
    })),
  )
}

// ---- gunung tersimpan (bookmark) ----
// :mountainId di path adalah slug, sama dengan id gunung di seluruh API

export async function getSavedMountain(req, res) {
  const mountain = await findMountain(req.params.mountainId)
  const saved = await User.exists({ _id: req.user.id, savedMountains: mountain._id })
  res.json({ saved: Boolean(saved) })
}

export async function saveMountain(req, res) {
  const mountain = await findMountain(req.params.mountainId)
  // $addToSet tidak menambah bila sudah ada, jadi menekan tombol simpan dua kali tetap aman
  await User.updateOne({ _id: req.user.id }, { $addToSet: { savedMountains: mountain._id } })
  res.json({ saved: true })
}

export async function unsaveMountain(req, res) {
  const mountain = await findMountain(req.params.mountainId)
  await User.updateOne({ _id: req.user.id }, { $pull: { savedMountains: mountain._id } })
  res.json({ saved: false })
}
