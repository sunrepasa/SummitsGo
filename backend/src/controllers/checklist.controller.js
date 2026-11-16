import crypto from 'node:crypto'
import mongoose from 'mongoose'
import { env } from '../config/env.js'
import Checklist, { MAX_ITEMS } from '../models/Checklist.js'
import ChecklistTemplate from '../models/ChecklistTemplate.js'
import Invitation from '../models/Invitation.js'
import Route from '../models/Route.js'
import User from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { checklistDetail, checklistSummaries } from '../utils/checklistView.js'
import { parseDay, toDateOnly } from '../utils/date.js'
import { findMountain } from './mountain.controller.js'

const { ObjectId } = mongoose.Types

// ---- penolakan yang sering dipakai ----
const checklistNotFound = () => new AppError('Checklist tidak ditemukan', 'NOT_FOUND', 404)
const itemNotFound = () => new AppError('Barang tidak ditemukan', 'ITEM_NOT_FOUND', 404)
const leaderOnly = () => new AppError('Hanya Ketua yang boleh melakukan ini', 'FORBIDDEN', 403)

// id dari URL yang bukan ObjectId sah dianggap "tidak ada", bukan error server
const asObjectId = (value) => (ObjectId.isValid(value) && String(new ObjectId(value)) === String(value).toLowerCase() ? new ObjectId(value) : null)

// Checklist yang boleh diakses pengguna ini. Sesuai SRS 3.3: tidak ada → 404, bukan anggota → 403.
async function loadForMember(checklistId, userId) {
  const id = asObjectId(checklistId)
  const doc = id && (await Checklist.findById(id).lean())
  if (!doc) throw checklistNotFound()
  const member = doc.members.find((m) => String(m.user_id) === String(userId))
  if (!member) throw new AppError('Kamu bukan anggota checklist ini', 'FORBIDDEN', 403)
  return { doc, role: member.role }
}

async function loadForLeader(checklistId, userId) {
  const loaded = await loadForMember(checklistId, userId)
  if (loaded.role !== 'leader') throw leaderOnly()
  return loaded
}

const findItem = (doc, itemId) => doc.items.find((i) => String(i._id) === String(itemId))

// kode undangan 6 huruf/angka kecil, mudah diketik ulang dari tautan
const newInviteCode = () => crypto.randomBytes(8).toString('base64url').toLowerCase().replace(/[^a-z0-9]/g, '').padEnd(6, 'x').slice(0, 6)

// ---------- daftar, buat, detail, hapus ----------

// GET /checklists — checklist yang saya pimpin atau ikuti, terbaru di atas
export async function listChecklists(req, res) {
  const docs = await Checklist.find({ 'members.user_id': req.user.id }).sort({ createdAt: -1 }).lean()
  res.json(await checklistSummaries(docs, req.user.id))
}

// POST /checklists — pembuat otomatis menjadi Ketua
export async function createChecklist(req, res) {
  const { mountainId, route, plannedDate, templateId } = req.valid.body
  const me = new ObjectId(req.user.id)

  let planned = null
  if (plannedDate) {
    planned = parseDay(plannedDate)
    if (!planned) throw new AppError('Tanggal rencana tidak valid', 'VALIDATION_ERROR', 400)
    // dibandingkan dengan "hari ini" WIB (zona paling barat): tanggal hari ini di mana pun di Indonesia tetap lolos
    if (plannedDate < toDateOnly(new Date())) throw new AppError('Tanggal rencana tidak boleh di masa lalu', 'VALIDATION_ERROR', 400)
  }

  const mountain = await findMountain(mountainId)
  if (!(await Route.exists({ mountain_id: mountain._id, name: route }))) {
    throw new AppError('Jalur tidak ditemukan di gunung ini', 'VALIDATION_ERROR', 400)
  }

  let items = []
  if (templateId) {
    // template bawaan sistem (user_id null) atau milik sendiri; template orang lain tidak bisa dipakai
    const template = await ChecklistTemplate.findOne({ _id: templateId, $or: [{ user_id: null }, { user_id: me }] }).lean()
    if (!template) throw new AppError('Template tidak ditemukan', 'NOT_FOUND', 404)
    items = template.items.map(({ name, category }) => ({ name, category, owner_id: null, done: false, addedBy: me }))
  }

  // kode undangan harus unik; tabrakan sangat jarang, tetapi tetap dicoba ulang
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const doc = await Checklist.create({
        mountain_id: mountain._id,
        route,
        plannedDate: planned,
        inviteCode: newInviteCode(),
        members: [{ user_id: me, role: 'leader' }],
        items,
      })
      return res.status(201).json(await checklistDetail(doc.toObject(), req.user.id))
    } catch (err) {
      if (err.code !== 11000) throw err
    }
  }
  throw new Error('Gagal membuat kode undangan unik')
}

