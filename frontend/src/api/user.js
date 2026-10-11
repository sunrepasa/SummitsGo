import client from './client'
import { USE_MOCK } from '../config'
import { wait } from './mockDelay'
import { getUsernameUnlockDate } from '../utils/username'

// username yang dianggap sudah dipakai di mode mock
const takenUsernames = new Set([
  'admin',
  'summitsgo',
  'admin_summitsgo',
  'budi_hiking',
  'rani_k',
  'akun_promo88',
  'dimas.m',
])

const codedError = (message, code) => Object.assign(new Error(message), { code })

function apiError(err) {
  return codedError(err.response?.data?.message ?? 'Permintaan gagal', err.response?.data?.code)
}

export async function checkUsername(username) {
  if (USE_MOCK) return wait(!takenUsernames.has(username), 350)
  const { data } = await client.get('/users/username-available', { params: { username } })
  return data.available
}

export async function updateProfile(current, { name, username, bio, socials, display }) {
  if (USE_MOCK) {
    await wait(null, 500)
    const changed = username !== current.username
    if (changed) {
      if (getUsernameUnlockDate(current.usernameChangedAt)) {
        throw codedError('Jeda ganti username belum selesai', 'USERNAME_COOLDOWN')
      }
      if (takenUsernames.has(username)) throw codedError('Username sudah dipakai', 'USERNAME_TAKEN')
      takenUsernames.add(username)
    }
    return {
      name,
      username,
      bio,
      socials,
      display,
      ...(changed && { usernameChangedAt: new Date().toISOString() }),
    }
  }

  try {
    const { data } = await client.patch('/users/me', { name, username, bio, socials, display })
    return data
  } catch (err) {
    throw apiError(err)
  }
}