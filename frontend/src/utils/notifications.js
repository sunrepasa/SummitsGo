const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// "baru saja", "12 menit lalu", "3 jam lalu", "2 hari lalu", lalu tanggal untuk yang lebih dari seminggu
export function formatTimeAgo(timestamp, now = Date.now()) {
  const diff = Math.max(0, now - timestamp)
  if (diff < MINUTE) return 'baru saja'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} menit lalu`
  if (diff < DAY) return `${Math.floor(diff / HOUR)} jam lalu`
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} hari lalu`
  return new Date(timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
