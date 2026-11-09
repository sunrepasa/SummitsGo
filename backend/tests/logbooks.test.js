import fs from 'node:fs/promises'
import path from 'node:path'
import request from 'supertest'
import app from '../src/app.js'
import { env } from '../src/config/env.js'
import Logbook from '../src/models/Logbook.js'
import Review from '../src/models/Review.js'
import { FAKE_IMAGE, PNG_1PX, createLogbook, createMountain, createRoute, createUser } from './helpers/factory.js'
import { clearDb, startDb, stopDb } from './helpers/testDb.js'

beforeAll(startDb)
afterEach(clearDb)
afterAll(stopDb)

const fileExists = (url) =>
  fs.access(path.join(env.uploadDir, path.basename(url))).then(() => true, () => false)

async function setup() {
  const batur = await createMountain()
  await createRoute(batur)
  const sayz = await createUser()
  const rani = await createUser({ name: 'Rani Novita', username: 'rani.n', email: 'rani@email.com' })
  return { batur, sayz, rani, auth: `Bearer ${sayz.token}` }
}

describe('logbook wajib login', () => {
  test.each([
    ['get', '/api/v1/logbooks/me'],
    ['get', '/api/v1/logbooks/drafts'],
    ['post', '/api/v1/logbooks'],
    ['get', '/api/v1/logbooks/6500a1b2c3d4e5f678906001'],
    ['patch', '/api/v1/logbooks/6500a1b2c3d4e5f678906001/visibility'],
  ])('%s %s tanpa token → 401', async (method, url) => {
    const res = await request(app)[method](url)
    expect([res.status, res.body.code]).toEqual([401, 'UNAUTHORIZED'])
  })
})

describe('GET /logbooks/me dan /logbooks/drafts', () => {
  test('riwayat tanpa draf, terbaru di atas, bentuk sesuai frontend', async () => {
    const { batur, sayz, rani, auth } = await setup()
    await createLogbook(sayz.user, batur, { startDate: '2026-07-01' })
    await createLogbook(sayz.user, batur, { startDate: '2026-09-12', verified: true, crew: [sayz.user._id, rani.user._id] })
    await createLogbook(sayz.user, batur, { startDate: '2026-10-01', isDraft: true })
    await createLogbook(rani.user, batur) // milik orang lain

    const res = await request(app).get('/api/v1/logbooks/me').set('Authorization', auth)
    expect(res.status).toBe(200)
    expect(res.body.map((e) => e.startDate)).toEqual(['2026-09-12', '2026-07-01'])

    const entry = res.body[0]
    expect(Object.keys(entry).sort()).toEqual(
      ['checklistName', 'crew', 'endDate', 'id', 'isPublic', 'likedByMe', 'likes', 'mountain', 'nights', 'note', 'photos', 'route', 'slug', 'startDate', 'verified'].sort(),
    )
    // objek gunung utuh, cukup untuk lencana (ketinggian) dan kartu
    expect(entry.mountain).toMatchObject({ id: 'batur', name: 'Gunung Batur', elevation: 1717 })
    expect(entry.crew).toEqual([
      { id: String(sayz.user._id), name: 'Sayz' },
      { id: String(rani.user._id), name: 'Rani Novita' },
    ])
    expect(entry.slug).toBeNull()
  })

  test('draf hanya muncul di /drafts dengan bentuk ringkas', async () => {
    const { batur, sayz, auth } = await setup()
    const draft = await createLogbook(sayz.user, batur, { isDraft: true })
    const res = await request(app).get('/api/v1/logbooks/drafts').set('Authorization', auth)
    expect(res.body).toEqual([
      { id: String(draft._id), mountain: expect.objectContaining({ id: 'batur' }), route: 'Pura Jati', startDate: '2026-09-12', endDate: '2026-09-12', nights: 0 },
    ])
  })
})

