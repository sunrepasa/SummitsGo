import { z } from 'zod'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// username yang dicadangkan, sama dengan yang dianggap terpakai di mock frontend
export const RESERVED_USERNAMES = new Set(['admin', 'summitsgo', 'admin_summitsgo'])

// aturan sama dengan validateUsername di frontend (utils/username.js)
export const usernameSchema = z
  .string('Username wajib diisi')
  .trim()
  .toLowerCase()
  .min(3, 'Username minimal 3 karakter')
  .max(20, 'Username maksimal 20 karakter')
  .regex(/^[a-z0-9._-]+$/, 'Username hanya boleh huruf, angka, titik, garis bawah, dan strip')
  .refine((value) => !value.startsWith('.') && !value.endsWith('.') && !value.includes('..'), {
    message: 'Titik tidak boleh di awal, di akhir, atau berturut-turut',
  })

const emailSchema = z
  .string('Email wajib diisi')
  .trim()
  .toLowerCase()
  .max(254, 'Email terlalu panjang')
  .regex(EMAIL_PATTERN, 'Format email tidak valid')

// bcrypt hanya membaca 72 byte pertama; batas ini mencegah sisa password diam-diam diabaikan
const newPasswordSchema = z
  .string('Kata sandi wajib diisi')
  .min(8, 'Kata sandi minimal 8 karakter')
  .refine((value) => Buffer.byteLength(value) <= 72, { message: 'Kata sandi terlalu panjang (maksimal 72 byte)' })

const nameSchema = z.string('Nama lengkap wajib diisi').trim().min(1, 'Nama lengkap wajib diisi').max(50, 'Nama maksimal 50 karakter')

// strictObject menolak field yang tidak dikenal, termasuk "role" yang tidak boleh datang dari klien
export const registerSchema = z.strictObject({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: newPasswordSchema,
})

export const loginSchema = z.strictObject({
  identifier: z.string('Isi username atau email').trim().toLowerCase().min(1, 'Isi username atau email').max(254),
  password: z.string('Isi kata sandi').min(1, 'Isi kata sandi').max(200),
})

export const usernameQuerySchema = z.strictObject({ username: usernameSchema })

// ---- profil (PATCH /users/me) ----
// username media sosial: aturan sama dengan validateHandle di frontend (utils/profile.js); kosong = tidak diisi
const socialHandleSchema = (max) =>
  z
    .string('Username media sosial tidak valid')
    .trim()
    .toLowerCase()
    .refine(
      (v) => v === '' || (/^[a-z0-9._]{2,}$/.test(v) && v.length <= max && !v.startsWith('.') && !v.endsWith('.') && !v.includes('..')),
      { message: `Username media sosial tidak valid (2-${max} karakter: huruf, angka, titik, garis bawah)` },
    )

// tautan bebas: hanya http/https, tanpa user:password, dan host bertitik (sama dengan parseWebsite di frontend).
// Diperiksa ulang di server karena tautan ini nanti tampil di profil publik dan bisa diklik orang lain.
function isSafeWebsite(value) {
  if (value === '') return true
  let url
  try {
    url = new URL(value)
  } catch {
    return false
  }
  const okProtocol = url.protocol === 'http:' || url.protocol === 'https:'
  return okProtocol && !url.username && !url.password && url.hostname.includes('.') && !url.hostname.endsWith('.')
}

const displaySchema = z.strictObject({
  joinedSince: z.boolean('Pengaturan tampilan harus true/false').optional(),
  extraStats: z.boolean('Pengaturan tampilan harus true/false').optional(),
  tiktok: z.boolean('Pengaturan tampilan harus true/false').optional(),
  instagram: z.boolean('Pengaturan tampilan harus true/false').optional(),
  website: z.boolean('Pengaturan tampilan harus true/false').optional(),
  // null = otomatis; maksimal 5 lencana di profil (FR-011)
  shownBadges: z
    .array(z.string().regex(/^[a-z0-9_-]{1,40}$/, 'Id lencana tidak valid'), 'shownBadges harus berupa daftar')
    .max(5, 'Maksimal 5 lencana ditampilkan')
    .nullable()
    .optional(),
})

