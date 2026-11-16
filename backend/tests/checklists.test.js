import request from 'supertest'
import app from '../src/app.js'
import Checklist from '../src/models/Checklist.js'
import ChecklistTemplate from '../src/models/ChecklistTemplate.js'
import Invitation from '../src/models/Invitation.js'
import { createChecklist, createMountain, createRoute, createUser } from './helpers/factory.js'
import { clearDb, startDb, stopDb } from './helpers/testDb.js'

beforeAll(startDb)
afterEach(clearDb)
afterAll(stopDb)

// Ketua (sayz), anggota (rani), dan orang luar (dimas) di satu checklist
async function setup() {
  const batur = await createMountain()
  await createRoute(batur)
  const sayz = await createUser()
  const rani = await createUser({ name: 'Rani Novita', username: 'rani.n', email: 'rani@email.com' })
  const dimas = await createUser({ name: 'Dimas', username: 'dimas', email: 'dimas@email.com' })
  const checklist = await createChecklist(batur, sayz.user, { members: [rani.user] })
  const base = `/api/v1/checklists/${checklist._id}`
  const as = (who) => `Bearer ${who.token}`
  return { batur, sayz, rani, dimas, checklist, base, as, items: checklist.items.map((i) => String(i._id)) }
}

const future = '2099-12-31'

describe('akses', () => {
  test.each([
    ['get', '/api/v1/checklists'],
    ['post', '/api/v1/checklists'],
    ['get', '/api/v1/checklist-templates'],
    ['get', '/api/v1/invitations/me'],
    ['get', '/api/v1/users/search?q=ra'],
  ])('%s %s tanpa token → 401', async (method, url) => {
    expect((await request(app)[method](url)).status).toBe(401)
  })

  test('bukan anggota → 403; checklist tidak ada atau id rusak → 404', async () => {
    const { base, dimas, as } = await setup()
    const outsider = await request(app).get(base).set('Authorization', as(dimas))
    expect([outsider.status, outsider.body.code]).toEqual([403, 'FORBIDDEN'])
    for (const id of ['6500a1b2c3d4e5f678904001', 'abc']) {
      expect((await request(app).get(`/api/v1/checklists/${id}`).set('Authorization', as(dimas))).status).toBe(404)
    }
  })
})