describe('draf pendakian', () => {
  test('konfirmasi → menjadi entri terverifikasi', async () => {
    const { batur, sayz, auth } = await setup()
    const draft = await createLogbook(sayz.user, batur, { isDraft: true })
    const res = await request(app).post(`/api/v1/logbooks/drafts/${draft._id}/confirm`).set('Authorization', auth)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: String(draft._id), verified: true })

    const stored = await Logbook.findById(draft._id).lean()
    expect([stored.isDraft, stored.verified]).toEqual([false, true])
  })

  test('buang draf; draf orang lain atau entri biasa → 404', async () => {
    const { batur, sayz, rani, auth } = await setup()
    const draft = await createLogbook(sayz.user, batur, { isDraft: true })
    const other = await createLogbook(rani.user, batur, { isDraft: true })
    const normal = await createLogbook(sayz.user, batur)

    expect((await request(app).delete(`/api/v1/logbooks/drafts/${draft._id}`).set('Authorization', auth)).status).toBe(200)
    expect(await Logbook.exists({ _id: draft._id })).toBeNull()
    for (const id of [other._id, normal._id, draft._id]) {
      const res = await request(app).post(`/api/v1/logbooks/drafts/${id}/confirm`).set('Authorization', auth)
      expect(res.status).toBe(404)
    }
  })
})

describe('POST /logbooks (entri manual, multipart)', () => {
  const send = (auth) =>
    request(app).post('/api/v1/logbooks').set('Authorization', auth).field('mountainId', 'batur').field('route', 'Pura Jati').field('startDate', '2026-09-12')

  test('tanpa foto: 201, selalu tidak terverifikasi, durasi dihitung dari days', async () => {
    const { auth } = await setup()
    const res = await send(auth).field('days', '3').field('note', 'Catatan pendakian')
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ verified: false, startDate: '2026-09-12', endDate: '2026-09-14', nights: 2, note: 'Catatan pendakian', photos: [] })
    const stored = await Logbook.findById(res.body.id).lean()
    expect(stored.isDraft).toBe(false)
  })

  test('days tidak diisi → nights null dan endDate = startDate', async () => {
    const { auth } = await setup()
    const res = await send(auth)
    expect(res.body).toMatchObject({ nights: null, endDate: '2026-09-12' })
  })

  test('dengan foto PNG: berkas tersimpan dan URL lengkap dikirim', async () => {
    const { auth } = await setup()
    const res = await send(auth).attach('photo', PNG_1PX, 'puncak.png')
    expect(res.status).toBe(201)
    expect(res.body.photos).toHaveLength(1)
    expect(res.body.photos[0].url).toMatch(/^http:\/\/api\.test\/uploads\/[0-9a-f-]{36}\.png$/)
    expect(await fileExists(res.body.photos[0].url)).toBe(true)
  })

  test('berkas teks yang dinamai .jpg ditolak dan tidak tersimpan', async () => {
    const { auth } = await setup()
    const before = await fs.readdir(env.uploadDir).catch(() => [])
    const res = await send(auth).attach('photo', FAKE_IMAGE, 'foto.jpg')
    expect([res.status, res.body.code]).toEqual([400, 'VALIDATION_ERROR'])
    expect(await Logbook.countDocuments()).toBe(0)
    expect(await fs.readdir(env.uploadDir).catch(() => [])).toEqual(before)
  })

  test('foto lebih dari 5 MB → 400', async () => {
    const { auth } = await setup()
    const big = Buffer.concat([PNG_1PX, Buffer.alloc(5 * 1024 * 1024)])
    const res = await send(auth).attach('photo', big, 'besar.png')
    expect([res.status, res.body.message]).toEqual([400, 'Ukuran foto maksimal 5 MB'])
  })

  test.each([
    ['tanggal di masa depan', { startDate: '2099-01-01' }],
    ['tanggal tidak ada', { startDate: '2026-02-30' }],
    ['format tanggal salah', { startDate: '12-09-2026' }],
    ['days 31', { days: '31' }],
    ['days 0', { days: '0' }],
    ['jalur bukan milik gunung', { route: 'Jalur Karangan' }],
    ['field tidak dikenal (verified)', { verified: 'true' }],
  ])('%s → 400', async (_name, change) => {
    const { auth } = await setup()
    const fields = { mountainId: 'batur', route: 'Pura Jati', startDate: '2026-09-12', ...change }
    let req = request(app).post('/api/v1/logbooks').set('Authorization', auth)
    for (const [key, value] of Object.entries(fields)) req = req.field(key, value)
    const res = await req
    expect([res.status, res.body.code]).toEqual([400, 'VALIDATION_ERROR'])
  })

  test('gunung tidak ada → 404', async () => {
    const { auth } = await setup()
    const res = await request(app).post('/api/v1/logbooks').set('Authorization', auth).field('mountainId', 'rinjani').field('route', 'Sembalun').field('startDate', '2026-09-12')
    expect(res.status).toBe(404)
  })
})

