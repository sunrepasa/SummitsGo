import { LIST_FIELDS, toMountain } from '../controllers/mountain.controller.js'
import Mountain from '../models/Mountain.js'
import User from '../models/User.js'
import { toDay } from './date.js'
import { toPhoto } from './photos.js'

// Bentuk respons logbook mengikuti data mock frontend (data/logbooks.js): objek gunung disertakan utuh
// karena kartu langsung memakai mountain.name, mountain.cover, dan mountain.elevation (lencana).

const idsOf = (docs, field) => [...new Set(docs.flatMap((d) => d[field] ?? []).map(String))]

// satu query untuk semua gunung yang dirujuk, bukan satu query per entri
export async function mountainMap(docs) {
  const ids = [...new Set(docs.map((d) => String(d.mountain_id)))]
  const mountains = await Mountain.find({ _id: { $in: ids } }).select(LIST_FIELDS).lean()
  return new Map(mountains.map((m) => [String(m._id), toMountain(m)]))
}

const likedBy = (doc, viewerId) => Boolean(viewerId) && (doc.likedBy ?? []).some((id) => String(id) === String(viewerId))

const dates = (doc) => ({ startDate: toDay(doc.startDate), endDate: toDay(doc.endDate), nights: doc.nights ?? null })

// ---- untuk pemilik entri (GET /logbooks/me, /logbooks/:id) ----

function toOwnerEntry(doc, mountain, users, viewerId) {
  return {
    id: String(doc._id),
    mountain,
    route: doc.route,
    ...dates(doc),
    verified: doc.verified,
    likes: doc.likes ?? 0,
    likedByMe: likedBy(doc, viewerId),
    isPublic: doc.isPublic,
    slug: doc.slug ?? null,
    note: doc.note ?? '',
    photos: (doc.photos ?? []).map(toPhoto),
    // anggota yang akunnya sudah dihapus tidak ditampilkan
    crew: (doc.crew ?? []).map((id) => users.get(String(id))).filter(Boolean),
    // nama checklist asal pendakian; diisi setelah collection checklists ada (Fase 6)
    checklistName: null,
  }
}

export async function ownerEntries(docs, viewerId) {
  const [mountains, users] = await Promise.all([
    mountainMap(docs),
    User.find({ _id: { $in: idsOf(docs, 'crew') } }).select('name').lean(),
  ])
  const userMap = new Map(users.map((u) => [String(u._id), { id: String(u._id), name: u.name }]))
  // entri yang gunungnya sudah dihapus admin dilewati supaya halaman tidak rusak
  return docs
    .filter((d) => mountains.has(String(d.mountain_id)))
    .map((d) => toOwnerEntry(d, mountains.get(String(d.mountain_id)), userMap, viewerId))
}

export const ownerEntry = async (doc, viewerId) => (await ownerEntries([doc], viewerId))[0] ?? null

export const toDraft = (doc, mountain) => ({ id: String(doc._id), mountain, route: doc.route, ...dates(doc) })

// ---- untuk publik (profil publik, halaman entri) ----
// Tanpa id database, catatan pribadi, dan daftar rombongan (FR-013: catatan tidak tampil ke publik).

export const toPublicCard = (doc, mountain, viewerId) => ({
  slug: doc.slug,
  mountain,
  route: doc.route,
  ...dates(doc),
  verified: doc.verified,
  likes: doc.likes ?? 0,
  likedByMe: likedBy(doc, viewerId),
  photos: (doc.photos ?? []).map(toPhoto),
})

export const likeState = (doc, viewerId) => ({ likes: doc.likes ?? 0, likedByMe: likedBy(doc, viewerId) })