describe('daftar, buat, detail', () => {
  test('daftar: hanya checklist yang diikuti, progres dihitung dari barang', async () => {
    const { checklist, rani, dimas, as, items } = await setup()
    await Checklist.updateOne({ _id: checklist._id }, { $set: { 'items.0.done': true, 'items.0.owner_id': rani.user._id } })

    const res = await request(app).get('/api/v1/checklists').set('Authorization', as(rani))
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchObject({ id: String(checklist._id), role: 'member', done: 1, total: 3, members: ['Sayz', 'Rani Novita'] })
    expect(res.body[0].mountain).toMatchObject({ id: 'batur' })
    expect(items).toHaveLength(3)

    expect((await request(app).get('/api/v1/checklists').set('Authorization', as(dimas))).body).toEqual([])
  })

  test('buat dari template sistem: 201, pembuat jadi Ketua, barang tersalin tanpa klaim', async () => {
    const { dimas, as } = await setup()
    const template = await ChecklistTemplate.create({ user_id: null, name: 'Template Singkat', items: [{ name: 'Air', category: 'Logistik' }, { name: 'Jaket', category: 'Pakaian' }] })
    const res = await request(app)
      .post('/api/v1/checklists')
      .set('Authorization', as(dimas))
      .send({ mountainId: 'batur', route: 'Pura Jati', plannedDate: future, templateId: String(template._id) })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ role: 'leader', plannedDate: future, route: 'Pura Jati', recommendations: [] })
    expect(res.body.members).toEqual([{ id: String(dimas.user._id), name: 'Dimas', role: 'leader' }])
    expect(res.body.items.map((i) => [i.name, i.ownerId, i.done])).toEqual([['Air', null, false], ['Jaket', null, false]])
  })

  test('buat kosong tanpa tanggal → plannedDate null', async () => {
    const { dimas, as } = await setup()
    const res = await request(app).post('/api/v1/checklists').set('Authorization', as(dimas)).send({ mountainId: 'batur', route: 'Pura Jati' })
    expect(res.status).toBe(201)
    expect([res.body.plannedDate, res.body.items]).toEqual([null, []])
  })

  test.each([
    ['tanggal di masa lalu', { plannedDate: '2020-01-01' }, 400],
    ['tanggal tidak ada', { plannedDate: '2026-02-30' }, 400],
    ['jalur bukan milik gunung', { route: 'Jalur Karangan' }, 400],
    ['gunung tidak ada', { mountainId: 'rinjani' }, 404],
    ['template tidak ada', { templateId: '6500a1b2c3d4e5f678904501' }, 404],
  ])('%s → %i', async (_name, change, status) => {
    const { dimas, as } = await setup()
    const res = await request(app).post('/api/v1/checklists').set('Authorization', as(dimas)).send({ mountainId: 'batur', route: 'Pura Jati', ...change })
    expect(res.status).toBe(status)
  })

  test('template milik orang lain tidak bisa dipakai → 404', async () => {
    const { sayz, dimas, as } = await setup()
    const own = await ChecklistTemplate.create({ user_id: sayz.user._id, name: 'Punya Sayz', items: [] })
    const res = await request(app).post('/api/v1/checklists').set('Authorization', as(dimas)).send({ mountainId: 'batur', route: 'Pura Jati', templateId: String(own._id) })
    expect(res.status).toBe(404)
  })

  test('detail: bentuk sesuai frontend, termasuk undangan pending', async () => {
    const { base, sayz, rani, dimas, checklist, as } = await setup()
    const inv = await Invitation.create({ checklist_id: checklist._id, invitedUser_id: dimas.user._id, invitedBy: sayz.user._id })
    const res = await request(app).get(base).set('Authorization', as(rani))
    expect(res.status).toBe(200)
    expect(Object.keys(res.body).sort()).toEqual(['id', 'items', 'members', 'mountain', 'pendingInvites', 'plannedDate', 'recommendations', 'role', 'route', 'viewerId'])
    expect(res.body).toMatchObject({ role: 'member', viewerId: String(rani.user._id) })
    expect(res.body.pendingInvites).toEqual([{ id: String(inv._id), userId: String(dimas.user._id), username: 'dimas', name: 'Dimas' }])
    expect(Object.keys(res.body.items[0]).sort()).toEqual(['addedBy', 'category', 'done', 'id', 'name', 'ownerId'])
  })
})

describe('hapus checklist dan simpan template (hanya Ketua)', () => {
  test('anggota tidak bisa menghapus; Ketua bisa dan undangannya ikut terhapus', async () => {
    const { base, sayz, rani, dimas, checklist, as } = await setup()
    await Invitation.create({ checklist_id: checklist._id, invitedUser_id: dimas.user._id, invitedBy: sayz.user._id })
    expect((await request(app).delete(base).set('Authorization', as(rani))).status).toBe(403)
    expect((await request(app).delete(base).set('Authorization', as(sayz))).status).toBe(200)
    expect(await Checklist.countDocuments()).toBe(0)
    expect(await Invitation.countDocuments()).toBe(0)
  })

  test('simpan sebagai template: 201, muncul di "mine" milik Ketua saja', async () => {
    const { base, sayz, rani, as } = await setup()
    const saved = await request(app).post(`${base}/template`).set('Authorization', as(sayz)).send({ name: 'Template Batur' })
    expect(saved.status).toBe(201)
    expect(saved.body).toMatchObject({ name: 'Template Batur', itemCount: 3 })
    expect((await request(app).post(`${base}/template`).set('Authorization', as(rani)).send({ name: 'X' })).status).toBe(403)

    await ChecklistTemplate.create({ user_id: null, name: 'Bawaan', items: [{ name: 'Air', category: 'Logistik' }] })
    const list = await request(app).get('/api/v1/checklist-templates').set('Authorization', as(sayz))
    expect(list.body.mine.map((t) => t.name)).toEqual(['Template Batur'])
    expect(list.body.system).toEqual([expect.objectContaining({ name: 'Bawaan', itemCount: 1 })])
    const raniList = await request(app).get('/api/v1/checklist-templates').set('Authorization', as(rani))
    expect(raniList.body.mine).toEqual([])
  })
})

