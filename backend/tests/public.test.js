import request from 'supertest'
import app from '../src/app.js'
import Logbook from '../src/models/Logbook.js'
import User from '../src/models/User.js'
import { createLogbook, createMountain, createRoute, createUser } from './helpers/factory.js'
import { clearDb, startDb, stopDb } from './helpers/testDb.js'

beforeAll(startDb)
afterEach(clearDb)
afterAll(stopDb)

async function setup() {
  const batur = await createMountain()
  await createRoute(batur)
  const sayz = await createUser({
    bio: 'Suka sunrise',
    socials: { tiktok: 'sayz.hike', instagram: 'sayz_ig', website: '' },
    display: { instagram: false },
  })
  const rani = await createUser({ name: 'Rani Novita', username: 'rani.n', email: 'rani@email.com' })
  const dimas = await createUser({ name: 'Dimas', username: 'dimas', email: 'dimas@email.com', isProfilePublic: false })
  const entry = await createLogbook(sayz.user, batur, {
    verified: true,
    isPublic: true,
    slug: 'batur-pura-jati-abc123',
    note: 'catatan pribadi',
    crew: [rani.user._id, sayz.user._id, dimas.user._id],
    likes: 1,
    likedBy: [rani.user._id],
  })
  return { batur, sayz, rani, dimas, entry }
}

describe('GET /public/users/:username', () => {
  test('tamu: profil + hanya entri publik, tanpa data pribadi', async () => {
    const { batur, sayz } = await setup()
    await createLogbook(sayz.user, batur, { startDate: '2026-01-01' }) // privat
    await createLogbook(sayz.user, batur, { startDate: '2026-02-01', isDraft: true, isPublic: true, slug: 'draf-xyz' })

    const res = await request(app).get('/api/v1/public/users/SAYZ')
    expect(res.status).toBe(200)
    expect(res.body.user).toMatchObject({ name: 'Sayz', username: 'sayz', bio: 'Suka sunrise' })
    expect(res.body.user).not.toHaveProperty('email')
    expect(res.body.user).not.toHaveProperty('role')
    // instagram disembunyikan pemiliknya → tidak dikirim sama sekali
    expect(res.body.user.socials).toEqual({ tiktok: 'sayz.hike', instagram: '', website: '' })

    expect(res.body.entries).toHaveLength(1)
    const card = res.body.entries[0]
    expect(card).toMatchObject({ slug: 'batur-pura-jati-abc123', likes: 1, likedByMe: false })
    expect(card).not.toHaveProperty('note')
    expect(card).not.toHaveProperty('id')
    expect(card).not.toHaveProperty('crew')
  })

  test('likedByMe terisi bila yang melihat sudah login; token rusak tetap 200', async () => {
    const { rani } = await setup()
    const liked = await request(app).get('/api/v1/public/users/sayz').set('Authorization', `Bearer ${rani.token}`)
    expect(liked.body.entries[0].likedByMe).toBe(true)
    const broken = await request(app).get('/api/v1/public/users/sayz').set('Authorization', 'Bearer rusak')
    expect(broken.status).toBe(200)
  })

  test('profil privat dan pengguna tidak ada → 404 yang sama persis', async () => {
    await setup()
    const privateProfile = await request(app).get('/api/v1/public/users/dimas')
    const missing = await request(app).get('/api/v1/public/users/tidakada')
    expect(privateProfile.status).toBe(404)
    expect(privateProfile.body).toEqual(missing.body)
  })
})

