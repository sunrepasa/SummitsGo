import request from 'supertest'
import app from '../src/app.js'
import { createUser } from './helpers/factory.js'
import { clearDb, startDb, stopDb } from './helpers/testDb.js'

beforeAll(startDb)
afterEach(clearDb)
afterAll(stopDb)

const newAccount = { name: 'Rani Novita', username: 'rani.n', email: 'rani@email.com', password: 'rahasia123' }

describe('POST /auth/register', () => {
  test('berhasil: 201, token, role selalu user, profil ikut terkirim', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(newAccount)
    expect(res.status).toBe(201)
    expect(res.body.token).toEqual(expect.any(String))
    expect(res.body.user).toMatchObject({ name: 'Rani Novita', username: 'rani.n', role: 'user', bio: '', isProfilePublic: true })
    expect(res.body.user.joinedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(res.body.user).not.toHaveProperty('password')
  })

  test('mengirim role ditolak 400 (tidak bisa mendaftar sebagai admin)', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ ...newAccount, role: 'admin' })
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })

  test('username dan email yang sudah dipakai → 409', async () => {
    await createUser({ username: 'rani.n', email: 'lain@email.com' })
    let res = await request(app).post('/api/v1/auth/register').send(newAccount)
    expect([res.status, res.body.code]).toEqual([409, 'USERNAME_TAKEN'])

    res = await request(app).post('/api/v1/auth/register').send({ ...newAccount, username: 'rani2', email: 'lain@email.com' })
    expect([res.status, res.body.code]).toEqual([409, 'EMAIL_TAKEN'])
  })

  test('username dicadangkan → 409', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ ...newAccount, username: 'admin' })
    expect(res.body.code).toBe('USERNAME_TAKEN')
  })
})

describe('POST /auth/login', () => {
  test('login dengan username atau email → 200', async () => {
    await createUser()
    for (const identifier of ['sayz', 'SAYZ@email.com']) {
      const res = await request(app).post('/api/v1/auth/login').send({ identifier, password: 'rahasia123' })
      expect(res.status).toBe(200)
      expect(res.body.user.username).toBe('sayz')
    }
  })

  test('password salah dan akun tidak ada → pesan dan kode sama (401)', async () => {
    await createUser()
    const wrong = await request(app).post('/api/v1/auth/login').send({ identifier: 'sayz', password: 'salah12345' })
    const missing = await request(app).post('/api/v1/auth/login').send({ identifier: 'tidakada', password: 'salah12345' })
    expect(wrong.status).toBe(401)
    expect(wrong.body).toEqual(missing.body)
    expect(wrong.body.code).toBe('INVALID_CREDENTIALS')
  })

  test('injeksi NoSQL ({"$gt": ""}) ditolak validasi', async () => {
    await createUser()
    const res = await request(app).post('/api/v1/auth/login').send({ identifier: { $gt: '' }, password: { $gt: '' } })
    expect(res.status).toBe(400)
  })
})

describe('GET /users/username-available', () => {
  test('tersedia dan sudah dipakai', async () => {
    await createUser()
    const taken = await request(app).get('/api/v1/users/username-available?username=sayz')
    const free = await request(app).get('/api/v1/users/username-available?username=pendaki_baru')
    expect(taken.body).toEqual({ available: false })
    expect(free.body).toEqual({ available: true })
  })
})
