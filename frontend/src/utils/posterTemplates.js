import { coverBackground } from './mountainLabels'

export const TEMPLATES = [
  { id: 'full', label: 'Foto Penuh', needsPhoto: true },
  { id: 'card', label: 'Kartu Statistik', needsPhoto: true },
  { id: 'minimal', label: 'Minimal', needsPhoto: false },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export function shortRange(start, end) {
  const [, m1, d1] = start.split('-').map(Number)
  if (!end || end === start) return `${d1} ${MONTHS[m1 - 1]}`
  const [, m2, d2] = end.split('-').map(Number)
  return m1 === m2 ? `${d1}–${d2} ${MONTHS[m2 - 1]}` : `${d1} ${MONTHS[m1 - 1]} – ${d2} ${MONTHS[m2 - 1]}`
}

export const shortDuration = (nights) => (nights == null ? '–' : nights === 0 ? '1h' : `${nights + 1}h ${nights}m`)

// foto poster: gradasi (data mock) atau url gambar (foto yang diunggah)
export const photoBackground = (photo) =>
  photo?.url ? `center / cover no-repeat url("${photo.url}")` : coverBackground(photo?.gradient ?? ['#3E6B54', '#16281F'])
