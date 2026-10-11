import client from './client'
import { USE_MOCK } from '../config'
import { drafts, logbooks } from '../data/logbooks'
import { mountains } from '../data/mountains'
import { wait } from './mockDelay'

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