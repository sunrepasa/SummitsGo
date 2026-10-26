import client from './client'
import { USE_MOCK } from '../config'
import { wait } from './mockDelay'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const sample = [
  { icon: 'partly', temp: 18 },
  { icon: 'rain', temp: 15 },
  { icon: 'sun', temp: 20 },
  { icon: 'partly', temp: 17 },
  { icon: 'cloud', temp: 19 },
]

// ikon cuaca: 'sun' | 'partly' | 'cloud' | 'rain'. Data mock sama untuk semua gunung
export async function getMountainWeather(mountainId) {
  if (USE_MOCK) {
    const today = new Date()
    const days = sample.map((entry, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const label = i === 0 ? 'Hari ini' : i === 1 ? 'Besok' : DAYS[d.getDay()]
      return { label, ...entry }
    })
    return wait(days, 300)
  }
  const { data } = await client.get(`/mountains/${mountainId}/weather`)
  return data
}
