import Logbook from '../models/Logbook.js'
import User from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { toDateOnly } from '../utils/date.js'
import { setLike } from '../utils/likes.js'
import { likeState, mountainMap, toPublicCard } from '../utils/logbookView.js'

// entri yang boleh dilihat publik: dipublikkan, bukan draf, dan sudah punya slug
const PUBLIC_ENTRY = { isPublic: true, isDraft: false, slug: { $type: 'string' } }

const entryNotFound = () => new AppError('Entri tidak tersedia', 'NOT_FOUND', 404)

// Hanya isian yang pemiliknya pilih untuk ditampilkan yang dikirim. Isian yang disembunyikan
// dikosongkan di server, bukan hanya disembunyikan di tampilan, supaya tidak terbaca lewat API.
function toPublicUser(user) {
  const display = user.display ?? {}
  const socials = user.socials ?? {}
  const shown = (key) => (display[key] !== false ? (socials[key] ?? '') : '')
  return {
    name: user.name,
    username: user.username,
    bio: user.bio ?? '',
    socials: { tiktok: shown('tiktok'), instagram: shown('instagram'), website: shown('website') },
    display: {
      joinedSince: display.joinedSince ?? true,
      extraStats: display.extraStats ?? true,
      tiktok: display.tiktok ?? true,
      instagram: display.instagram ?? true,
      website: display.website ?? true,
      shownBadges: Array.isArray(display.shownBadges) ? display.shownBadges : null,
    },
    joinedAt: display.joinedSince === false ? null : toDateOnly(user.createdAt),
  }
}

// GET /public/users/:username — tamu boleh. Profil privat dibalas 404 (keputusan #2), sama persis
// dengan profil yang tidak ada, supaya orang lain tidak bisa memastikan sebuah akun ada.
export async function getPublicProfile(req, res) {
  const user = await User.findOne({ username: String(req.params.username).toLowerCase() }).lean()
  if (!user || !user.isProfilePublic) throw new AppError('Profil tidak ditemukan', 'NOT_FOUND', 404)

  const docs = await Logbook.find({ user_id: user._id, ...PUBLIC_ENTRY }).sort({ startDate: -1, createdAt: -1 }).lean()
  const mountains = await mountainMap(docs)
  const entries = docs
    .filter((d) => mountains.has(String(d.mountain_id)))
    .map((d) => toPublicCard(d, mountains.get(String(d.mountain_id)), req.user?.id))

  res.json({ user: toPublicUser(user), entries })
}

// GET /public/entries/:slug — tamu boleh. Status publik entri berdiri sendiri dari profil publik:
// entri publik tetap bisa dibuka walau profil pemiliknya privat (FR-013).
export async function getPublicEntry(req, res) {
  const doc = await Logbook.findOne({ slug: String(req.params.slug), ...PUBLIC_ENTRY }).lean()
  if (!doc) throw entryNotFound()

  const [owner, mountains, members] = await Promise.all([
    User.findById(doc.user_id).select('name username isProfilePublic').lean(),
    mountainMap([doc]),
    User.find({ _id: { $in: doc.crew ?? [] } }).select('name username isProfilePublic').lean(),
  ])
  const mountain = mountains.get(String(doc.mountain_id))
  if (!owner || !mountain) throw entryNotFound()

  // Rombongan: pemilik selalu tampil; anggota lain hanya bila profilnya publik. Anggota berprofil
  // privat tidak dikirim namanya sama sekali, hanya dihitung (rangkuman fitur 7f: "+N anggota lainnya").
  const byId = new Map(members.map((m) => [String(m._id), m]))
  const crew = []
  let hiddenCrewCount = 0
  for (const id of doc.crew ?? []) {
    const member = byId.get(String(id))
    if (!member) continue // akun anggota sudah dihapus
    const isOwner = String(id) === String(doc.user_id)
    if (isOwner || member.isProfilePublic) {
      crew.push({ name: member.name, username: member.username, isProfilePublic: member.isProfilePublic, isOwner })
    } else {
      hiddenCrewCount++
    }
  }
  crew.sort((a, b) => Number(b.isOwner) - Number(a.isOwner)) // pemilik di urutan pertama

  res.json({
    ...toPublicCard(doc, mountain, req.user?.id),
    owner: { name: owner.name, username: owner.username, isProfilePublic: owner.isProfilePublic },
    crew,
    hiddenCrewCount,
  })
}

// PUT/DELETE /public/entries/:slug/like — wajib login
export async function likePublicEntry(req, res) {
  const doc = await Logbook.findOne({ slug: String(req.params.slug), ...PUBLIC_ENTRY }).select('_id user_id').lean()
  if (!doc) throw entryNotFound()

  await setLike(doc._id, req.user.id, req.method === 'PUT')
  // Fase 7: bila suka baru dan penyuka bukan pemilik, buat notifikasi entry_liked untuk pemilik

  const fresh = await Logbook.findById(doc._id).select('likes likedBy').lean()
  res.json(likeState(fresh, req.user.id))
}