describe('GET /public/entries/:slug', () => {
  test('tamu: entri publik tanpa catatan; rombongan privat hanya dihitung; pemilik di urutan pertama', async () => {
    await setup()
    const res = await request(app).get('/api/v1/public/entries/batur-pura-jati-abc123')
    expect(res.status).toBe(200)
    expect(res.body).not.toHaveProperty('note')
    expect(res.body.owner).toEqual({ name: 'Sayz', username: 'sayz', isProfilePublic: true })
    expect(res.body.crew).toEqual([
      { name: 'Sayz', username: 'sayz', isProfilePublic: true, isOwner: true },
      { name: 'Rani Novita', username: 'rani.n', isProfilePublic: true, isOwner: false },
    ])
    expect(res.body.hiddenCrewCount).toBe(1)
    expect(JSON.stringify(res.body)).not.toContain('Dimas')
  })

  test('profil pemilik privat: entri publik tetap bisa dibuka', async () => {
    const { sayz } = await setup()
    await User.updateOne({ _id: sayz.user._id }, { $set: { isProfilePublic: false } })
    const res = await request(app).get('/api/v1/public/entries/batur-pura-jati-abc123')
    expect(res.status).toBe(200)
    expect(res.body.owner.isProfilePublic).toBe(false)
  })

  test('entri diprivatkan atau slug tidak ada → 404 "Entri tidak tersedia"', async () => {
    const { entry } = await setup()
    await Logbook.updateOne({ _id: entry._id }, { $set: { isPublic: false } })
    for (const slug of ['batur-pura-jati-abc123', 'tidak-ada']) {
      const res = await request(app).get(`/api/v1/public/entries/${slug}`)
      expect([res.status, res.body.message]).toEqual([404, 'Entri tidak tersedia'])
    }
  })
})

describe('PUT/DELETE /public/entries/:slug/like', () => {
  test('tamu → 401; pengguna lain bisa suka dan batal', async () => {
    const { dimas } = await setup()
    const url = '/api/v1/public/entries/batur-pura-jati-abc123/like'
    expect((await request(app).put(url)).status).toBe(401)

    const auth = `Bearer ${dimas.token}`
    expect((await request(app).put(url).set('Authorization', auth)).body).toEqual({ likes: 2, likedByMe: true })
    expect((await request(app).put(url).set('Authorization', auth)).body).toEqual({ likes: 2, likedByMe: true })
    expect((await request(app).delete(url).set('Authorization', auth)).body).toEqual({ likes: 1, likedByMe: false })
  })

  test('entri privat tidak bisa disukai → 404', async () => {
    const { entry, dimas } = await setup()
    await Logbook.updateOne({ _id: entry._id }, { $set: { isPublic: false } })
    const res = await request(app).put('/api/v1/public/entries/batur-pura-jati-abc123/like').set('Authorization', `Bearer ${dimas.token}`)
    expect(res.status).toBe(404)
  })
})

describe('hapus akun membersihkan jejak di logbook orang lain', () => {
  test('suka ditarik dan keluar dari rombongan', async () => {
    const { rani, entry } = await setup()
    await request(app).delete('/api/v1/users/me').set('Authorization', `Bearer ${rani.token}`)
    const stored = await Logbook.findById(entry._id).lean()
    expect(stored.likes).toBe(0)
    expect(stored.likedBy).toEqual([])
    expect(stored.crew.map(String)).not.toContain(String(rani.user._id))
  })
})

describe('slug yang diminta benar-benar dipakai (regresi: slug pernah tertimpa filter)', () => {
  test('slug tidak ada → 404 walau ada entri publik lain', async () => {
    await setup()
    const res = await request(app).get('/api/v1/public/entries/tidak-ada')
    expect([res.status, res.body.message]).toEqual([404, 'Entri tidak tersedia'])
  })

  test('dua entri publik: tiap slug mengembalikan entrinya sendiri', async () => {
    const { batur, sayz } = await setup()
    await createLogbook(sayz.user, batur, { startDate: '2026-01-05', route: 'Toya Bungkah', isPublic: true, slug: 'batur-toya-bungkah-zzz999' })
    const first = await request(app).get('/api/v1/public/entries/batur-pura-jati-abc123')
    const second = await request(app).get('/api/v1/public/entries/batur-toya-bungkah-zzz999')
    expect([first.body.slug, first.body.route]).toEqual(['batur-pura-jati-abc123', 'Pura Jati'])
    expect([second.body.slug, second.body.route]).toEqual(['batur-toya-bungkah-zzz999', 'Toya Bungkah'])
  })

  test('menyukai slug yang tidak ada → 404 dan tidak menyukai entri lain', async () => {
    const { entry, dimas } = await setup()
    const res = await request(app).put('/api/v1/public/entries/tidak-ada/like').set('Authorization', `Bearer ${dimas.token}`)
    expect(res.status).toBe(404)
    expect((await Logbook.findById(entry._id).lean()).likes).toBe(1)
  })
})
