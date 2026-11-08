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

// strictObject menolak field yang tidak dikenal, termasuk "role" yang tidak boleh datang dari klien
export const registerSchema = z.strictObject({
  name: z.string('Nama lengkap wajib diisi').trim().min(1, 'Nama lengkap wajib diisi').max(50, 'Nama maksimal 50 karakter'),
  username: usernameSchema,
  email: emailSchema,
  password: newPasswordSchema,
})

export const loginSchema = z.strictObject({
  identifier: z.string('Isi username atau email').trim().toLowerCase().min(1, 'Isi username atau email').max(254),
  password: z.string('Isi kata sandi').min(1, 'Isi kata sandi').max(200),
})

export const usernameQuerySchema = z.strictObject({ username: usernameSchema })

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