// semua field opsional: frontend mengirim seluruh profil (Edit Profil) atau hanya isProfilePublic (Privasi)
export const profileUpdateSchema = z
  .strictObject({
    name: nameSchema.optional(),
    username: usernameSchema.optional(),
    bio: z.string('Bio harus berupa teks').trim().max(160, 'Bio maksimal 160 karakter').optional(),
    socials: z
      .strictObject({
        tiktok: socialHandleSchema(24).optional(),
        instagram: socialHandleSchema(30).optional(),
        website: z.string('Link tidak valid').trim().max(200, 'Link maksimal 200 karakter').refine(isSafeWebsite, 'Link harus diawali http:// atau https:// dan valid').optional(),
      })
      .optional(),
    display: displaySchema.optional(),
    isProfilePublic: z.boolean('isProfilePublic harus true/false').optional(),
  })
  .refine((body) => Object.keys(body).length > 0, { message: 'Tidak ada data yang diubah' })

export const passwordChangeSchema = z.strictObject({
  currentPassword: z.string('Isi kata sandi saat ini').min(1, 'Isi kata sandi saat ini').max(200),
  newPassword: newPasswordSchema,
})

// ---- gunung ----
const toArray = (value) => (value === undefined || value === '' ? [] : Array.isArray(value) ? value : [value])
const blankToUndefined = (value) => (value === '' ? undefined : value)

export const mountainListQuerySchema = z.object({
  sort: z.enum(['popular', 'newest', 'name', 'nearest'], 'Urutan tidak valid').default('popular'),
  limit: z.preprocess(blankToUndefined, z.coerce.number('limit harus angka').int().min(1).max(100).optional()),
  q: z.string().trim().max(100, 'Kata kunci terlalu panjang').optional(),
  location: z.string().trim().max(100).optional(),
  difficulty: z.preprocess(toArray, z.array(z.enum(['beginner', 'medium', 'hard'], 'Tingkat kesulitan tidak valid'))),
  status: z.preprocess(toArray, z.array(z.enum(['open', 'quota_full', 'closed'], 'Status tidak valid'))),
  minElevation: z.preprocess(blankToUndefined, z.coerce.number('minElevation harus angka').min(0).optional()),
  maxElevation: z.preprocess(blankToUndefined, z.coerce.number('maxElevation harus angka').min(0).optional()),
})

// ---- umum ----
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'ID tidak valid')

// ---- ulasan ----
// id tag sama dengan REVIEW_TAGS di frontend (utils/reviewTags.js)
export const REVIEW_TAGS = ['crowded', 'slippery', 'scenic', 'dry-water', 'beginner-friendly']

// batas panjang teks sama dengan ReviewModal di frontend (10-500 karakter)
export const reviewCreateSchema = z.strictObject({
  rating: z.number('Pilih jumlah bintang').int('Rating harus bilangan bulat').min(1, 'Rating minimal 1').max(5, 'Rating maksimal 5'),
  text: z.string('Cerita wajib diisi').trim().min(10, 'Tulis minimal 10 karakter').max(500, 'Cerita maksimal 500 karakter'),
  tags: z
    .array(z.enum(REVIEW_TAGS, 'Tag tidak dikenal'), 'Tag harus berupa daftar')
    .max(REVIEW_TAGS.length, 'Terlalu banyak tag')
    .default([])
    .transform((tags) => [...new Set(tags)]),
  // frontend mengirim null bila ulasan tidak ditulis dari logbook
  route: z.string('Jalur tidak valid').trim().max(100, 'Nama jalur terlalu panjang').nullish().transform((v) => v || null),
  logbookId: objectIdSchema.nullish().transform((v) => v ?? null),
})
