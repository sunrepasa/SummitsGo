import request from 'supertest'
import app from '../src/app.js'
import Logbook from '../src/models/Logbook.js'
import Review from '../src/models/Review.js'
import User from '../src/models/User.js'
import { createLogbook, createMountain, createUser } from './helpers/factory.js'
import { clearDb, startDb, stopDb } from './helpers/testDb.js'

beforeAll(startDb)
afterEach(clearDb)
afterAll(stopDb)

const DAY = 24 * 60 * 60 * 1000

// semua endpoint di file ini wajib login
describe('endpoint pengguna menolak tamu', () => {
  test.each([
    ['patch', '/api/v1/users/me'],
    ['put', '/api/v1/users/me/password'],
    ['delete', '/api/v1/users/me'],
    ['get', '/api/v1/users/me/saved-mountains/batur'],
    ['put', '/api/v1/users/me/saved-mountains/batur'],
    ['delete', '/api/v1/users/me/saved-mountains/batur'],
  ])('%s %s tanpa token → 401', async (method, path) => {
    const res = await request(app)[method](path).send({})
    expect([res.status, res.body.code]).toEqual([401, 'UNAUTHORIZED'])
  })
})

describe('PATCH /users/me', () => {
  const fullProfile = {
    name: 'Sayz Pendaki',
    username: 'sayz',
    bio: 'Suka sunrise',
    socials: { tiktok: 'sayz.hike', instagram: 'sayz_ig', website: 'https://sayz.dev/' },
    display: { joinedSince: true, extraStats: false, tiktok: true, instagram: true, website: false, shownBadges: ['rookie'] },
  }

  test('simpan profil lengkap (bentuk Edit Profil frontend) → 200, profil baru terkirim', async () => {
    const { token } = await createUser()
    const res = await request(app).patch('/api/v1/users/me').set('Authorization', `Bearer ${token}`).send(fullProfile)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ name: 'Sayz Pendaki', bio: 'Suka sunrise', socials: fullProfile.socials, display: fullProfile.display })
    expect(res.body.usernameChangedAt).toBeNull() // username tidak berubah, jeda tidak dimulai
  })

  test('hanya isProfilePublic → field lain tidak berubah', async () => {
    const { token } = await createUser({ bio: 'bio lama' })
    const res = await request(app).patch('/api/v1/users/me').set('Authorization', `Bearer ${token}`).send({ isProfilePublic: false })
    expect(res.body).toMatchObject({ isProfilePublic: false, bio: 'bio lama', name: 'Sayz' })
  })

  test('login berikutnya membawa profil yang tersimpan (keputusan #26)', async () => {
    const { token } = await createUser()
    await request(app).patch('/api/v1/users/me').set('Authorization', `Bearer ${token}`).send({ bio: 'tersimpan di server' })
    const login = await request(app).post('/api/v1/auth/login').send({ identifier: 'sayz', password: 'rahasia123' })
    expect(login.body.user.bio).toBe('tersimpan di server')
  })

  test('ganti username: berhasil, lalu kena jeda 7 hari', async () => {
    const { token } = await createUser()
    const auth = `Bearer ${token}`
    const first = await request(app).patch('/api/v1/users/me').set('Authorization', auth).send({ username: 'sayz_baru' })
    expect(first.status).toBe(200)
    expect(first.body.username).toBe('sayz_baru')
    expect(first.body.usernameChangedAt).toEqual(expect.any(String))

    const second = await request(app).patch('/api/v1/users/me').set('Authorization', auth).send({ username: 'sayz_lagi' })
    expect([second.status, second.body.code]).toEqual([409, 'USERNAME_COOLDOWN'])
  })

  test('jeda sudah lewat 7 hari → boleh ganti lagi', async () => {
    const { token } = await createUser({ usernameChangedAt: new Date(Date.now() - 8 * DAY) })
    const res = await request(app).patch('/api/v1/users/me').set('Authorization', `Bearer ${token}`).send({ username: 'sayz_lagi' })
    expect(res.status).toBe(200)
  })

  test('username milik orang lain atau dicadangkan → 409 USERNAME_TAKEN', async () => {
    const { token } = await createUser()
    await createUser({ username: 'rani.n', email: 'rani@email.com' })
    for (const username of ['rani.n', 'admin']) {
      const res = await request(app).patch('/api/v1/users/me').set('Authorization', `Bearer ${token}`).send({ username })
      expect([res.status, res.body.code]).toEqual([409, 'USERNAME_TAKEN'])
    }
  })

  test.each([
    ['body kosong', {}],
    ['bio > 160 karakter', { bio: 'a'.repeat(161) }],
    ['instagram memakai @', { socials: { instagram: '@sayz' } }],
    ['website javascript:', { socials: { website: 'javascript:alert(1)' } }],
    ['lencana > 5', { display: { shownBadges: ['a', 'b', 'c', 'd', 'e', 'f'] } }],
    ['mencoba mengubah role', { role: 'admin' }],
    ['mencoba mengubah email', { email: 'baru@email.com' }],
  ])('%s → 400', async (_name, payload) => {
    const { token } = await createUser()
    const res = await request(app).patch('/api/v1/users/me').set('Authorization', `Bearer ${token}`).send(payload)
    expect([res.status, res.body.code]).toEqual([400, 'VALIDATION_ERROR'])
  })
})

