const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

// tanggal 'YYYY-MM-DD' dipecah manual, bukan lewat new Date, supaya tidak geser sehari karena zona waktu
function parts(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m: m - 1, d }
}

export function formatDateRange(start, end) {
  const a = parts(start)
  if (!end || end === start) return `${a.d} ${MONTHS[a.m]} ${a.y}`

  const b = parts(end)
  if (a.y !== b.y) return `${a.d} ${MONTHS[a.m]} ${a.y} – ${b.d} ${MONTHS[b.m]} ${b.y}`
  if (a.m !== b.m) return `${a.d} ${MONTHS[a.m]} – ${b.d} ${MONTHS[b.m]} ${b.y}`
  return `${a.d}–${b.d} ${MONTHS[b.m]} ${b.y}`
}