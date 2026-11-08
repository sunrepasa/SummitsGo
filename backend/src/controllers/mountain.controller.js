import Mountain from '../models/Mountain.js'
import Route from '../models/Route.js'
import { AppError } from '../utils/AppError.js'
import { toDateOnly } from '../utils/date.js'
import { nearestIndex } from '../utils/geo.js'
import { serialize } from '../utils/serializer.js'

const LIST_FIELDS = 'slug name location province elevation difficulty status rating reviewCount popularity cover createdAt'
const COLLATION = { locale: 'id', strength: 2 } // urutan nama ala bahasa Indonesia, tidak peka huruf besar/kecil

const notFound = () => new AppError('Gunung tidak ditemukan', 'NOT_FOUND', 404)

// id di respons = slug (keputusan #1); managed_by dan id database tidak dikirim
function toMountain(doc) {
  const { id, slug, managedBy, ...rest } = serialize(doc)
  const result = { id: slug, ...rest }
  if (doc.updatedAt) result.updatedAt = toDateOnly(doc.updatedAt) // mock mengirim YYYY-MM-DD
  return result
}

const toRoute = (route) => ({
  name: route.name,
  difficulty: route.difficulty,
  duration: route.duration,
  description: route.description,
  mapAvailable: route.path.length >= 2,
  basecamp: route.basecamp ?? null,
  posts: serialize(route.posts),
})

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const SORTS = {
  popular: { popularity: -1, name: 1, _id: 1 },
  newest: { createdAt: -1, _id: 1 },
  name: { name: 1, _id: 1 },
  // belum ada lokasi pengguna di server (batasan: server tidak menyimpan posisi), jadi sama dengan populer
  nearest: { popularity: -1, name: 1, _id: 1 },
}

// dipakai ulang oleh controller lain (ulasan, checklist, logbook) yang menerima slug gunung di path
export async function findMountain(slug) {
  const mountain = await Mountain.findOne({ slug: String(slug).toLowerCase() }).lean()
  if (!mountain) throw notFound()
  return mountain
}

export async function listMountains(req, res) {
  const { sort, limit, q, location, difficulty, status, minElevation, maxElevation } = req.valid.query

  const filter = {}
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i')
    filter.$or = [{ name: pattern }, { location: pattern }, { province: pattern }]
  }
  if (location) filter.province = location
  if (difficulty.length) filter.difficulty = { $in: difficulty }
  if (status.length) filter.status = { $in: status }
  if (minElevation != null || maxElevation != null) {
    filter.elevation = {}
    if (minElevation != null) filter.elevation.$gte = minElevation
    if (maxElevation != null) filter.elevation.$lte = maxElevation
  }

  let query = Mountain.find(filter).select(LIST_FIELDS).sort(SORTS[sort]).collation(COLLATION)
  if (limit) query = query.limit(limit)
  const mountains = await query.lean()

  res.json(mountains.map(toMountain))
}

export async function listProvinces(req, res) {
  const provinces = await Mountain.distinct('province')
  res.json(provinces.sort((a, b) => a.localeCompare(b, 'id')))
}

// aturan sementara: gunung berstatus buka, urut populer lalu rating; maksimal 4
export async function recommendedMountains(req, res) {
  const mountains = await Mountain.find({ status: 'open' })
    .select(LIST_FIELDS)
    .sort({ popularity: -1, rating: -1, name: 1, _id: 1 })
    .limit(4)
    .collation(COLLATION)
    .lean()
  res.json(mountains.map(toMountain))
}

export async function getMountain(req, res) {
  const mountain = await findMountain(req.params.id)
  const routes = await Route.find({ mountain_id: mountain._id }).sort({ _id: 1 }).lean()
  res.json({ ...toMountain(mountain), routes: routes.map(toRoute) })
}

export async function getMountainRoutes(req, res) {
  const mountain = await findMountain(req.params.id)
  const routes = await Route.find({ mountain_id: mountain._id }).select('name').sort({ _id: 1 }).lean()
  res.json(routes.map((route) => route.name))
}

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
// SEMENTARA: data contoh sama untuk semua gunung, bukan cuaca sungguhan. Sumber asli menunggu keputusan Yoga.
const WEATHER_SAMPLE = [
  { icon: 'partly', temp: 18 },
  { icon: 'rain', temp: 15 },
  { icon: 'sun', temp: 20 },
  { icon: 'partly', temp: 17 },
  { icon: 'cloud', temp: 19 },
]

export async function getMountainWeather(req, res) {
  await findMountain(req.params.id)
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Asia/Jakarta' })
  const days = WEATHER_SAMPLE.map((entry, i) => {
    const date = new Date(Date.now() + i * 86_400_000)
    const index = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(dayName.format(date))
    const label = i === 0 ? 'Hari ini' : i === 1 ? 'Besok' : DAY_LABELS[index]
    return { label, ...entry }
  })
  res.json(days)
}

export async function getRouteMap(req, res) {
  const { id, routeName } = req.params
  const mountain = await Mountain.findOne({ slug: String(id).toLowerCase() }).lean()
  const route = mountain && (await Route.findOne({ mountain_id: mountain._id, name: routeName }).lean())

  if (!route || route.path.length < 2) {
    throw new AppError('Peta jalur ini belum tersedia', 'NOT_FOUND', 404)
  }

  const checkpoints = route.checkpoints.map((c) => {
    const base = { type: c.type, name: c.name, lat: c.lat, lng: c.lng, pathIndex: nearestIndex(route.path, c.lat, c.lng) }
    if (c.type === 'basecamp') {
      return { ...base, name: route.basecamp?.name ?? c.name, facilities: [], distance: null, duration: null }
    }
    if (c.type === 'summit') {
      return { ...base, name: route.summitName, facilities: [], distance: null, duration: null }
    }
    const post = route.posts.find((p) => p.name === c.name)
    return {
      ...base,
      facilities: post?.facilities ?? [],
      dangerNote: post?.dangerNote,
      distance: post?.distance ?? null,
      duration: post?.duration ?? null,
    }
  })

  res.json({
    mountain: { id: mountain.slug, name: mountain.name, elevation: mountain.elevation },
    route: route.name,
    path: route.path,
    checkpoints,
  })
}
