import client from './client'
import { USE_MOCK, AUTH_STORAGE_KEY } from '../config'
import { accounts } from '../data/accounts'
import { logbooks } from '../data/logbooks'
import { mountains } from '../data/mountains'
import { people, ME_ID } from '../data/people'
import { publicUsers } from '../data/publicUsers'
import { wait } from './mockDelay'

// Endpoint di file ini bisa dibuka tanpa login (guest). Backend sungguhan membaca JWT secara opsional
// hanya untuk mengisi likedByMe; selain itu respons sama untuk semua pengunjung.
//   GET   /public/users/:username  -> { user, entries }       404 NOT_FOUND, 403 PROFILE_PRIVATE
//   GET   /public/entries/:slug    -> entri publik            404 NOT_FOUND (privat atau sudah dihapus)
//   PUT / DELETE /public/entries/:slug/like  (wajib login)

const codedError = (message, code, status) => Object.assign(new Error(message), { code, status })

function apiError(err) {
  return codedError(
    err.response?.data?.message ?? 'Permintaan gagal',
    err.response?.data?.code,
    err.response?.status,
  )
}

const withMountain = (entry) => ({ ...entry, mountain: mountains.find((m) => m.id === entry.mountainId) })

// --- khusus mode mock: akun yang sedang login adalah pemilik semua entri di data/logbooks.js ---

function storedUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))?.user ?? null
  } catch {
    return null
  }
}

const isMockViewerLoggedIn = () => {
  try {
    return Boolean(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))?.token)
  } catch {
    return false
  }
}

// pemilik entri mock: sesi yang sedang login, atau akun contoh bila sedang guest
function mockOwner() {
  const source = storedUser() ?? accounts[0]
  if (!source) return null
  return {
    id: ME_ID,
    name: source.name,
    username: source.username,
    bio: source.bio ?? '',
    socials: source.socials ?? {},
    display: source.display ?? {},
    joinedAt: source.joinedAt,
    isProfilePublic: source.isProfilePublic ?? true,
  }
}

const publicFields = ({ name, username, bio, socials, display, joinedAt }) => ({
  name,
  username,
  bio,
  socials,
  display: display ?? {},
  joinedAt,
})

const viewerAdjusted = (entry) => ({ ...entry, likedByMe: isMockViewerLoggedIn() ? entry.likedByMe : false })

function ownerEntries() {
  return logbooks
    .filter((e) => e.isPublic && e.slug)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .map((e) => withMountain(viewerAdjusted(e)))
}

export async function getPublicProfile(username) {
  if (USE_MOCK) {
    await wait(null, 350)
    const owner = mockOwner()

    if (owner && owner.username === username) {
      if (!owner.isProfilePublic) throw codedError('Profil ini bersifat privat', 'PROFILE_PRIVATE', 403)
      return { user: publicFields(owner), entries: ownerEntries() }
    }

    const other = publicUsers.find((u) => u.username === username)
    if (!other) throw codedError('Profil tidak ditemukan', 'NOT_FOUND', 404)
    if (!other.isProfilePublic) throw codedError('Profil ini bersifat privat', 'PROFILE_PRIVATE', 403)
    return {
      user: publicFields(other),
      entries: [...other.entries]
        .sort((a, b) => b.startDate.localeCompare(a.startDate))
        .map((e) => withMountain(viewerAdjusted(e))),
    }
  }

  try {
    const { data } = await client.get(`/public/users/${encodeURIComponent(username)}`)
    return data
  } catch (err) {
    throw apiError(err)
  }
}

// anggota rombongan: tautan ke profilnya hanya aktif bila profilnya publik
function resolveMember(member, owner) {
  if (member.id === ME_ID && owner) {
    return { name: owner.name, username: owner.username, isProfilePublic: owner.isProfilePublic }
  }
  const known = publicUsers.find((u) => u.id === member.id)
  if (known) return { name: known.name, username: known.username, isProfilePublic: known.isProfilePublic }
  const person = people.find((p) => p.id === member.id)
  return { name: member.name, username: person?.username ?? '', isProfilePublic: false }
}

function findPublicEntry(slug) {
  const mine = logbooks.find((e) => e.slug === slug && e.isPublic)
  if (mine) return { entry: mine, owner: mockOwner(), ownerId: ME_ID }

  for (const user of publicUsers) {
    const entry = user.entries.find((e) => e.slug === slug)
    if (entry) return { entry, owner: user, ownerId: user.id }
  }
  return null
}

export async function getPublicEntry(slug) {
  if (USE_MOCK) {
    await wait(null, 350)
    const found = findPublicEntry(slug)
    if (!found || !found.owner) throw codedError('Entri tidak tersedia', 'NOT_FOUND', 404)

    const { entry, owner, ownerId } = found
    const crew = entry.crew.map((m) => ({
      ...resolveMember(m, mockOwner()),
      isOwner: m.id === ownerId,
    }))

    return {
      slug: entry.slug,
      mountain: withMountain(entry).mountain,
      route: entry.route,
      verified: entry.verified,
      startDate: entry.startDate,
      endDate: entry.endDate,
      nights: entry.nights,
      likes: entry.likes,
      likedByMe: isMockViewerLoggedIn() ? entry.likedByMe : false,
      photos: [...entry.photos],
      owner: { name: owner.name, username: owner.username, isProfilePublic: owner.isProfilePublic },
      crew,
    }
  }

  try {
    const { data } = await client.get(`/public/entries/${encodeURIComponent(slug)}`)
    return data
  } catch (err) {
    throw apiError(err)
  }
}

export async function setPublicEntryLike(slug, liked) {
  if (USE_MOCK) {
    if (!isMockViewerLoggedIn()) throw codedError('Masuk dulu untuk menyukai', 'UNAUTHORIZED', 401)
    const found = findPublicEntry(slug)
    if (!found) throw codedError('Entri tidak tersedia', 'NOT_FOUND', 404)

    const { entry } = found
    if (entry.likedByMe !== liked) {
      entry.likedByMe = liked
      entry.likes += liked ? 1 : -1
    }
    return wait(null, 200)
  }

  try {
    if (liked) await client.put(`/public/entries/${encodeURIComponent(slug)}/like`)
    else await client.delete(`/public/entries/${encodeURIComponent(slug)}/like`)
  } catch (err) {
    throw apiError(err)
  }
}
