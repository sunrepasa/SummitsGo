import request from 'supertest'
import app from '../src/app.js'
import Checklist from '../src/models/Checklist.js'
import Invitation from '../src/models/Invitation.js'
import User from '../src/models/User.js'
import { createChecklist, createMountain, createRoute, createUser } from './helpers/factory.js'
import { clearDb, startDb, stopDb } from './helpers/testDb.js'

beforeAll(startDb)
afterEach(clearDb)
afterAll(stopDb)

async function setup() {
  const batur = await createMountain()
  await createRoute(batur)
  const sayz = await createUser()
  const rani = await createUser({ name: 'Rani Novita', username: 'rani.n', email: 'rani@email.com' })
  const dimas = await createUser({ name: 'Dimas', username: 'dimas', email: 'dimas@email.com' })
  const checklist = await createChecklist(batur, sayz.user, { members: [rani.user], inviteCode: 'abc123', plannedDate: new Date('2099-12-31T00:00:00Z') })
  const base = `/api/v1/checklists/${checklist._id}`
  const as = (who) => `Bearer ${who.token}`
  return { sayz, rani, dimas, checklist, base, as }
}

describe('undang lewat username (Ketua)', () => {
  test('201; undang ulang → 409 ALREADY_INVITED; anggota → 409 ALREADY_MEMBER; tidak ada → 404', async () => {
    const { base, sayz, dimas, as } = await setup()
    const res = await request(app).post(`${base}/invitations`).set('Authorization', as(sayz)).send({ username: '@Dimas' })
    expect(res.status).toBe(201)
    expect(res.body).toEqual({ id: expect.any(String), userId: String(dimas.user._id), username: 'dimas', name: 'Dimas' })

    const again = await request(app).post(`${base}/invitations`).set('Authorization', as(sayz)).send({ username: 'dimas' })
    expect([again.status, again.body.code]).toEqual([409, 'ALREADY_INVITED'])
    const member = await request(app).post(`${base}/invitations`).set('Authorization', as(sayz)).send({ username: 'rani.n' })
    expect([member.status, member.body.code]).toEqual([409, 'ALREADY_MEMBER'])
    const missing = await request(app).post(`${base}/invitations`).set('Authorization', as(sayz)).send({ username: 'siapa' })
    expect([missing.status, missing.body.code]).toEqual([404, 'USER_NOT_FOUND'])
  })

  test('anggota biasa tidak bisa mengundang atau membuat tautan', async () => {
    const { base, rani, as } = await setup()
    expect((await request(app).post(`${base}/invitations`).set('Authorization', as(rani)).send({ username: 'dimas' })).status).toBe(403)
    expect((await request(app).post(`${base}/invite-link`).set('Authorization', as(rani))).status).toBe(403)
  })

  test('batalkan undangan pending; yang sudah dibatalkan → 404', async () => {
    const { base, sayz, as } = await setup()
    const inv = await request(app).post(`${base}/invitations`).set('Authorization', as(sayz)).send({ username: 'dimas' })
    expect((await request(app).delete(`${base}/invitations/${inv.body.id}`).set('Authorization', as(sayz))).status).toBe(200)
    expect((await request(app).delete(`${base}/invitations/${inv.body.id}`).set('Authorization', as(sayz))).status).toBe(404)
  })
})

describe('undangan masuk (penerima)', () => {
  test('daftar, terima → jadi anggota, undangan tidak muncul lagi', async () => {
    const { base, sayz, dimas, checklist, as } = await setup()
    await request(app).post(`${base}/invitations`).set('Authorization', as(sayz)).send({ username: 'dimas' })

    const list = await request(app).get('/api/v1/invitations/me').set('Authorization', as(dimas))
    expect(list.body).toEqual([
      { id: expect.any(String), from: 'Sayz', mountain: expect.objectContaining({ id: 'batur' }), route: 'Pura Jati', plannedDate: '2099-12-31' },
    ])

    const accepted = await request(app).post(`/api/v1/invitations/${list.body[0].id}/accept`).set('Authorization', as(dimas))
    expect(accepted.body).toEqual({ checklistId: String(checklist._id) })
    expect((await request(app).get(base).set('Authorization', as(dimas))).body.role).toBe('member')
    expect((await request(app).get('/api/v1/invitations/me').set('Authorization', as(dimas))).body).toEqual([])
    // terima dua kali → 404 (sudah tidak pending)
    expect((await request(app).post(`/api/v1/invitations/${list.body[0].id}/accept`).set('Authorization', as(dimas))).status).toBe(404)
  })

  test('tolak; undangan milik orang lain tidak bisa diterima', async () => {
    const { base, sayz, rani, dimas, as } = await setup()
    const inv = await request(app).post(`${base}/invitations`).set('Authorization', as(sayz)).send({ username: 'dimas' })
    expect((await request(app).post(`/api/v1/invitations/${inv.body.id}/accept`).set('Authorization', as(rani))).status).toBe(404)
    expect((await request(app).post(`/api/v1/invitations/${inv.body.id}/decline`).set('Authorization', as(dimas))).status).toBe(200)
    expect((await Invitation.findById(inv.body.id).lean()).status).toBe('declined')
    // setelah ditolak, Ketua boleh mengundang lagi
    expect((await request(app).post(`${base}/invitations`).set('Authorization', as(sayz)).send({ username: 'dimas' })).status).toBe(201)
  })
})

