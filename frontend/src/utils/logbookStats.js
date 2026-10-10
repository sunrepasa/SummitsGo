export function getLogbookStats(entries) {
  const unique = new Map(entries.map((e) => [e.mountain.id, e.mountain]))
  const highest = Math.max(0, ...[...unique.values()].map((m) => m.elevation))
  return { climbed: unique.size, highest }
}