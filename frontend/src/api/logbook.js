import client from './client'
import { USE_MOCK } from '../config'
import { drafts, logbooks } from '../data/logbooks'
import { mountains } from '../data/mountains'
import { wait } from './mockDelay'
import { addDays } from '../utils/date'

const withMountain = ({ mountainId, ...entry }) => ({
  ...entry,
  mountain: mountains.find((m) => m.id === mountainId),
})

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
      logbooks.push({ ...draft, id: `lb-${Date.now()}`, verified: true, likes: 0 })
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
    // foto tidak disimpan di mode mock; backend nanti menerimanya lewat multipart
    logbooks.push({
      id: `lb-${Date.now()}`,
      mountainId,
      route,
      startDate,
      endDate: days ? addDays(startDate, days - 1) : startDate,
      nights: days ? days - 1 : null,
      verified: false,
      likes: 0,
      note,
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