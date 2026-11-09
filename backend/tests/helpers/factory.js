import bcrypt from 'bcryptjs'
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
