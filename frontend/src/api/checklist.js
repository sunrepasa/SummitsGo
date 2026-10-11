import client from './client'
import { USE_MOCK } from '../config'
import { checklists } from '../data/checklists'
import { mountains } from '../data/mountains'
import { wait } from './mockDelay'

export async function getMyChecklists() {
  if (USE_MOCK) {
    return wait(
      checklists.map(({ mountainId, ...entry }) => ({
        ...entry,
        mountain: mountains.find((m) => m.id === mountainId),
      })),
    )
  }
  const { data } = await client.get('/checklists')
  return data
}