// GET /checklists/:id
export async function getChecklist(req, res) {
  const { doc } = await loadForMember(req.params.id, req.user.id)
  res.json(await checklistDetail(doc, req.user.id))
}

// DELETE /checklists/:id — hanya Ketua
export async function deleteChecklist(req, res) {
  const { doc } = await loadForLeader(req.params.id, req.user.id)
  await Checklist.deleteOne({ _id: doc._id })
  await Invitation.deleteMany({ checklist_id: doc._id })
  res.json({ message: 'Checklist dihapus' })
}

// ---------- template ----------

const toTemplate = (t) => ({ id: String(t._id), name: t.name, itemCount: t.items.length })

// GET /checklist-templates — { mine, system }
export async function listTemplates(req, res) {
  const [mine, system] = await Promise.all([
    ChecklistTemplate.find({ user_id: req.user.id }).sort({ createdAt: -1 }).lean(),
    ChecklistTemplate.find({ user_id: null }).sort({ createdAt: 1 }).lean(),
  ])
  res.json({ mine: mine.map(toTemplate), system: system.map(toTemplate) })
}

// POST /checklists/:id/template — simpan barang (tanpa klaim dan centang) sebagai template milik sendiri
export async function saveAsTemplate(req, res) {
  const { doc } = await loadForLeader(req.params.id, req.user.id)
  const template = await ChecklistTemplate.create({
    user_id: req.user.id,
    name: req.valid.body.name,
    items: doc.items.map(({ name, category }) => ({ name, category })),
  })
  res.status(201).json(toTemplate(template))
}

// ---------- barang ----------
// Perubahan barang memakai "arrayFilters": syarat (misal "belum diklaim") diperiksa dan perubahan
// ditulis dalam SATU perintah ke database. Dua anggota yang mengklaim barang yang sama di detik yang
// sama tidak bisa sama-sama berhasil; yang kedua mendapat 409.

const toItem = (i) => ({
  id: String(i._id),
  name: i.name,
  category: i.category,
  ownerId: i.owner_id ? String(i.owner_id) : null,
  done: i.done,
  addedBy: String(i.addedBy),
})

// POST /checklists/:id/items — semua anggota boleh menambah
export async function addItem(req, res) {
  const { doc } = await loadForMember(req.params.id, req.user.id)
  const { name, category } = req.valid.body

  // kategori yang sudah ada dipakai ulang tanpa memandang huruf besar-kecil ("pakaian" → "Pakaian")
  const existing = doc.items.find((i) => i.category.toLowerCase() === category.toLowerCase())
  const item = { _id: new ObjectId(), name, category: existing?.category ?? category, owner_id: null, done: false, addedBy: new ObjectId(req.user.id) }

  const result = await Checklist.updateOne(
    { _id: doc._id, [`items.${MAX_ITEMS - 1}`]: { $exists: false } },
    { $push: { items: item } },
  )
  if (result.modifiedCount === 0) {
    throw new AppError(`Maksimal ${MAX_ITEMS} barang per checklist`, 'VALIDATION_ERROR', 400)
  }
  res.status(201).json(toItem(item))
}

