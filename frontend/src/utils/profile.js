export const BIO_MAX = 160
export const WEBSITE_MAX = 200
export const SOCIAL_MAX = { tiktok: 24, instagram: 30 }

// sesi atau data lama bisa membawa kunci yang sudah tidak dipakai, jadi hanya kunci ini yang diambil
export function profileOf(user) {
  const display = user.display ?? {}

  return {
    bio: user.bio ?? '',
    socials: {
      tiktok: user.socials?.tiktok ?? '',
      instagram: user.socials?.instagram ?? '',
      website: user.socials?.website ?? '',
    },
    display: {
      joinedSince: display.joinedSince ?? true,
      extraStats: display.extraStats ?? true,
      tiktok: display.tiktok ?? true,
      instagram: display.instagram ?? true,
      website: display.website ?? true,
      // null = belum memilih (otomatis); array = id lencana pilihan pengguna, urut sesuai pilihan
      shownBadges: Array.isArray(display.shownBadges) ? [...display.shownBadges] : null,
    },
  }
}

// menerima username yang sudah di-lowercase; mengembalikan pesan error, atau '' kalau valid
export function validateHandle(value, max) {
  if (!value) return ''
  if (value.includes('@')) return 'Tidak perlu mengetik @, sudah otomatis di depan'
  if (value.includes('/')) return 'Isi username saja, bukan link'
  if (/\s/.test(value)) return 'Username tidak boleh mengandung spasi'
  if (/[^a-z0-9._]/.test(value)) return 'Hanya huruf, angka, titik, dan garis bawah yang boleh'
  if (value.length < 2) return 'Minimal 2 karakter'
  if (value.length > max) return `Maksimal ${max} karakter`
  if (value.startsWith('.') || value.endsWith('.') || value.includes('..')) {
    return 'Titik tidak boleh di awal, di akhir, atau berturut-turut'
  }
  return ''
}

export function parseWebsite(value) {
  const raw = value.trim()
  if (!raw) return { href: '', error: '' }
  if (raw.length > WEBSITE_MAX) return { href: '', error: `Maksimal ${WEBSITE_MAX} karakter` }
  if (/\s/.test(raw)) return { href: '', error: 'Link tidak boleh mengandung spasi' }
  if (/^(javascript|data|vbscript|file|blob):/i.test(raw)) {
    return { href: '', error: 'Hanya link http atau https yang boleh' }
  }

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`
  let url
  try {
    url = new URL(candidate)
  } catch {
    return { href: '', error: 'Link tidak valid' }
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { href: '', error: 'Hanya link http atau https yang boleh' }
  }
  // user:password di link sering dipakai untuk menyamarkan tujuan asli
  if (url.username || url.password) return { href: '', error: 'Link tidak valid' }
  if (!url.hostname.includes('.') || url.hostname.endsWith('.')) {
    return { href: '', error: 'Link tidak valid' }
  }
  return { href: url.href, error: '' }
}

// dipakai saat menampilkan: data yang tersimpan diperiksa ulang, bukan dipercaya begitu saja
export function safeWebsite(value) {
  if (!value) return ''
  const { href, error } = parseWebsite(value)
  return error ? '' : href
}

export const websiteHost = (href) => new URL(href).hostname.replace(/^www\./, '')