describe('barang: tambah, klaim, centang, hapus', () => {
  test('anggota menambah barang; kategori yang sudah ada dipakai ulang', async () => {
    const { base, rani, as } = await setup()
    const res = await request(app).post(`${base}/items`).set('Authorization', as(rani)).send({ name: 'Sarung tangan', category: 'perlengkapan tidur' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ name: 'Sarung tangan', category: 'Perlengkapan Tidur', ownerId: null, done: false, addedBy: String(rani.user._id) })
  })

  test('nama barang kosong atau terlalu panjang → 400', async () => {
    const { base, rani, as } = await setup()
    for (const body of [{ name: '', category: 'X' }, { name: 'a'.repeat(61), category: 'X' }, { name: 'Air' }]) {
      expect((await request(app).post(`${base}/items`).set('Authorization', as(rani)).send(body)).status).toBe(400)
    }
  })

  test('klaim ganda → 409 ALREADY_CLAIMED; klaim ulang milik sendiri tetap 200', async () => {
    const { base, sayz, rani, as, items } = await setup()
    const first = await request(app).post(`${base}/items/${items[0]}/claim`).set('Authorization', as(rani))
    expect([first.status, first.body.ownerId]).toEqual([200, String(rani.user._id)])
    const again = await request(app).post(`${base}/items/${items[0]}/claim`).set('Authorization', as(rani))
    expect(again.status).toBe(200)
    const other = await request(app).post(`${base}/items/${items[0]}/claim`).set('Authorization', as(sayz))
    expect([other.status, other.body.code]).toEqual([409, 'ALREADY_CLAIMED'])
  })

  test('dua klaim bersamaan: tepat satu yang berhasil', async () => {
    const { base, sayz, rani, as, items } = await setup()
    const results = await Promise.all([
      request(app).post(`${base}/items/${items[1]}/claim`).set('Authorization', as(sayz)),
      request(app).post(`${base}/items/${items[1]}/claim`).set('Authorization', as(rani)),
    ])
    expect(results.map((r) => r.status).sort()).toEqual([200, 409])
  })

  test('hanya pemilik klaim yang bisa mencentang; barang tidak ada → 404', async () => {
    const { base, sayz, rani, as, items } = await setup()
    await request(app).post(`${base}/items/${items[0]}/claim`).set('Authorization', as(rani))
    const byLeader = await request(app).patch(`${base}/items/${items[0]}`).set('Authorization', as(sayz)).send({ done: true })
    expect([byLeader.status, byLeader.body.code]).toEqual([403, 'FORBIDDEN'])
    const byOwner = await request(app).patch(`${base}/items/${items[0]}`).set('Authorization', as(rani)).send({ done: true })
    expect([byOwner.status, byOwner.body.done]).toEqual([200, true])
    const unclaimed = await request(app).patch(`${base}/items/${items[1]}`).set('Authorization', as(rani)).send({ done: true })
    expect(unclaimed.status).toBe(403)
    const missing = await request(app).patch(`${base}/items/6500a1b2c3d4e5f678904999`).set('Authorization', as(rani)).send({ done: true })
    expect([missing.status, missing.body.code]).toEqual([404, 'ITEM_NOT_FOUND'])
  })

  test('batal klaim: hanya klaim sendiri yang belum dicentang', async () => {
    const { base, sayz, rani, as, items } = await setup()
    await request(app).post(`${base}/items/${items[0]}/claim`).set('Authorization', as(rani))
    expect((await request(app).delete(`${base}/items/${items[0]}/claim`).set('Authorization', as(sayz))).status).toBe(403)
    await request(app).patch(`${base}/items/${items[0]}`).set('Authorization', as(rani)).send({ done: true })
    expect((await request(app).delete(`${base}/items/${items[0]}/claim`).set('Authorization', as(rani))).status).toBe(403)
    await request(app).patch(`${base}/items/${items[0]}`).set('Authorization', as(rani)).send({ done: false })
    const ok = await request(app).delete(`${base}/items/${items[0]}/claim`).set('Authorization', as(rani))
    expect([ok.status, ok.body.ownerId]).toEqual([200, null])
  })

  test('hapus barang: Ketua selalu bisa; penambah hanya selama belum diklaim; anggota lain tidak', async () => {
    const { base, sayz, rani, as, items } = await setup()
    const added = await request(app).post(`${base}/items`).set('Authorization', as(rani)).send({ name: 'Snack', category: 'Logistik' })
    const another = await request(app).post(`${base}/items`).set('Authorization', as(rani)).send({ name: 'Kopi', category: 'Logistik' })

    expect((await request(app).delete(`${base}/items/${items[0]}`).set('Authorization', as(rani))).status).toBe(403)
    expect((await request(app).delete(`${base}/items/${added.body.id}`).set('Authorization', as(rani))).status).toBe(200)

    await request(app).post(`${base}/items/${another.body.id}/claim`).set('Authorization', as(sayz))
    expect((await request(app).delete(`${base}/items/${another.body.id}`).set('Authorization', as(rani))).status).toBe(403)
    expect((await request(app).delete(`${base}/items/${another.body.id}`).set('Authorization', as(sayz))).status).toBe(200)
    expect((await request(app).delete(`${base}/items/${items[0]}`).set('Authorization', as(sayz))).status).toBe(200)

    const detail = await request(app).get(base).set('Authorization', as(sayz))
    expect(detail.body.items.map((i) => i.name)).toEqual(['Kompor', 'Kotak P3K'])
  })
})

