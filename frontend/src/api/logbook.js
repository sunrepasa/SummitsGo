import client from './client'
import { USE_MOCK } from '../config'
import { drafts, logbooks } from '../data/logbooks'
import { mountains } from '../data/mountains'
import { wait } from './mockDelay'
import { addDays } from '../utils/date'

const codedError = (message, code, status) => Object.assign(new Error(message), { code, status })
const MAX_PHOTOS = 10

const withMountain = ({ mountainId, ...entry }) => ({
  ...entry,
  mountain: mountains.find((m) => m.id === mountainId),
})

function findEntry(id) {
  const entry = logbooks.find((e) => e.id === id)
  if (!entry) throw codedError('Entri logbook tidak ditemukan', 'NOT_FOUND', 404)
  return entry
}

export async function getMyLogbooks() {
  if (USE_MOCK) {
    const sorted = [...logbooks].sort((a, b) => b.startDate.localeCompare(a.startDate))
    return wait(sorted.map(withMountain))
  }
  const { data } = await client.get('/logbooks/me')
  return data
}

export async function getLogbookDrafts() {
  if (USE_MOCK) return wait(drafts.map(withMountain))
  const { data } = await client.get('/logbooks/drafts')
  return data
}

export async function confirmLogbookDraft(id) {
  if (USE_MOCK) {
    const index = drafts.findIndex((d) => d.id === id)
    if (index !== -1) {
      const [draft] = drafts.splice(index, 1)
      logbooks.push({
        ...draft,
        id: `lb-${Date.now()}`,
        verified: true,
        likes: 0,
        likedByMe: false,
        isPublic: false,
        slug: null,
        note: '',
        photos: [],
        crew: [],
        checklistName: null,
      })
    }
    return wait(null)
  }
  await client.post(`/logbooks/drafts/${id}/confirm`)
}

export async function dismissLogbookDraft(id) {
  if (USE_MOCK) {
    const index = drafts.findIndex((d) => d.id === id)
    if (index !== -1) drafts.splice(index, 1)
    return wait(null)
  }
  await client.delete(`/logbooks/drafts/${id}`)
}

export async function createLogbook({ mountainId, route, startDate, days, note, photo }) {
  if (USE_MOCK) {
    // foto mock disimpan sebagai object URL selama sesi; backend menerimanya lewat multipart
    logbooks.push({
      id: `lb-${Date.now()}`,
      mountainId,
      route,
      startDate,
      endDate: days ? addDays(startDate, days - 1) : startDate,
      nights: days ? days - 1 : null,
      verified: false,
      likes: 0,
      likedByMe: false,
      isPublic: false,
      slug: null,
      note,
      photos: photo ? [{ id: `ph-${Date.now()}`, url: URL.createObjectURL(photo) }] : [],
      crew: [],
      checklistName: null,
    })
    return wait(null, 500)
  }

  const body = new FormData()
  body.append('mountainId', mountainId)
  body.append('route', route)
  body.append('startDate', startDate)
  if (days) body.append('days', days)
  if (note) body.append('note', note)
  if (photo) body.append('photo', photo)
  await client.post('/logbooks', body)
}

export async function getLogbookById(id) {
  if (USE_MOCK) {
    const entry = withMountain(findEntry(id))
    return wait({ ...entry, photos: [...entry.photos], crew: [...entry.crew] }, 300)
  }
  const { data } = await client.get(`/logbooks/${id}`)
  return data
}

export async function updateLogbookNote(id, note) {
  if (USE_MOCK) {
    findEntry(id).note = note
    return wait(null, 250)
  }
  await client.put(`/logbooks/${id}`, { note })
}

export async function deleteLogbook(id) {
  if (USE_MOCK) {
    const index = logbooks.findIndex((e) => e.id === id)
    if (index === -1) throw codedError('Entri logbook tidak ditemukan', 'NOT_FOUND', 404)
    logbooks.splice(index, 1)
    return wait(null, 400)
  }
  await client.delete(`/logbooks/${id}`)
}

export async function addLogbookPhoto(id, file) {
  if (USE_MOCK) {
    const entry = findEntry(id)
    if (entry.photos.length >= MAX_PHOTOS) {
      throw codedError(`Maksimal ${MAX_PHOTOS} foto per entri`, 'PHOTO_LIMIT', 409)
    }
    entry.photos.push({ id: `ph-${Date.now()}`, url: URL.createObjectURL(file) })
    return wait(null, 500)
  }
  const body = new FormData()
  body.append('photo', file)
  await client.post(`/logbooks/${id}/photos`, body)
}

export async function setLogbookLike(id, liked) {
  if (USE_MOCK) {
    const entry = findEntry(id)
    if (entry.likedByMe !== liked) {
      entry.likedByMe = liked
      entry.likes += liked ? 1 : -1
    }
    return wait(null, 200)
  }
  if (liked) await client.post(`/logbooks/${id}/like`)
  else await client.delete(`/logbooks/${id}/like`)
}

// slug dibuat sekali dan dipertahankan, jadi tautan yang pernah dibagikan tidak berubah bila entri
// dipublikkan lagi; backend sungguhan membuatnya sendiri
const makeSlug = (entry) =>
  `${entry.mountainId}-${entry.route.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).slice(2, 8)}`

export async function setLogbookPublic(id, isPublic) {
  if (USE_MOCK) {
    const entry = findEntry(id)
    entry.isPublic = isPublic
    if (isPublic && !entry.slug) entry.slug = makeSlug(entry)
    return wait({ isPublic: entry.isPublic, slug: entry.slug }, 300)
  }
  const { data } = await client.patch(`/logbooks/${id}/visibility`, { isPublic })
  return data
}

export { MAX_PHOTOS }