describe('GET /logbooks/:id', () => {
  test('detail + climbs dihitung dari entri di gunung yang sama (draf tidak dihitung)', async () => {
    const { batur, sayz, auth } = await setup()
    const agung = await createMountain({ slug: 'agung', name: 'Gunung Agung', elevation: 3031 })
    const entry = await createLogbook(sayz.user, batur, { verified: true })
    await createLogbook(sayz.user, batur, { verified: true, startDate: '2026-01-01' })
    await createLogbook(sayz.user, batur, { verified: false, startDate: '2025-01-01' })
    await createLogbook(sayz.user, batur, { isDraft: true, startDate: '2026-10-01' })
    await createLogbook(sayz.user, agung, { verified: true })

    const res = await request(app).get(`/api/v1/logbooks/${entry._id}`).set('Authorization', auth)
    expect(res.status).toBe(200)
    expect(res.body.climbs).toEqual({ verified: 2, manual: 1 })
  })

  test('milik orang lain → 403; tidak ada / id rusak / draf → 404', async () => {
    const { batur, sayz, rani, auth } = await setup()
    const others = await createLogbook(rani.user, batur)
    const draft = await createLogbook(sayz.user, batur, { isDraft: true })
    expect((await request(app).get(`/api/v1/logbooks/${others._id}`).set('Authorization', auth)).body.code).toBe('FORBIDDEN')
    for (const id of ['6500a1b2c3d4e5f678906001', 'abc', String(draft._id)]) {
      expect((await request(app).get(`/api/v1/logbooks/${id}`).set('Authorization', auth)).status).toBe(404)
    }
  })
})

describe('ubah catatan dan hapus', () => {
  test('PUT catatan; > 1000 karakter → 400; milik orang lain → 403', async () => {
    const { batur, sayz, rani, auth } = await setup()
    const entry = await createLogbook(sayz.user, batur)
    const ok = await request(app).put(`/api/v1/logbooks/${entry._id}`).set('Authorization', auth).send({ note: 'Catatan baru' })
    expect([ok.status, ok.body.note]).toEqual([200, 'Catatan baru'])

    const long = await request(app).put(`/api/v1/logbooks/${entry._id}`).set('Authorization', auth).send({ note: 'a'.repeat(1001) })
    expect(long.status).toBe(400)

    const others = await createLogbook(rani.user, batur)
    const forbidden = await request(app).put(`/api/v1/logbooks/${others._id}`).set('Authorization', auth).send({ note: 'x' })
    expect(forbidden.status).toBe(403)
  })

  test('hapus: entri dan berkas fotonya hilang, rujukan ulasan dilepas', async () => {
    const { batur, sayz, auth } = await setup()
    const created = await request(app)
      .post('/api/v1/logbooks')
      .set('Authorization', auth)
      .field('mountainId', 'batur')
      .field('route', 'Pura Jati')
      .field('startDate', '2026-09-12')
      .attach('photo', PNG_1PX, 'a.png')
    const review = await Review.create({ mountain_id: batur._id, user_id: sayz.user._id, rating: 5, text: 'Teks ulasan cukup panjang', logbook_id: created.body.id })

    const res = await request(app).delete(`/api/v1/logbooks/${created.body.id}`).set('Authorization', auth)
    expect(res.status).toBe(200)
    expect(await Logbook.countDocuments()).toBe(0)
    expect(await fileExists(created.body.photos[0].url)).toBe(false)
    expect((await Review.findById(review._id).lean()).logbook_id).toBeNull()
  })
})

