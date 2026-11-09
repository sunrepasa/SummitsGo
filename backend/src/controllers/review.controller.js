import Logbook from '../models/Logbook.js'
import Review from '../models/Review.js'
import Route from '../models/Route.js'
import User from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { toDateOnly } from '../utils/date.js'
import { findMountain } from './mountain.controller.js'

// batas sementara sampai ada paginasi dari server
const LIST_LIMIT = 100

// Bentuk mengikuti data mock frontend (data/reviews.js): author = nama tampil, createdAt = YYYY-MM-DD.
// user_id tidak dikirim agar daftar ulasan publik tidak membocorkan id akun.
const toReview = (review, mountainSlug, authorName) => ({
  id: String(review._id),
  mountainId: mountainSlug,
  author: authorName ?? 'Pengguna SummitsGo', // akun penulis sudah dihapus
  verified: review.verified,
  rating: review.rating,
  tags: review.tags,
  text: review.text,
  route: review.route,
  createdAt: toDateOnly(review.createdAt),
})

// GET /mountains/:id/reviews (tamu boleh) — hanya ulasan yang sudah disetujui admin
export async function listReviews(req, res) {
  const mountain = await findMountain(req.params.id)

  const reviews = await Review.find({ mountain_id: mountain._id, status: 'approved' })
    .sort({ createdAt: -1, _id: -1 })
    .limit(LIST_LIMIT)
    .populate('user_id', 'name')
    .lean()

  res.json(reviews.map((r) => toReview(r, mountain.slug, r.user_id?.name)))
}

// POST /mountains/:id/reviews (wajib login) — tersimpan sebagai pending sampai dimoderasi
export async function createReview(req, res) {
  const mountain = await findMountain(req.params.id)
  const { rating, text, tags, route, logbookId } = req.valid.body
  const userId = req.user.id

  // satu ulasan per pengguna per gunung (keputusan #28); ulasan yang ditolak admin boleh ditulis ulang
  if (await Review.exists({ mountain_id: mountain._id, user_id: userId, status: { $in: ['pending', 'approved'] } })) {
    throw new AppError('Kamu sudah menulis ulasan untuk gunung ini', 'ALREADY_REVIEWED', 409)
  }

  if (route &&!(await Route.exists({ mountain_id: mountain._id, name: route }))) {
    throw new AppError('Jalur tidak ditemukan di gunung ini', 'VALIDATION_ERROR', 400)
  }

  // logbook yang dirujuk harus milik penulis dan di gunung yang sama, supaya tidak bisa meminjam pendakian orang lain
  if (logbookId && !(await Logbook.exists({ _id: logbookId, user_id: userId, mountain_id: mountain._id }))) {
    throw new AppError('Logbook tidak valid untuk ulasan ini', 'VALIDATION_ERROR', 400)
  }

  // label "Terverifikasi" dihitung di sini: punya pendakian terverifikasi (bukan draf) di gunung ini
  const verified = Boolean(
    await Logbook.exists({ user_id: userId, mountain_id: mountain._id, verified: true, isDraft: { $ne: true } }),
  )

  const review = await Review.create({
    mountain_id: mountain._id,
    user_id: userId,
    route,
    logbook_id: logbookId,
    rating,
    tags,
    text,
    verified,
  })

  const author = await User.findById(userId).select('name').lean()
  // status ikut dikirim agar klien tahu ulasan masih menunggu moderasi
  res.status(201).json({ ...toReview(review, mountain.slug, author?.name), status: review.status })
}