describe('tautan undangan /invites/:code', () => {
  test('Ketua mendapat tautan tetap berbasis alamat frontend', async () => {
    const { base, sayz, as } = await setup()
    const first = await request(app).post(`${base}/invite-link`).set('Authorization', as(sayz))
    const second = await request(app).post(`${base}/invite-link`).set('Authorization', as(sayz))
    expect(first.body).toEqual({ url: 'http://localhost:5173/join/abc123' })
    expect(second.body).toEqual(first.body)
  })

  test('tamu melihat pratinjau tanpa checklistId; anggota melihat joined true', async () => {
    const { rani, checklist, as } = await setup()
    const guest = await request(app).get('/api/v1/invites/abc123')
    expect(guest.status).toBe(200)
    expect(guest.body).toMatchObject({ code: 'abc123', invitedBy: 'Sayz', route: 'Pura Jati', plannedDate: '2099-12-31', members: ['Sayz', 'Rani Novita'], joined: false, checklistId: null })
    const member = await request(app).get('/api/v1/invites/abc123').set('Authorization', as(rani))
    expect(member.body).toMatchObject({ joined: true, checklistId: String(checklist._id) })
    expect((await request(app).get('/api/v1/invites/salah1')).status).toBe(404)
    expect((await request(app).get('/api/v1/invites/abc123').set('Authorization', 'Bearer rusak')).status).toBe(200)
  })

  test('gabung: wajib login, sekali saja walau ditekan dua kali, undangan pending ikut diterima', async () => {
    const { base, sayz, dimas, checklist, as } = await setup()
    await request(app).post(`${base}/invitations`).set('Authorization', as(sayz)).send({ username: 'dimas' })
    expect((await request(app).post('/api/v1/invites/abc123/join')).status).toBe(401)

    const results = await Promise.all([1, 2].map(() => request(app).post('/api/v1/invites/abc123/join').set('Authorization', as(dimas))))
    expect(results.map((r) => r.body)).toEqual([{ checklistId: String(checklist._id) }, { checklistId: String(checklist._id) }])
    const stored = await Checklist.findById(checklist._id).lean()
    expect(stored.members.filter((m) => String(m.user_id) === String(dimas.user._id))).toHaveLength(1)
    expect((await Invitation.findOne({ invitedUser_id: dimas.user._id }).lean()).status).toBe('accepted')
  })
})

describe('GET /users/search', () => {
  test('cari username atau nama, maks 5, dengan state member/invited', async () => {
    const { base, sayz, checklist, as } = await setup()
    await request(app).post(`${base}/invitations`).set('Authorization', as(sayz)).send({ username: 'dimas' })
    const res = await request(app).get(`/api/v1/users/search?q=@a&checklistId=${checklist._id}`).set('Authorization', as(sayz))
    expect(res.body).toEqual([]) // kurang dari 2 huruf

    const found = await request(app).get(`/api/v1/users/search?q=DI&checklistId=${checklist._id}`).set('Authorization', as(sayz))
    expect(found.body).toEqual([{ id: expect.any(String), name: 'Dimas', username: 'dimas', state: 'invited' }])
    const byName = await request(app).get(`/api/v1/users/search?q=novita&checklistId=${checklist._id}`).set('Authorization', as(sayz))
    expect(byName.body).toEqual([expect.objectContaining({ username: 'rani.n', state: 'member' })])
  })

  test('maksimal 5 hasil; karakter regex di-escape; admin tidak ikut; bukan anggota → 403', async () => {
    const { sayz, dimas, checklist, as } = await setup()
    for (let i = 0; i < 7; i++) await createUser({ name: `Pendaki ${i}`, username: `pendaki${i}`, email: `p${i}@email.com` })
    await createUser({ name: 'Admin Pendaki', username: 'admin_pendaki', email: 'adm@email.com', role: 'admin' })

    const many = await request(app).get('/api/v1/users/search?q=pendaki').set('Authorization', as(sayz))
    expect(many.body).toHaveLength(5)
    expect(many.body.every((u) => u.username !== 'admin_pendaki')).toBe(true)
    expect((await request(app).get('/api/v1/users/search?q=.*').set('Authorization', as(sayz))).body).toEqual([])
    expect((await request(app).get(`/api/v1/users/search?q=pe&checklistId=${checklist._id}`).set('Authorization', as(dimas))).status).toBe(403)
  })
})

describe('hapus akun membersihkan checklist', () => {
  test('checklist yang dipimpin terhapus; di checklist lain keluar dan klaimnya dilepas', async () => {
    const { sayz, rani, dimas, checklist, as } = await setup()
    const batur = await createMountain({ slug: 'agung', name: 'Gunung Agung' })
    const raniLed = await createChecklist(batur, rani.user, { members: [dimas.user, sayz.user], inviteCode: 'rani01' })
    const itemId = raniLed.items[0]._id
    await Checklist.updateOne({ _id: raniLed._id }, { $set: { 'items.0.owner_id': sayz.user._id, 'items.0.done': true } })
    await Invitation.create({ checklist_id: checklist._id, invitedUser_id: dimas.user._id, invitedBy: sayz.user._id })

    await request(app).delete('/api/v1/users/me').set('Authorization', as(sayz))
    expect(await Checklist.exists({ _id: checklist._id })).toBeNull()
    expect(await Invitation.countDocuments()).toBe(0)
    const stored = await Checklist.findById(raniLed._id).lean()
    expect(stored.members.map((m) => String(m.user_id))).not.toContain(String(sayz.user._id))
    const item = stored.items.find((i) => String(i._id) === String(itemId))
    expect([item.owner_id, item.done]).toEqual([null, false])
    expect(await User.exists({ _id: sayz.user._id })).toBeNull()
  })
})
