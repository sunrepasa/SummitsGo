import bcrypt from 'bcryptjs'
import Logbook from '../../src/models/Logbook.js'
import Mountain from '../../src/models/Mountain.js'
import Route from '../../src/models/Route.js'
import User from '../../src/models/User.js'
import { signToken } from '../../src/utils/token.js'

// Pembuat data uji. Putaran bcrypt sengaja kecil (4) agar uji cepat; aplikasi tetap memakai 10.

export async function createUser({ password = 'rahasia123', ...overrides } = {}) {
  const user = await User.create({
    name: 'Sayz',
    username: 'sayz',
    email: 'sayz@email.com',
    password: await bcrypt.hash(password, 4),
    ...overrides,
  })
  return { user, token: signToken(user) }
}

export async function createMountain(overrides = {}) {
  return Mountain.create({
    slug: 'batur',
    name: 'Gunung Batur',
    location: 'Bangli',
    province: 'Bali',
    elevation: 1717,
    difficulty: 'beginner',
    status: 'open',
    ...overrides,
  })
}

export async function createRoute(mountain, overrides = {}) {
  return Route.create({ mountain_id: mountain._id, name: 'Pura Jati', difficulty: 'beginner', ...overrides })
}

const day = (text) => new Date(`${text}T00:00:00.000Z`)

export async function createLogbook(user, mountain, { startDate = '2026-09-12', ...overrides } = {}) {
  return Logbook.create({
    user_id: user._id,
    mountain_id: mountain._id,
    route: 'Pura Jati',
    startDate: day(startDate),
    endDate: day(startDate),
    nights: 0,
    ...overrides,
  })
}

// gambar PNG terkecil yang sah (1x1 piksel) dan teks biasa yang menyamar sebagai foto
export const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)
export const FAKE_IMAGE = Buffer.from('ini bukan gambar, hanya teks yang diberi nama .jpg')
