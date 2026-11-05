import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

// masa berlaku panjang (30 hari) disengaja: pengguna perlu tetap "login" saat offline di gunung
export const signToken = (user) =>
  jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: String(user.id),
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256',
  })

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] })
