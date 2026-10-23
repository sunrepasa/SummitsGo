import { elevationCategory } from './elevationCategory'

const uniqueMountains = (entries) => new Map(entries.map((e) => [e.mountain.id, e.mountain]))
const highestOf = (mountains) => Math.max(0, ...[...mountains.values()].map((m) => m.elevation))

export function getLogbookStats(entries) {
  const all = uniqueMountains(entries)
  const verifiedEntries = entries.filter((e) => e.verified)
  const verified = uniqueMountains(verifiedEntries)

  // jumlah pendakian terverifikasi per kategori ketinggian; mendaki gunung yang sama dua kali dihitung dua kali
  const verifiedByCategory = { beginner: 0, wanderer: 0, veteran: 0 }
  verifiedEntries.forEach((e) => {
    verifiedByCategory[elevationCategory(e.mountain.elevation)] += 1
  })

  return {
    climbed: all.size,
    highest: highestOf(all),
    trips: entries.length,
    // entri tanpa durasi dihitung 1 hari
    days: entries.reduce((sum, e) => sum + (e.nights == null ? 1 : e.nights + 1), 0),
    verifiedClimbed: verified.size,
    verifiedHighest: highestOf(verified),
    verifiedTrips: verifiedEntries.length,
    verifiedByCategory,
  }
}
