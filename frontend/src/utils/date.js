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

export function formatNights(nights) {
  if (nights == null) return null
  return nights === 0 ? '1 hari' : `${nights + 1} hari ${nights} malam`
}

export function addDays(iso, days) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

export function todayIso() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function dateToIso(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}