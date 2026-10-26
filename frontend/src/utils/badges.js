import { badgeCatalog } from '../data/badgeCatalog'

// mengembalikan hanya lencana yang sudah didapat, masing-masing di tingkat tertingginya.
// Lencana yang tingkatnya belum punya gambar dilewati: belum ada tampilan yang layak untuknya.
export function getEarnedBadges(stats) {
  return badgeCatalog.flatMap((badge) => {
    const value = badge.metric(stats)
    const reached = badge.tiers.filter((t) => value >= t.min)
    if (reached.length === 0) return []

    const current = reached[reached.length - 1]
    if (!current.image) return []
    const next = badge.tiers[reached.length]

    return [
      {
        id: badge.id,
        name: badge.name,
        image: current.image,
        tierName: current.tierName,
        description: badge.describe(current.min),
        valueText: badge.format(value),
        tierCount: badge.tiers.length,
        next: next && { tierName: next.tierName, description: badge.describe(next.min) },
      },
    ]
  })
}

// Batas lencana yang tampil di kartu profil. Lima muat satu baris di layar HP (44 px per lencana),
// jadi kartu tidak membengkak walau lencana yang dimiliki makin banyak.
export const MAX_DISPLAYED_BADGES = 5

// Lencana yang tampil di profil. shownIds === null berarti belum pernah memilih: otomatis lima pertama
// dari yang sudah didapat. Bila sudah memilih, urutan pilihan dipakai dan id yang belum/tidak lagi didapat dibuang.
export function selectDisplayedBadges(earned, shownIds) {
  if (!Array.isArray(shownIds)) return earned.slice(0, MAX_DISPLAYED_BADGES)
  const byId = new Map(earned.map((b) => [b.id, b]))
  return shownIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .slice(0, MAX_DISPLAYED_BADGES)
}