// PATCH /checklists/:id/items/:itemId — centang/batal centang, hanya pemilik klaim
export async function setItemDone(req, res) {
  const { doc } = await loadForMember(req.params.id, req.user.id)
  const item = findItem(doc, req.params.itemId)
  if (!item) throw itemNotFound()

  // dicek lebih dulu supaya barang yang belum diklaim tidak pernah ikut tercentang
  if (String(item.owner_id) !== req.user.id) throw notOwnerOfItem()

  const me = new ObjectId(req.user.id)
  const { done } = req.valid.body
  // syarat pemilik tetap ada di filter: kalau klaim berubah di antara baca dan tulis, tidak ada yang tertulis
  await Checklist.updateOne(
    { _id: doc._id, items: { $elemMatch: { _id: item._id, owner_id: me } } },
    { $set: { 'items.$[it].done': done } },
    { arrayFilters: [{ 'it._id': item._id, 'it.owner_id': me }] },
  )

  const fresh = findItem((await Checklist.findById(doc._id).select('items').lean()) ?? { items: [] }, item._id)
  if (!fresh) throw itemNotFound()
  if (String(fresh.owner_id) !== req.user.id) throw notOwnerOfItem()
  res.json(toItem(fresh))
}

const notOwnerOfItem = () => new AppError('Hanya anggota yang mengklaim barang ini yang bisa mencentangnya', 'FORBIDDEN', 403)

// DELETE /checklists/:id/items/:itemId — Ketua, atau penambah barang selama belum diklaim siapa pun
export async function deleteItem(req, res) {
  const { doc, role } = await loadForMember(req.params.id, req.user.id)
  const item = findItem(doc, req.params.itemId)
  if (!item) throw itemNotFound()

  const condition = role === 'leader' ? { _id: item._id } : { _id: item._id, addedBy: new ObjectId(req.user.id), owner_id: null }
  const result = await Checklist.updateOne({ _id: doc._id }, { $pull: { items: condition } })
  if (result.modifiedCount === 0) {
    throw new AppError('Barang ini hanya bisa dihapus Ketua atau penambahnya selama belum diklaim', 'FORBIDDEN', 403)
  }
  res.json({ message: 'Barang dihapus' })
}

// POST /checklists/:id/items/:itemId/claim
export async function claimItem(req, res) {
  const { doc } = await loadForMember(req.params.id, req.user.id)
  const item = findItem(doc, req.params.itemId)
  if (!item) throw itemNotFound()

  const me = new ObjectId(req.user.id)
  // syarat "belum diklaim" dipasang di filter dokumen ($elemMatch) DAN di arrayFilters:
  // dokumen hanya ditulis kalau barangnya masih bebas tepat saat penulisan
  const result = await Checklist.updateOne(
    { _id: doc._id, items: { $elemMatch: { _id: item._id, owner_id: null } } },
    { $set: { 'items.$[it].owner_id': me } },
    { arrayFilters: [{ 'it._id': item._id, 'it.owner_id': null }] },
  )

  if (result.modifiedCount === 0) {
    const fresh = findItem((await Checklist.findById(doc._id).select('items').lean()) ?? { items: [] }, item._id)
    if (!fresh) throw itemNotFound()
    // mengklaim barang yang sudah diklaim sendiri tidak dianggap gagal
    if (String(fresh.owner_id) !== req.user.id) {
      throw new AppError('Barang ini sudah diklaim anggota lain', 'ALREADY_CLAIMED', 409)
    }
    return res.json(toItem(fresh))
  }
  res.json(toItem({ ...item, owner_id: me }))
}

// DELETE /checklists/:id/items/:itemId/claim — hanya klaim sendiri yang belum dicentang
export async function unclaimItem(req, res) {
  const { doc } = await loadForMember(req.params.id, req.user.id)
  const item = findItem(doc, req.params.itemId)
  if (!item) throw itemNotFound()

  // barang bebas dan belum dicentang: tidak ada yang perlu dibatalkan, dianggap berhasil
  if (!item.owner_id && !item.done) return res.json(toItem(item))
  if (String(item.owner_id) !== req.user.id) {
    throw new AppError('Kamu tidak sedang mengklaim barang ini', 'FORBIDDEN', 403)
  }
  if (item.done) throw new AppError('Batalkan centang dulu sebelum melepas klaim', 'FORBIDDEN', 403)

  const me = new ObjectId(req.user.id)
  const result = await Checklist.updateOne(
    { _id: doc._id, items: { $elemMatch: { _id: item._id, owner_id: me, done: false } } },
    { $set: { 'items.$[it].owner_id': null } },
    { arrayFilters: [{ 'it._id': item._id, 'it.owner_id': me, 'it.done': false }] },
  )
  if (result.modifiedCount === 0) {
    // data berubah di antara baca dan tulis (misalnya barang baru saja dicentang)
    throw new AppError('Hanya klaim milikmu yang belum dicentang yang bisa dibatalkan', 'FORBIDDEN', 403)
  }
  res.json(toItem({ ...item, owner_id: null }))
}

