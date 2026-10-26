import client from './client'
import { USE_MOCK } from '../config'
import { accounts } from '../data/accounts'
import { wait } from './mockDelay'
import { getUsernameUnlockDate } from '../utils/username'

// username yang dianggap sudah dipakai di mode mock, selain akun di data/accounts.js
const takenUsernames = new Set([
  'admin',
  'summitsgo',
  'admin_summitsgo',
  'budi_hiking',
  'rani_k',
  'akun_promo88',
  'dimas.m',
])

export function isUsernameTaken(username) {
  return takenUsernames.has(username) || accounts.some((a) => a.username === username)
}

const codedError = (message, code) => Object.assign(new Error(message), { code })

function apiError(err) {
  return codedError(err.response?.data?.message ?? 'Permintaan gagal', err.response?.data?.code)
}

export async function checkUsername(username) {
  if (USE_MOCK) return wait(!isUsernameTaken(username), 350)
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
      if (isUsernameTaken(username)) throw codedError('Username sudah dipakai', 'USERNAME_TAKEN')
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

const accountOf = (username) => accounts.find((a) => a.username === username)

export async function changePassword(username, { currentPassword, newPassword }) {
  if (USE_MOCK) {
    await wait(null, 500)
    const account = accountOf(username)
    if (!account || account.password !== currentPassword) {
      throw codedError('Kata sandi saat ini salah', 'INVALID_CREDENTIALS')
    }
    account.password = newPassword
    return
  }

  try {
    await client.put('/users/me/password', { currentPassword, newPassword })
  } catch (err) {
    throw apiError(err)
  }
}

export async function setProfilePublic(isPublic) {
  if (USE_MOCK) return wait({ isProfilePublic: isPublic }, 300)
  const { data } = await client.patch('/users/me', { isProfilePublic: isPublic })
  return data
}

export async function deleteAccount(username) {
  if (USE_MOCK) {
    await wait(null, 600)
    const index = accounts.findIndex((a) => a.username === username)
    if (index !== -1) accounts.splice(index, 1)
    return
  }
  await client.delete('/users/me')
}
