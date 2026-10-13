import client from './client'
import { USE_MOCK } from '../config'
import { wait } from './mockDelay'

const KEY = 'summitsgo_saved_mountains'

function readIds() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export async function isMountainSaved(mountainId) {
  if (USE_MOCK) return wait(readIds().includes(mountainId), 100)
  const { data } = await client.get(`/users/me/saved-mountains/${mountainId}`)
  return Boolean(data?.saved)
}

export async function setMountainSaved(mountainId, saved) {
  if (USE_MOCK) {
    const ids = readIds().filter((id) => id !== mountainId)
    if (saved) ids.push(mountainId)
    try {
      localStorage.setItem(KEY, JSON.stringify(ids))
    } catch {
      // penyimpanan penuh atau diblokir: abaikan, mock saja
    }
    return wait(null, 200)
  }
  if (saved) await client.put(`/users/me/saved-mountains/${mountainId}`)
  else await client.delete(`/users/me/saved-mountains/${mountainId}`)
}
