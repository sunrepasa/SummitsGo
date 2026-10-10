import client from './client'
import { USE_MOCK } from '../config'
import { heroSlides, mountains } from '../data/mountains'

const wait = (data, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(data), ms))

const sorters = {
  popular: (a, b) => b.popularity - a.popularity,
  newest: (a, b) => new Date(b.addedAt) - new Date(a.addedAt),
  name: (a, b) => a.name.localeCompare(b.name, 'id'),
  // data mock belum punya koordinat dan lokasi pengguna, jadi sementara sama dengan populer
  nearest: (a, b) => b.popularity - a.popularity,
}

const recommendedIds = ['andong', 'papandayan', 'bromo', 'prau']

export async function getMountains({
  sort = 'popular',
  limit,
  q,
  location,
  difficulty = [],
  status = [],
  minElevation,
  maxElevation,
} = {}) {
  if (USE_MOCK) {
    const keyword = q?.trim().toLowerCase()
    const result = mountains
      .filter(
        (m) =>
          !keyword ||
          [m.name, m.location, m.province].some((field) => field.toLowerCase().includes(keyword)),
      )
      .filter((m) => !location || m.province === location)
      .filter((m) => !difficulty.length || difficulty.includes(m.difficulty))
      .filter((m) => !status.length || status.includes(m.status))
      .filter((m) => minElevation == null || m.elevation >= minElevation)
      .filter((m) => maxElevation == null || m.elevation <= maxElevation)
      .sort(sorters[sort] ?? sorters.popular)
    return wait(limit ? result.slice(0, limit) : result)
  }

  const { data } = await client.get('/mountains', {
    params: { sort, limit, q, location, difficulty, status, minElevation, maxElevation },
    paramsSerializer: { indexes: null },
  })
  return data
}

export async function getProvinces() {
  if (USE_MOCK) return wait([...new Set(mountains.map((m) => m.province))].sort(), 100)
  const { data } = await client.get('/mountains/provinces')
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