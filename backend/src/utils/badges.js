// Aturan lencana, salinan dari frontend (data/badgeCatalog.js, utils/logbookStats.js, utils/elevationCategory.js).
// Lencana tidak disimpan (SRS 3.2 catatan 1); di backend aturan ini hanya dipakai untuk tahu KAPAN
// lencana baru didapat, supaya notifikasi badge_earned bisa dibuat. Bila aturan di frontend berubah,
// file ini harus ikut diubah.
import Logbook from '../models/Logbook.js'
import Mountain from '../models/Mountain.js'

export const WANDERER_MIN = 1500
export const VETERAN_MIN = 3000

const elevationCategory = (elevation) => (elevation < WANDERER_MIN ? 'beginner' : elevation < VETERAN_MIN ? 'wanderer' : 'veteran')

const CATEGORY_TIERS = [
  { min: 1, tierName: 'I' },
  { min: 5, tierName: 'II' },
  { min: 10, tierName: 'III' },
]

const CATALOG = [
  { id: 'rookie', name: 'Rookie', metric: (s) => s.verifiedTrips, tiers: [{ min: 1, tierName: '' }] },
  { id: 'beginner', name: 'Beginner', metric: (s) => s.byCategory.beginner, tiers: CATEGORY_TIERS },
  { id: 'wanderer', name: 'Wanderer', metric: (s) => s.byCategory.wanderer, tiers: CATEGORY_TIERS },
  { id: 'veteran', name: 'Veteran', metric: (s) => s.byCategory.veteran, tiers: CATEGORY_TIERS },
]

// statistik dari entri terverifikasi: jumlah pendakian dan jumlah gunung BERBEDA per kategori ketinggian
function statsOf(entries, elevationById) {
  const mountains = new Set(entries.map((e) => String(e.mountain_id)).filter((id) => elevationById.has(id)))
  const byCategory = { beginner: 0, wanderer: 0, veteran: 0 }
  mountains.forEach((id) => {
    byCategory[elevationCategory(elevationById.get(id))] += 1
  })
  return { verifiedTrips: entries.length, byCategory }
}

// semua tingkat yang sudah tercapai, misalnya ['rookie', 'beginner-1']
function earnedTiers(stats) {
  return CATALOG.flatMap((badge) =>
    badge.tiers
      .map((tier, i) => ({ key: `${badge.id}-${i + 1}`, badge, tier }))
      .filter(({ tier }) => badge.metric(stats) >= tier.min),
  )
}

// Lencana yang BARU didapat karena entri `logbookId` menjadi terverifikasi: tingkat yang tercapai
// dengan entri itu dikurangi tingkat yang sudah tercapai tanpanya. Urut sesuai katalog.
export async function newBadgesFrom(userId, logbookId) {
  const entries = await Logbook.find({ user_id: userId, verified: true, isDraft: { $ne: true } }).select('mountain_id').lean()
  const mountains = await Mountain.find({ _id: { $in: entries.map((e) => e.mountain_id) } }).select('elevation').lean()
  const elevationById = new Map(mountains.map((m) => [String(m._id), m.elevation]))

  const after = earnedTiers(statsOf(entries, elevationById))
  const before = new Set(
    earnedTiers(statsOf(entries.filter((e) => String(e._id) !== String(logbookId)), elevationById)).map((t) => t.key),
  )
  return after
    .filter((t) => !before.has(t.key))
    .map(({ badge, tier }) => ({ id: badge.id, label: tier.tierName ? `${badge.name} ${tier.tierName}` : badge.name }))
}