describe('PUT /users/me/password', () => {
  test('berhasil → bisa login dengan sandi baru, sandi lama tidak berlaku', async () => {
    const { token } = await createUser()
    const res = await request(app)
      .put('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'rahasia123', newPassword: 'sandiBaru99' })
    expect(res.status).toBe(200)

    const oldLogin = await request(app).post('/api/v1/auth/login').send({ identifier: 'sayz', password: 'rahasia123' })
    const newLogin = await request(app).post('/api/v1/auth/login').send({ identifier: 'sayz', password: 'sandiBaru99' })
    expect(oldLogin.status).toBe(401)
    expect(newLogin.status).toBe(200)
  })

  test('sandi saat ini salah → 400 INVALID_CREDENTIALS (keputusan #4, bukan 401)', async () => {
    const { token } = await createUser()
    const res = await request(app)
      .put('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'salah12345', newPassword: 'sandiBaru99' })
    expect([res.status, res.body.code]).toEqual([400, 'INVALID_CREDENTIALS'])
  })

  test('sandi baru < 8 karakter atau sama dengan lama → 400', async () => {
    const { token } = await createUser()
    for (const newPassword of ['pendek', 'rahasia123']) {
      const res = await request(app)
        .put('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'rahasia123', newPassword })
      expect(res.status).toBe(400)
    }
  })
})

describe('DELETE /users/me', () => {
  test('akun dan logbook terhapus, ulasan tetap dengan penulis anonim, token tidak berlaku', async () => {
    const mountain = await createMountain()
    const { user, token } = await createUser()
    await createLogbook(user, mountain)
    await Review.create({ user_id: user._id, mountain_id: mountain._id, rating: 5, text: 'Teks ulasan cukup panjang', status: 'approved' })

    const res = await request(app).delete('/api/v1/users/me').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(await User.countDocuments()).toBe(0)
    expect(await Logbook.countDocuments()).toBe(0)

    const reviews = await request(app).get('/api/v1/mountains/batur/reviews')
    expect(reviews.body[0].author).toBe('Pengguna SummitsGo')

    const reuse = await request(app).patch('/api/v1/users/me').set('Authorization', `Bearer ${token}`).send({ bio: 'x' })
    expect(reuse.status).toBe(401)
  })
})

describe('gunung tersimpan', () => {
  test('simpan, cek, simpan ulang (tidak dobel), hapus', async () => {
    const mountain = await createMountain()
    const { user, token } = await createUser()
    const auth = `Bearer ${token}`
    const path = '/api/v1/users/me/saved-mountains/batur'

    expect((await request(app).get(path).set('Authorization', auth)).body).toEqual({ saved: false })
    await request(app).put(path).set('Authorization', auth)
    await request(app).put(path).set('Authorization', auth)
    expect((await request(app).get(path).set('Authorization', auth)).body).toEqual({ saved: true })

    const stored = await User.findById(user._id).lean()
    expect(stored.savedMountains.map(String)).toEqual([String(mountain._id)])

    const removed = await request(app).delete(path).set('Authorization', auth)
    expect(removed.body).toEqual({ saved: false })
    expect((await request(app).get(path).set('Authorization', auth)).body).toEqual({ saved: false })
  })

  test('gunung tidak ada → 404', async () => {
    const { token } = await createUser()
    const res = await request(app).put('/api/v1/users/me/saved-mountains/rinjani').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })
})
