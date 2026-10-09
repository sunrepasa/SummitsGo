import client from './client'
import { USE_MOCK } from '../config'
import { heroSlides, mountains } from '../data/mountains'

const wait = (data, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(data), ms))

const sorters = {
  popular: (a, b) => b.popularity - a.popularity,
  newest: (a, b) => new Date(b.addedAt) - new Date(a.addedAt),
}

const recommendedIds = ['andong', 'papandayan', 'bromo', 'prau']

export async function getMountains({ sort = 'popular', limit } = {}) {
  if (USE_MOCK) {
    const sorted = [...mountains].sort(sorters[sort])
    return wait(limit ? sorted.slice(0, limit) : sorted)
  }
  const { data } = await client.get('/mountains', { params: { sort, limit } })
  return data
}

export async function getRecommendedMountains() {
  if (USE_MOCK) return wait(recommendedIds.map((id) => mountains.find((m) => m.id === id)))
  const { data } = await client.get('/mountains/recommended')
  return data
}

export async function getHeroSlides() {
  if (USE_MOCK) return wait(heroSlides)
  const { data } = await client.get('/promotions')
  return data
}