describe('POST /logbooks/:id/photos', () => {
  test('201 dengan { id, url }; foto ke-11 → 409 PHOTO_LIMIT dan berkasnya tidak tertinggal', async () => {
    const { batur, sayz, auth } = await setup()
    const nine = Array.from({ length: 9 }, (_, i) => ({ url: `https://contoh.cdn/foto-${i}.jpg` }))
    const entry = await createLogbook(sayz.user, batur, { photos: nine })

    const tenth = await request(app).post(`/api/v1/logbooks/${entry._id}/photos`).set('Authorization', auth).attach('photo', PNG_1PX, 'a.png')
    expect(tenth.status).toBe(201)
    expect(tenth.body).toEqual({ id: expect.any(String), url: expect.stringMatching(/^http:\/\/api\.test\/uploads\//) })

    const before = await fs.readdir(env.uploadDir)
    const eleventh = await request(app).post(`/api/v1/logbooks/${entry._id}/photos`).set('Authorization', auth).attach('photo', PNG_1PX, 'b.png')
    expect([eleventh.status, eleventh.body.code]).toEqual([409, 'PHOTO_LIMIT'])
    expect(await fs.readdir(env.uploadDir)).toEqual(before)
    expect((await Logbook.findById(entry._id).lean()).photos).toHaveLength(10)
  })

  test('tanpa berkas → 400; field bukan "photo" → 400', async () => {
    const { batur, sayz, auth } = await setup()
    const entry = await createLogbook(sayz.user, batur)
    const none = await request(app).post(`/api/v1/logbooks/${entry._id}/photos`).set('Authorization', auth)
    expect(none.status).toBe(400)
    const wrongField = await request(app).post(`/api/v1/logbooks/${entry._id}/photos`).set('Authorization', auth).attach('gambar', PNG_1PX, 'a.png')
    expect(wrongField.status).toBe(400)
  })
})

describe('PATCH /logbooks/:id/visibility', () => {
  test('slug dibuat sekali dan tetap sama setelah diprivatkan lalu dipublikkan lagi', async () => {
    const { batur, sayz, auth } = await setup()
    const entry = await createLogbook(sayz.user, batur)
    const url = `/api/v1/logbooks/${entry._id}/visibility`

    const first = await request(app).patch(url).set('Authorization', auth).send({ isPublic: true })
    expect(first.status).toBe(200)
    expect(first.body.slug).toMatch(/^batur-pura-jati-[a-z0-9]{6}$/)

    const hidden = await request(app).patch(url).set('Authorization', auth).send({ isPublic: false })
    expect(hidden.body).toEqual({ isPublic: false, slug: first.body.slug })
    const again = await request(app).patch(url).set('Authorization', auth).send({ isPublic: true })
    expect(again.body).toEqual({ isPublic: true, slug: first.body.slug })
  })

  test('banyak entri privat tanpa slug tidak bentrok di indeks unik', async () => {
    const { batur, sayz } = await setup()
    await createLogbook(sayz.user, batur)
    await expect(createLogbook(sayz.user, batur, { startDate: '2026-01-01' })).resolves.toBeTruthy()
  })

  test('body kosong atau bukan boolean → 400', async () => {
    const { batur, sayz, auth } = await setup()
    const entry = await createLogbook(sayz.user, batur)
    for (const body of [{}, { isPublic: 'ya' }]) {
      const res = await request(app).patch(`/api/v1/logbooks/${entry._id}/visibility`).set('Authorization', auth).send(body)
      expect(res.status).toBe(400)
    }
  })
})

describe('suka entri sendiri', () => {
  test('suka dua kali tetap 1, batal suka kembali 0', async () => {
    const { batur, sayz, auth } = await setup()
    const entry = await createLogbook(sayz.user, batur)
    const url = `/api/v1/logbooks/${entry._id}/like`

    await request(app).post(url).set('Authorization', auth)
    const twice = await request(app).post(url).set('Authorization', auth)
    expect(twice.body).toEqual({ likes: 1, likedByMe: true })
    const undo = await request(app).delete(url).set('Authorization', auth)
    expect(undo.body).toEqual({ likes: 0, likedByMe: false })
    const undoAgain = await request(app).delete(url).set('Authorization', auth)
    expect(undoAgain.body.likes).toBe(0) // tidak pernah negatif
  })
})

describe('berkas foto dilayani statis', () => {
  test('foto bisa dibuka dari origin frontend (CORS) dan tidak ditebak jenisnya oleh browser', async () => {
    const { auth } = await setup()
    const created = await request(app)
      .post('/api/v1/logbooks')
      .set('Authorization', auth)
      .field('mountainId', 'batur')
      .field('route', 'Pura Jati')
      .field('startDate', '2026-09-12')
      .attach('photo', PNG_1PX, 'a.png')
    const filePath = new URL(created.body.photos[0].url).pathname // /uploads/<nama>.png

    const res = await request(app).get(filePath).set('Origin', 'http://localhost:5173')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toBe('image/png')
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    expect(res.headers['x-content-type-options']).toBe('nosniff')

    const traversal = await request(app).get('/uploads/..%2F..%2Fpackage.json')
    expect(traversal.status).toBe(404)
  })
})
