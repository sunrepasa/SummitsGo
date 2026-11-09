import crypto from 'node:crypto'
import mongoose from 'mongoose'
import Logbook, { MAX_PHOTOS } from '../models/Logbook.js'
import Mountain from '../models/Mountain.js'
import Review from '../models/Review.js'
import Route from '../models/Route.js'
import { AppError } from '../utils/AppError.js'
import { addDays, latestTodayInIndonesia, parseDay } from '../utils/date.js'
import { setLike } from '../utils/likes.js'
import { likeState, mountainMap, ownerEntries, ownerEntry, toDraft } from '../utils/logbookView.js'
import { deletePhotoFiles, savePhoto, toPhoto } from '../utils/photos.js'
import { findMountain } from './mountain.controller.js'

const notFound = () => new AppError('Entri logbook tidak ditemukan', 'NOT_FOUND', 404)
const draftNotFound = () => new AppError('Draf pendakian tidak ditemukan', 'NOT_FOUND', 404)

// Entri (bukan draf) yang boleh diakses pengguna ini. Sesuai SRS 3.3: entri milik orang lain → 403,
// tidak ada → 404. Draf hanya bisa diurus lewat /logbooks/drafts, jadi di sini dianggap tidak ada.
async function findOwnEntry(id, userId) {
  const doc = await Logbook.findOne({ _id: id, isDraft: false }).lean()
  if (!doc) throw notFound()
  if (String(doc.user_id) !== String(userId)) {
    throw new AppError('Entri ini milik pengguna lain', 'FORBIDDEN', 403)
  }
  return doc
}

// GET /logbooks/me — riwayat pendakian (tanpa draf), terbaru di atas
export async function listMyLogbooks(req, res) {
  const docs = await Logbook.find({ user_id: req.user.id, isDraft: false }).sort({ startDate: -1, createdAt: -1 }).lean()
  res.json(await ownerEntries(docs, req.user.id))
}

// GET /logbooks/drafts — pendakian terdeteksi yang menunggu konfirmasi
export async function listDrafts(req, res) {
  const docs = await Logbook.find({ user_id: req.user.id, isDraft: true }).sort({ startDate: -1 }).lean()
  const mountains = await mountainMap(docs)
  res.json(
    docs.filter((d) => mountains.has(String(d.mountain_id))).map((d) => toDraft(d, mountains.get(String(d.mountain_id)))),
  )
}

// POST /logbooks/drafts/:id/confirm — draf menjadi entri terverifikasi (SRS 3.2 catatan 3)
export async function confirmDraft(req, res) {
  const updated = await Logbook.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user.id, isDraft: true },
    { $set: { isDraft: false, verified: true } },
    { returnDocument: 'after' },
  ).lean()
  if (!updated) throw draftNotFound()
  // Fase 7: buat notifikasi trip_verified untuk pemilik
  res.json(await ownerEntry(updated, req.user.id))
}

// DELETE /logbooks/drafts/:id — buang draf
export async function dismissDraft(req, res) {
  const draft = await Logbook.findOneAndDelete({ _id: req.params.id, user_id: req.user.id, isDraft: true }).lean()
  if (!draft) throw draftNotFound()
  await deletePhotoFiles((draft.photos ?? []).map((p) => p.url))
  res.json({ message: 'Draf dibuang' })
}

// POST /logbooks — entri manual (multipart/form-data). Selalu verified: false (FR-009).
export async function createLogbook(req, res) {
  const { mountainId, route, startDate, days, note } = req.valid.body

  const start = parseDay(startDate)
  if (!start) throw new AppError('Tanggal tidak valid', 'VALIDATION_ERROR', 400)
  if (startDate > latestTodayInIndonesia()) {
    throw new AppError('Tanggal tidak boleh di masa depan', 'VALIDATION_ERROR', 400)
  }

  const mountain = await findMountain(mountainId)
  if (!(await Route.exists({ mountain_id: mountain._id, name: route }))) {
    throw new AppError('Jalur tidak ditemukan di gunung ini', 'VALIDATION_ERROR', 400)
  }

  // foto disimpan paling akhir: bila pemeriksaan di atas gagal, tidak ada berkas yang tertinggal
  const photos = req.file ? [{ url: await savePhoto(req.file) }] : []

  let doc
  try {
    doc = await Logbook.create({
      user_id: req.user.id,
      mountain_id: mountain._id,
      route,
      startDate: start,
      // tanpa lama pendakian: dianggap selesai di hari yang sama, tetapi nights tetap null ("tidak diisi")
      endDate: days ? addDays(start, days - 1) : start,
      nights: days ? days - 1 : null,
      note,
      photos,
      verified: false,
      isDraft: false,
    })
  } catch (err) {
    await deletePhotoFiles(photos.map((p) => p.url))
    throw err
  }

  res.status(201).json(await ownerEntry(doc.toObject(), req.user.id))
}

