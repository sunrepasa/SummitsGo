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

export async function createReview(mountainId, { rating, text, author }) {
  if (USE_MOCK) {
    reviews.unshift({
      id: `rv-${Date.now()}`,
      mountainId,
      author,
      verified: false,
      rating,
      text,
      createdAt: todayIso(),
    })
    return wait(null, 500)
  }
  await client.post(`/mountains/${mountainId}/reviews`, { rating, text })
}
