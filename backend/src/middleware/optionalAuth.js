import { verifyToken } from '../utils/token.js'

// Untuk endpoint tamu yang hanya perlu tahu "siapa yang melihat" (misalnya likedByMe).
// Tidak boleh pernah membalas 401: token rusak atau kedaluwarsa diperlakukan sebagai tamu.
export function optionalAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ')
  if (scheme === 'Bearer' && token) {
    try {
      const payload = verifyToken(token)
      req.user = { id: payload.sub, role: payload.role }
    } catch {
      // abaikan: lanjut sebagai tamu
    }
  }
  next()
}