// GET /logbooks/:id — detail + rekap "Didaki N×" (dihitung saat dibaca, SRS 3.2 catatan 2)
export async function getLogbook(req, res) {
  const doc = await findOwnEntry(req.params.id, req.user.id)
  const sameMountain = await Logbook.find({ user_id: req.user.id, mountain_id: doc.mountain_id, isDraft: false })
    .select('verified')
    .lean()
  const verified = sameMountain.filter((e) => e.verified).length
  const entry = await ownerEntry(doc, req.user.id)
  if (!entry) throw notFound() // gunungnya sudah dihapus admin
  res.json({ ...entry, climbs: { verified, manual: sameMountain.length - verified } })
}

// PUT /logbooks/:id — ubah catatan
export async function updateNote(req, res) {
  await findOwnEntry(req.params.id, req.user.id)
  const updated = await Logbook.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { note: req.valid.body.note } },
    { returnDocument: 'after' },
  ).lean()
  res.json(await ownerEntry(updated, req.user.id))
}

// DELETE /logbooks/:id
export async function deleteLogbook(req, res) {
  const doc = await findOwnEntry(req.params.id, req.user.id)
  await Logbook.deleteOne({ _id: doc._id })
  await deletePhotoFiles((doc.photos ?? []).map((p) => p.url))
  // ulasan yang ditulis dari entri ini tetap ada, hanya rujukannya dilepas
  await Review.updateMany({ logbook_id: doc._id }, { $set: { logbook_id: null } })
  res.json({ message: 'Entri logbook dihapus' })
}

// POST /logbooks/:id/photos — tambah satu foto (maksimal 10 per entri)
export async function addPhoto(req, res) {
  const doc = await findOwnEntry(req.params.id, req.user.id)
  if (!req.file) throw new AppError('Pilih foto yang akan diunggah', 'VALIDATION_ERROR', 400)
  if ((doc.photos ?? []).length >= MAX_PHOTOS) throw photoLimit()

  const photo = { _id: new mongoose.Types.ObjectId(), url: await savePhoto(req.file) }
  // syarat "foto ke-10 belum ada" diperiksa bersamaan dengan penambahan, jadi dua unggahan bersamaan
  // saat foto sudah 9 tidak bisa membuat entri berisi 11 foto
  const result = await Logbook.updateOne(
    { _id: doc._id, [`photos.${MAX_PHOTOS - 1}`]: { $exists: false } },
    { $push: { photos: photo } },
  )
  if (result.modifiedCount === 0) {
    await deletePhotoFiles([photo.url])
    throw photoLimit()
  }
  res.status(201).json(toPhoto(photo))
}

const photoLimit = () => new AppError(`Maksimal ${MAX_PHOTOS} foto per entri`, 'PHOTO_LIMIT', 409)

// PATCH /logbooks/:id/visibility — publik/privat. Slug dibuat sekali saat pertama dipublikkan.
export async function setVisibility(req, res) {
  const { isPublic } = req.valid.body
  const doc = await findOwnEntry(req.params.id, req.user.id)

  if (!isPublic || doc.slug) {
    await Logbook.updateOne({ _id: doc._id }, { $set: { isPublic } })
    return res.json({ isPublic, slug: doc.slug ?? null })
  }

  const mountain = await Mountain.findById(doc.mountain_id).select('slug').lean()
  // bagian acak 6 karakter: tabrakan sangat jarang, tetapi tetap ditangani dengan mencoba ulang
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = makeSlug(mountain?.slug ?? 'entri', doc.route)
    try {
      // syarat slug belum ada: bila dua permintaan datang bersamaan, hanya satu yang menulis slug
      const result = await Logbook.updateOne({ _id: doc._id, slug: { $exists: false } }, { $set: { isPublic: true, slug } })
      if (result.modifiedCount === 0) break // permintaan lain sudah membuat slug lebih dulu
      return res.json({ isPublic: true, slug })
    } catch (err) {
      if (err.code !== 11000) throw err
    }
  }

  const current = await Logbook.findById(doc._id).select('slug').lean()
  if (!current?.slug) throw new Error('Gagal membuat slug unik')
  await Logbook.updateOne({ _id: doc._id }, { $set: { isPublic: true } })
  res.json({ isPublic: true, slug: current.slug })
}

// "Pura Jati" → "pura-jati"; huruf beraksen dibuang aksennya
const slugify = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'jalur'

const randomPart = () => crypto.randomBytes(6).toString('base64url').toLowerCase().replace(/[^a-z0-9]/g, '').padEnd(6, '0').slice(0, 6)

const makeSlug = (mountainSlug, route) => `${mountainSlug}-${slugify(route)}-${randomPart()}`

// POST/DELETE /logbooks/:id/like — suka entri milik sendiri (SRS 3.3)
export async function likeOwn(req, res) {
  const doc = await findOwnEntry(req.params.id, req.user.id)
  await setLike(doc._id, req.user.id, req.method === 'POST')
  const fresh = await Logbook.findById(doc._id).select('likes likedBy').lean()
  res.json(likeState(fresh, req.user.id))
}
