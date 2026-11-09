import request from 'supertest'
import app from '../src/app.js'
import Logbook from '../src/models/Logbook.js'
import Mountain from '../src/models/Mountain.js'
import Review from '../src/models/Review.js'
import { recalcMountainRating } from '../src/utils/mountainRating.js'
import { createMountain, createRoute, createUser } from './helpers/factory.js'
import { clearDb, startDb, stopDb } from './helpers/testDb.js'

beforeAll(startDb)
afterEach(clearDb)
afterAll(stopDb)

const url = '/api/v1/mountains/batur/reviews'
const body = { rating: 4, text: 'Jalurnya jelas, berangkat jam 3 pagi', tags: ['crowded'], route: 'Pura Jati', logbookId: null }

async function setup() {
  const batur = await createMountain()
  await createRoute(batur)
  const sayz = await createUser()
  const rani = await createUser({ name: 'Rani Novita', username: 'rani.n', email: 'rani@email.com' })
  return { batur, sayz, rani }
}

describe('GET /mountains/:id/reviews', () => {
  test('tamu hanya melihat ulasan approved, terbaru di atas, bentuk sesuai frontend', async () => {
    const { batur, sayz, rani } = await setup()
    const base = { mountain_id: batur._id, rating: 5, text: 'Teks ulasan yang cukup panjang' }
    await Review.create({ ...base, user_id: rani.user._id, status: 'approved', createdAt: new Date('2026-09-01T03:00:00Z') })
    await Review.create({ ...base, user_id: sayz.user._id, status: 'approved', createdAt: new Date('2026-10-01T03:00:00Z') })
    await Review.create({ ...base, user_id: sayz.user._id, status: 'pending' })
    await Review.create({ ...base, user_id: sayz.user._id, status: 'rejected' })

    const res = await request(app).get(url)
    expect(res.status).toBe(200)
    expect(res.body.map((r) => r.author)).toEqual(['Sayz', 'Rani Novita'])
    expect(Object.keys(res.body[0])).toEqual(['id', 'mountainId', 'author', 'verified', 'rating', 'tags', 'text', 'route', 'createdAt'])
    expect(res.body[0]).toMatchObject({ mountainId: 'batur', createdAt: '2026-10-01' })
  })

  test('gunung tidak ada → 404', async () => {
    const res = await request(app).get('/api/v1/mountains/rinjani/reviews')
    expect(res.status).toBe(404)
  })
})

describe('POST /mountains/:id/reviews', () => {
  test('tanpa token → 401', async () => {
    await setup()
    const res = await request(app).post(url).send(body)
    expect([res.status, res.body.code]).toEqual([401, 'UNAUTHORIZED'])
  })

  test('berhasil → 201 pending, belum tampil di daftar publik', async () => {
    const { sayz } = await setup()
    const res = await request(app).post(url).set('Authorization', `Bearer ${sayz.token}`).send(body)
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ status: 'pending', verified: false, author: 'Sayz' })

    const list = await request(app).get(url)
    expect(list.body).toHaveLength(0)
  })

  test('verified dihitung server dari logbook terverifikasi (bukan draf)', async () => {
    const { batur, sayz, rani } = await setup()
    await Logbook.create({ user_id: rani.user._id, mountain_id: batur._id, route: 'Pura Jati', verified: true })
    await Logbook.create({ user_id: sayz.user._id, mountain_id: batur._id, route: 'Pura Jati', verified: true, isDraft: true })

    const raniRes = await request(app).post(url).set('Authorization', `Bearer ${rani.token}`).send(body)
    const sayzRes = await request(app).post(url).set('Authorization', `Bearer ${sayz.token}`).send(body)
    expect(raniRes.body.verified).toBe(true)
    expect(sayzRes.body.verified).toBe(false)
  })

  test('satu ulasan per gunung → 409 ALREADY_REVIEWED, kecuali yang lama ditolak', async () => {
    const { batur, sayz } = await setup()
    const auth = `Bearer ${sayz.token}`
    await request(app).post(url).set('Authorization', auth).send(body)
    const second = await request(app).post(url).set('Authorization', auth).send(body)
    expect([second.status, second.body.code]).toEqual([409, 'ALREADY_REVIEWED'])

    await Review.updateMany({ mountain_id: batur._id }, { $set: { status: 'rejected' } })
    const retry = await request(app).post(url).set('Authorization', auth).send(body)
    expect(retry.status).toBe(201)
  })

  test.each([
    ['rating 7', { rating: 7 }],
    ['rating 3.5', { rating: 3.5 }],
    ['teks terlalu pendek', { text: 'pendek' }],
    ['tag tidak dikenal', { tags: ['angker'] }],
    ['klien mengirim verified', { verified: true }],
    ['jalur bukan milik gunung', { route: 'Jalur Karangan' }],
  ])('%s → 400', async (_name, change) => {
    const { sayz } = await setup()
    const res = await request(app).post(url).set('Authorization', `Bearer ${sayz.token}`).send({ ...body, ...change })
    expect([res.status, res.body.code]).toEqual([400, 'VALIDATION_ERROR'])
  })

  test('memakai logbook milik orang lain → 400', async () => {
    const { batur, sayz, rani } = await setup()
    const raniLog = await Logbook.create({ user_id: rani.user._id, mountain_id: batur._id, route: 'Pura Jati', verified: true })
    const res = await request(app)
      .post(url)
      .set('Authorization', `Bearer ${sayz.token}`)
      .send({ ...body, logbookId: String(raniLog._id) })
    expect(res.status).toBe(400)
  })
})

describe('rating gunung', () => {
  test('dihitung dari ulasan approved saja, dibulatkan 1 desimal', async () => {
    const { batur, sayz, rani } = await setup()
    const base = { mountain_id: batur._id, text: 'Teks ulasan yang cukup panjang', status: 'approved' }
    await Review.create({ ...base, user_id: sayz.user._id, rating: 5 })
    await Review.create({ ...base, user_id: rani.user._id, rating: 4 })
    await Review.create({ ...base, user_id: rani.user._id, rating: 4 })
    await Review.create({ ...base, user_id: rani.user._id, rating: 1, status: 'pending' })

    await recalcMountainRating(batur._id)
    const updated = await Mountain.findById(batur._id).lean()
    expect(updated.rating).toBe(4.3)
    expect(updated.reviewCount).toBe(3)
  })
})
