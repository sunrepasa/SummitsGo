import mongoose from 'mongoose'
import User from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { verifyToken } from '../utils/token.js'

const unauthorized = (message) => new AppError(message, 'UNAUTHORIZED', 401)

// Untuk endpoint bertanda "Yes" di SRS 3.3: token wajib ada dan valid
export async function auth(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ')
  if (scheme !== 'Bearer' || !token) throw unauthorized('Token tidak ditemukan')

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    throw unauthorized('Token tidak valid atau sudah kedaluwarsa')
  }

  // role dibaca dari database, bukan dari token, supaya akun yang sudah dihapus atau diubah rolenya langsung berlaku
  const user = mongoose.isValidObjectId(payload.sub) ? await User.findById(payload.sub).select('role') : null
  if (!user) throw unauthorized('Akun tidak ditemukan')

  req.user = { id: user.id, role: user.role }
  next()
}
