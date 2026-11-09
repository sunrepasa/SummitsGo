import request from 'supertest'
import app from '../src/app.js'
import { createMountain, createRoute } from './helpers/factory.js'
import { clearDb, startDb, stopDb } from './helpers/testDb.js'

beforeAll(startDb)
afterEach(clearDb)
afterAll(stopDb)

async function seedTwo() {
  const batur = await createMountain()
  const agung = await createMountain({ slug: 'agung', name: 'Gunung Agung', location: 'Karangasem', elevation: 3031, difficulty: 'hard' })
  await createRoute(batur)
  return { batur, agung }
}

describe('gunung (akses tamu)', () => {
  test('daftar gunung: 200, id berupa slug, tanpa managedBy', async () => {
    await seedTwo()
    const res = await request(app).get('/api/v1/mountains?sort=name')
    expect(res.status).toBe(200)
    expect(res.body.map((m) => m.id)).toEqual(['agung', 'batur'])
    expect(res.body[0]).not.toHaveProperty('managedBy')
  })

  test('filter difficulty dan kata kunci', async () => {
    await seedTwo()
    const hard = await request(app).get('/api/v1/mountains?difficulty=hard')
    expect(hard.body.map((m) => m.id)).toEqual(['agung'])
    const q = await request(app).get('/api/v1/mountains?q=bat')
    expect(q.body.map((m) => m.id)).toEqual(['batur'])
  })

  test('urutan tidak dikenal → 400', async () => {
    const res = await request(app).get('/api/v1/mountains?sort=acak')
    expect([res.status, res.body.code]).toEqual([400, 'VALIDATION_ERROR'])
  })

  test('detail gunung beserta jalur; gunung tidak ada → 404', async () => {
    await seedTwo()
    const res = await request(app).get('/api/v1/mountains/batur')
    expect(res.status).toBe(200)
    expect(res.body.routes[0]).toMatchObject({ name: 'Pura Jati', mapAvailable: false })
    const missing = await request(app).get('/api/v1/mountains/rinjani')
    expect([missing.status, missing.body.code]).toEqual([404, 'NOT_FOUND'])
  })

  test('peta jalur tanpa koordinat → 404', async () => {
    await seedTwo()
    const res = await request(app).get('/api/v1/public/mountains/batur/routes/Pura%20Jati/map')
    expect(res.status).toBe(404)
  })

  test('endpoint tamu tetap 200 walau token rusak', async () => {
    await seedTwo()
    const res = await request(app).get('/api/v1/mountains').set('Authorization', 'Bearer token-rusak')
    expect(res.status).toBe(200)
  })
})
