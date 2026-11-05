import { rateLimit } from 'express-rate-limit'
import { AppError } from '../utils/AppError.js'

// Pembatas sederhana per alamat IP agar password tidak bisa ditebak ratusan kali per menit.
// Disimpan di memori server, jadi hitungan kembali nol saat server dimulai ulang.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) =>
    next(new AppError('Terlalu banyak percobaan. Coba lagi beberapa menit lagi.', 'RATE_LIMITED', 429)),
})
