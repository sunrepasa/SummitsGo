// Frontend memecah tanggal 'YYYY-MM-DD' secara manual (split('-')), jadi ISO lengkap akan merusaknya.
// Zona waktu WIB agar tanggal tidak mundur sehari bagi pengguna di Indonesia.
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

// untuk waktu kejadian (createdAt, joinedAt): tanggal menurut jam WIB
export const toDateOnly = (date) => formatter.format(date)

// ---- tanggal tanpa jam (startDate, endDate logbook) ----
// Disimpan sebagai ISODate pukul 00:00 UTC (sesuai SRS 3.2) dan dibaca kembali dengan memotong
// string ISO, bukan lewat zona waktu: tanggal 2026-09-12 selalu tetap 2026-09-12 di mana pun.

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// 'YYYY-MM-DD' → Date, atau null bila formatnya salah atau tanggalnya tidak ada (misal 2026-02-30)
export function parseDay(text) {
  if (typeof text !== 'string' || !DAY_PATTERN.test(text)) return null
  const date = new Date(`${text}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text ? null : date
}

export const toDay = (date) => (date ? new Date(date).toISOString().slice(0, 10) : null)

export const addDays = (date, days) => new Date(new Date(date).getTime() + days * 24 * 60 * 60 * 1000)

// "hari ini" menurut zona Indonesia paling timur (WIT, UTC+9). Dipakai untuk menolak tanggal pendakian
// di masa depan: pendaki di Bali atau Papua sudah berganti hari lebih dulu daripada WIB, jadi tanggal
// hari ini mereka tidak boleh ditolak.
const easternFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jayapura',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
export const latestTodayInIndonesia = () => easternFormatter.format(new Date())
