export const USERNAME_MIN = 3
export const USERNAME_MAX = 20

const COOLDOWN_DAYS = 7
const DAY_MS = 86_400_000

// satu-satunya perubahan otomatis pada username
export const normalizeUsername = (value) => value.toLowerCase()

// menerima username yang sudah dinormalisasi; mengembalikan pesan error, atau '' kalau valid
export function validateUsername(value) {
  if (!value) return 'Username wajib diisi'
  if (/\s/.test(value)) return 'Username tidak boleh mengandung spasi'
  if (value.includes('@')) return 'Tidak perlu mengetik @, sudah otomatis di depan'
  if (/[^a-z0-9._-]/.test(value)) return 'Hanya huruf, angka, titik, garis bawah, dan strip yang boleh'
  if (value.length < USERNAME_MIN) return `Minimal ${USERNAME_MIN} karakter`
  if (value.length > USERNAME_MAX) return `Maksimal ${USERNAME_MAX} karakter`
  if (value.startsWith('.') || value.endsWith('.') || value.includes('..')) {
    return 'Titik tidak boleh di awal, di akhir, atau berturut-turut'
  }
  return ''
}

export function getUsernameUnlockDate(changedAt) {
  if (!changedAt) return null
  const unlock = new Date(new Date(changedAt).getTime() + COOLDOWN_DAYS * DAY_MS)
  return unlock.getTime() > Date.now() ? unlock : null
}