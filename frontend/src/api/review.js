import client from './client'
import { USE_MOCK } from '../config'
import { reviews } from '../data/reviews'
import { todayIso } from '../utils/date'
import { wait } from './mockDelay'

export async function getMountainReviews(mountainId) {
  if (USE_MOCK) return wait(reviews.filter((r) => r.mountainId === mountainId), 300)
  const { data } = await client.get(`/mountains/${mountainId}/reviews`)
  return data
}

// logbookId opsional: ulasan yang ditulis dari entri logbook terverifikasi mendapat badge Terverifikasi.
// Mode mock memercayai `verified` dari pemanggil; backend sungguhan menghitungnya sendiri dari logbookId.
export async function createReview(
  mountainId,
  { rating, text, tags = [], route = null, author, logbookId = null, verified = false },
) {
  if (USE_MOCK) {
    reviews.unshift({
      id: `rv-${Date.now()}`,
      mountainId,
      author,
      verified,
      rating,
      text,
      tags,
      route,
      createdAt: todayIso(),
    })
    return wait(null, 500)
  }
  await client.post(`/mountains/${mountainId}/reviews`, { rating, text, tags, route, logbookId })
}
