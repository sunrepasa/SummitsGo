import mongoose from 'mongoose'
import { toDateOnly } from './date.js'

// __v dan password dibuang di sini sebagai jaring pengaman terakhir, apa pun yang dikirim controller
const HIDDEN_KEYS = new Set(['__v', 'password'])

const toCamel = (key) => key.replace(/_([a-zA-Z])/g, (_, char) => char.toUpperCase())
const renameKey = (key) => (key === '_id' ? 'id' : toCamel(key))

const isPlainObject = (value) => {
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

// Bentuk user pada respons login dan register (tanpa id, sesuai kontrak frontend)
export const toSessionUser = (user) => ({
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role,
  usernameChangedAt: user.usernameChangedAt ? user.usernameChangedAt.toISOString() : null,
  joinedAt: toDateOnly(user.createdAt),
})

// Satu-satunya pintu keluar data database ke respons API: _id -> id, mountain_id -> mountainId
export function serialize(value) {
  if (value == null) return value
  if (Array.isArray(value)) return value.map(serialize)
  if (value instanceof mongoose.Types.ObjectId) return value.toString()
  if (value instanceof Date) return value
  if (typeof value.toObject === 'function') return serialize(value.toObject())
  if (typeof value !== 'object' || !isPlainObject(value)) return value

  const result = {}
  for (const [key, child] of Object.entries(value)) {
    if (HIDDEN_KEYS.has(key)) continue
    result[renameKey(key)] = serialize(child)
  }
  return result
}