describe('anggota: dikeluarkan dan keluar sendiri', () => {
  test('Ketua mengeluarkan anggota: klaim dan centangnya dilepas', async () => {
    const { base, sayz, rani, checklist, as, items } = await setup()
    await request(app).post(`${base}/items/${items[0]}/claim`).set('Authorization', as(rani))
    await request(app).patch(`${base}/items/${items[0]}`).set('Authorization', as(rani)).send({ done: true })

    const res = await request(app).delete(`${base}/members/${rani.user._id}`).set('Authorization', as(sayz))
    expect(res.status).toBe(200)
    const stored = await Checklist.findById(checklist._id).lean()
    expect(stored.members.map((m) => String(m.user_id))).toEqual([String(sayz.user._id)])
    expect([stored.items[0].owner_id, stored.items[0].done]).toEqual([null, false])
  })

  test('anggota keluar sendiri; anggota tidak bisa mengeluarkan orang lain; Ketua tidak bisa keluar', async () => {
    const { base, sayz, rani, dimas, checklist, as } = await setup()
    await Checklist.updateOne({ _id: checklist._id }, { $push: { members: { user_id: dimas.user._id, role: 'member' } } })

    expect((await request(app).delete(`${base}/members/${dimas.user._id}`).set('Authorization', as(rani))).status).toBe(403)
    expect((await request(app).delete(`${base}/members/${sayz.user._id}`).set('Authorization', as(sayz))).status).toBe(403)
    expect((await request(app).delete(`${base}/members/${rani.user._id}`).set('Authorization', as(rani))).status).toBe(200)
    expect((await request(app).get(base).set('Authorization', as(rani))).status).toBe(403)
  })
})
