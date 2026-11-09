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

// Bentuk user pada respons login, register, dan PATCH /users/me (tanpa id, sesuai kontrak frontend).
// bio, socials, display, isProfilePublic ikut dikirim (keputusan #26) supaya login di perangkat baru
// langsung membawa profil yang tersimpan; bentuknya sama dengan profileOf() di frontend.
export const toSessionUser = (user) => {
  const socials = user.socials ?? {}
  const display = user.display ?? {}
  return {
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    usernameChangedAt: user.usernameChangedAt ? user.usernameChangedAt.toISOString() : null,
    joinedAt: toDateOnly(user.createdAt),
    bio: user.bio ?? '',
    socials: { tiktok: socials.tiktok ?? '', instagram: socials.instagram ?? '', website: socials.website ?? '' },
    display: {
      joinedSince: display.joinedSince ?? true,
      extraStats: display.extraStats ?? true,
      tiktok: display.tiktok ?? true,
      instagram: display.instagram ?? true,
      website: display.website ?? true,
      shownBadges: Array.isArray(display.shownBadges) ? [...display.shownBadges] : null,
    },
    isProfilePublic: user.isProfilePublic ?? true,
  }
}

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
