export function getLogbookStats(entries) {
  const unique = new Map(entries.map((e) => [e.mountain.id, e.mountain]))
  const highest = Math.max(0, ...[...unique.values()].map((m) => m.elevation))
  // entri tanpa durasi dihitung 1 hari
  const days = entries.reduce((sum, e) => sum + (e.nights == null ? 1 : e.nights + 1), 0)

  return { climbed: unique.size, highest, trips: entries.length, days }
}