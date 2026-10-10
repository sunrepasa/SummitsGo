import client from './client'
import { USE_MOCK } from '../config'
import { logbooks } from '../data/logbooks'
import { mountains } from '../data/mountains'
import { wait } from './mockDelay'

export async function getMyLogbooks() {
  if (USE_MOCK) {
    const entries = [...logbooks]
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .map(({ mountainId, ...entry }) => ({
        ...entry,
        mountain: mountains.find((m) => m.id === mountainId),
      }))
    return wait(entries)
  }
  const { data } = await client.get('/logbooks/me')
  return data
}