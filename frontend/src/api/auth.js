import client from './client'
import { USE_MOCK } from '../config'
import { accounts } from '../data/accounts'
import { wait } from './mockDelay'
import { isUsernameTaken } from './user'
import { todayIso } from '../utils/date'

const codedError = (message, code) => Object.assign(new Error(message), { code })

function apiError(err) {
  return codedError(err.response?.data?.message ?? 'Permintaan gagal', err.response?.data?.code)
}

const toSession = (account) => ({
  token: `mock-token-${account.username}`,
  user: {
    name: account.name,
    username: account.username,
    email: account.email,
    role: account.role,
    usernameChangedAt: account.usernameChangedAt,
    joinedAt: account.joinedAt,
  },
})

export async function loginRequest({ identifier, password }) {
  if (USE_MOCK) {
    await wait(null, 500)
    const key = identifier.trim().toLowerCase()
    const account = accounts.find((a) => a.username === key || a.email === key)
    if (!account || account.password !== password) {
      throw codedError('Kredensial salah', 'INVALID_CREDENTIALS')
    }
    return toSession(account)
  }

  try {
    const { data } = await client.post('/auth/login', { identifier: identifier.trim(), password })
    return data
  } catch (err) {
    throw apiError(err)
  }
}

// role tidak pernah dikirim dari klien: backend menetapkannya sebagai "user"
export async function registerRequest({ name, username, email, password }) {
  if (USE_MOCK) {
    await wait(null, 600)
    const normalizedEmail = email.trim().toLowerCase()
    if (isUsernameTaken(username)) throw codedError('Username sudah dipakai', 'USERNAME_TAKEN')
    if (accounts.some((a) => a.email === normalizedEmail)) {
      throw codedError('Email sudah terdaftar', 'EMAIL_TAKEN')
    }

    const account = {
      name,
      username,
      email: normalizedEmail,
      password,
      role: 'user',
      usernameChangedAt: null,
      joinedAt: todayIso(),
    }
    accounts.push(account)
    return toSession(account)
  }

  try {
    const { data } = await client.post('/auth/register', { name, username, email, password })
    return data
  } catch (err) {
    throw apiError(err)
  }
}