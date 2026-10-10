import { useSearchParams } from 'react-router-dom'

export const ELEVATION_MIN = 1000
export const ELEVATION_MAX = 4000

const toNumber = (value, fallback) => {
  const n = Number(value)
  return value !== null && Number.isFinite(n) ? n : fallback
}

export function parseFilters(params) {
  return {
    q: params.get('q') ?? '',
    location: params.get('location') ?? '',
    difficulty: params.getAll('difficulty'),
    status: params.getAll('status'),
    minElevation: toNumber(params.get('minElevation'), ELEVATION_MIN),
    maxElevation: toNumber(params.get('maxElevation'), ELEVATION_MAX),
    downloaded: params.get('downloaded') === '1',
    sort: params.get('sort') ?? 'popular',
  }
}

export function toApiFilters(f) {
  return {
    q: f.q || undefined,
    location: f.location || undefined,
    difficulty: f.difficulty,
    status: f.status,
    minElevation: f.minElevation > ELEVATION_MIN ? f.minElevation : undefined,
    maxElevation: f.maxElevation < ELEVATION_MAX ? f.maxElevation : undefined,
    sort: f.sort,
  }
}

export function useSearchFilters() {
  const [params, setParams] = useSearchParams()

  const update = (mutate) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        mutate(next)
        return next
      },
      { replace: true },
    )

  const setValue = (key, value) =>
    update((p) => {
      if (value === '' || value == null) p.delete(key)
      else p.set(key, value)
    })

  const toggleValue = (key, value) =>
    update((p) => {
      const current = p.getAll(key)
      p.delete(key)
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
      next.forEach((v) => p.append(key, v))
    })

  const setElevation = (min, max) =>
    update((p) => {
      if (min > ELEVATION_MIN) p.set('minElevation', min)
      else p.delete('minElevation')
      if (max < ELEVATION_MAX) p.set('maxElevation', max)
      else p.delete('maxElevation')
    })

  const clear = (...keys) => update((p) => keys.forEach((key) => p.delete(key)))

  return { params, filters: parseFilters(params), setValue, toggleValue, setElevation, clear }
}