// ---------- anggota ----------

// DELETE /checklists/:id/members/:memberId — Ketua mengeluarkan anggota, atau anggota keluar sendiri.
// Barang yang diklaim orang itu kembali belum diklaim dan centangnya dihapus (sama dengan mock frontend).
export async function removeMember(req, res) {
  const { doc, role } = await loadForMember(req.params.id, req.user.id)
  const targetId = req.params.memberId
  const leavingSelf = targetId === req.user.id

  if (!leavingSelf && role !== 'leader') throw leaderOnly()
  if (leavingSelf && role === 'leader') {
    throw new AppError('Ketua tidak bisa keluar. Hapus checklist bila sudah tidak dipakai.', 'FORBIDDEN', 403)
  }

  const target = doc.members.find((m) => String(m.user_id) === targetId)
  if (!target) throw new AppError('Anggota tidak ditemukan', 'NOT_FOUND', 404)
  if (target.role === 'leader') throw leaderOnly() // hanya terjadi bila id Ketua sendiri yang dikirim

  // satu perintah: keluarkan dari daftar anggota DAN lepaskan semua klaimnya
  await Checklist.updateOne(
    { _id: doc._id },
    {
      $pull: { members: { user_id: target.user_id } },
      $set: { 'items.$[mine].owner_id': null, 'items.$[mine].done': false },
    },
    { arrayFilters: [{ 'mine.owner_id': target.user_id }] },
  )
  res.json({ message: leavingSelf ? 'Kamu sudah keluar dari checklist' : 'Anggota dikeluarkan' })
}

// ---------- undangan dari sisi Ketua ----------

// POST /checklists/:id/invite-link — tautan tetap (kode yang sama) supaya tautan yang sudah dibagikan tidak mati
export async function createInviteLink(req, res) {
  const { doc } = await loadForLeader(req.params.id, req.user.id)
  res.json({ url: `${env.frontendUrl}/join/${doc.inviteCode}` })
}

// POST /checklists/:id/invitations — undang lewat username
export async function inviteUser(req, res) {
  const { doc } = await loadForLeader(req.params.id, req.user.id)
  const user = await User.findOne({ username: req.valid.body.username, role: 'user' }).select('name username').lean()
  if (!user) throw new AppError('Pengguna tidak ditemukan', 'USER_NOT_FOUND', 404)
  if (doc.members.some((m) => String(m.user_id) === String(user._id))) {
    throw new AppError('Sudah menjadi anggota', 'ALREADY_MEMBER', 409)
  }

  let invitation
  try {
    invitation = await Invitation.create({ checklist_id: doc._id, invitedUser_id: user._id, invitedBy: req.user.id })
  } catch (err) {
    // indeks unik "satu undangan pending per orang per checklist" yang menolak
    if (err.code === 11000) throw new AppError('Sudah diundang', 'ALREADY_INVITED', 409)
    throw err
  }
  // Fase 7: buat notifikasi checklist_invite untuk pengguna yang diundang

  res.status(201).json({ id: String(invitation._id), userId: String(user._id), username: user.username, name: user.name })
}

// DELETE /checklists/:id/invitations/:invitationId — batalkan undangan yang masih pending
export async function cancelInvitation(req, res) {
  const { doc } = await loadForLeader(req.params.id, req.user.id)
  const invitationId = asObjectId(req.params.invitationId)
  const result = invitationId
    ? await Invitation.deleteOne({ _id: invitationId, checklist_id: doc._id, status: 'pending' })
    : { deletedCount: 0 }
  if (result.deletedCount === 0) throw new AppError('Undangan tidak ditemukan', 'NOT_FOUND', 404)
  res.json({ message: 'Undangan dibatalkan' })
}
