import request from 'supertest'
import app from '../src/app.js'
import Notification from '../src/models/Notification.js'
import { addDays, parseDay, toDateOnly } from '../src/utils/date.js'
import { createChecklist, createLogbook, createMountain, createRoute, createUser } from './helpers/factory.js'
import { clearDb, startDb, stopDb } from './helpers/testDb.js'

beforeAll(startDb)
afterEach(clearDb)
afterAll(stopDb)

const API = '/api/v1'
const as = (who) => `Bearer ${who.token}`
const today = () => parseDay(toDateOnly(new Date()))

async function setup() {
  const batur = await createMountain()
  await createRoute(batur)
  const sayz = await createUser()
  const rani = await createUser({ name: 'Rani Novita', username: 'rani.n', email: 'rani@email.com' })
  const dimas = await createUser({ name: 'Dimas', username: 'dimas', email: 'dimas@email.com' })
  return { batur, sayz, rani, dimas }
}

const listOf = async (who) => (await request(app).get(`${API}/notifications`).set('Authorization', as(who))).body
const unreadOf = async (who) => (await request(app).get(`${API}/notifications/unread-count`).set('Authorization', as(who))).body.count

describe('akses', () => {
  test('semua endpoint notifikasi wajib token (401)', async () => {
    const calls = [
      request(app).get(`${API}/notifications`),
      request(app).get(`${API}/notifications/unread-count`),
      request(app).patch(`${API}/notifications/abc/read`),
      request(app).post(`${API}/notifications/read-all`),
      request(app).delete(`${API}/notifications/abc`),
      request(app).delete(`${API}/notifications`),
    ]
    for (const res of await Promise.all(calls)) expect([res.status, res.body.code]).toEqual([401, 'UNAUTHORIZED'])
  })
})

describe('daftar, dibaca, dihapus', () => {
  async function seedNotifications() {
    const ctx = await setup()
    const old = await Notification.create({ user_id: ctx.sayz.user._id, type: 'member_joined', text: 'lama', to: '/checklist/x', read: true, createdAt: new Date(Date.now() - 60_000) })
    const fresh = await Notification.create({ user_id: ctx.sayz.user._id, type: 'trip_verified', text: 'baru', to: '/logbook/y' })
    const others = await Notification.create({ user_id: ctx.rani.user._id, type: 'entry_liked', text: 'milik Rani', to: '/logbook/z' })
    return { ...ctx, old, fresh, others }
  }

  test('GET: hanya milik sendiri, terbaru di atas, createdAt berupa milidetik', async () => {
    const { sayz, fresh } = await seedNotifications()
    const list = await listOf(sayz)
    expect(list.map((n) => n.text)).toEqual(['baru', 'lama'])
    expect(list[0]).toEqual({ id: String(fresh._id), type: 'trip_verified', text: 'baru', to: '/logbook/y', read: false, createdAt: fresh.createdAt.getTime() })
  })

  test('unread-count, tandai satu dibaca, tandai semua dibaca', async () => {
    const { sayz, fresh, others } = await seedNotifications()
    expect(await unreadOf(sayz)).toBe(1)

    const res = await request(app).patch(`${API}/notifications/${fresh._id}/read`).set('Authorization', as(sayz))
    expect([res.status, res.body.read]).toEqual([200, true])
    expect(await unreadOf(sayz)).toBe(0)

    // milik orang lain dan id rusak → 404 (tidak membocorkan bahwa notifikasinya ada)
    expect((await request(app).patch(`${API}/notifications/${others._id}/read`).set('Authorization', as(sayz))).status).toBe(404)
    expect((await request(app).patch(`${API}/notifications/bukan-id/read`).set('Authorization', as(sayz))).status).toBe(404)

    await Notification.updateMany({}, { $set: { read: false } })
    const all = await request(app).post(`${API}/notifications/read-all`).set('Authorization', as(sayz))
    expect([all.status, all.body.count]).toEqual([200, 2])
    expect(await Notification.countDocuments({ user_id: others.user_id, read: false })).toBe(1) // milik Rani tidak ikut
  })

  test('hapus satu; hapus yang sudah dibaca; hapus semua', async () => {
    const { sayz, fresh, others } = await seedNotifications()
    expect((await request(app).delete(`${API}/notifications/${others._id}`).set('Authorization', as(sayz))).status).toBe(404)

    const read = await request(app).delete(`${API}/notifications?status=read`).set('Authorization', as(sayz))
    expect([read.status, read.body.count]).toEqual([200, 1])
    expect((await listOf(sayz)).map((n) => n.text)).toEqual(['baru'])

    const bad = await request(app).delete(`${API}/notifications?status=unread`).set('Authorization', as(sayz))
    expect([bad.status, bad.body.code]).toEqual([400, 'VALIDATION_ERROR'])

    expect((await request(app).delete(`${API}/notifications/${fresh._id}`).set('Authorization', as(sayz))).status).toBe(200)
    expect((await request(app).delete(`${API}/notifications/${fresh._id}`).set('Authorization', as(sayz))).status).toBe(404)

    await Notification.create({ user_id: sayz.user._id, type: 'trip_verified', text: 'lagi', to: '/logbook/y' })
    expect((await request(app).delete(`${API}/notifications`).set('Authorization', as(sayz))).status).toBe(200)
    expect(await listOf(sayz)).toEqual([])
    expect(await Notification.countDocuments({ user_id: others.user_id })).toBe(1)
  })
})

describe('dibuat otomatis oleh server', () => {
  test('undangan lewat username → checklist_invite; diterima → member_joined untuk Ketua', async () => {
    const { batur, sayz, dimas } = await setup()
    const checklist = await createChecklist(batur, sayz.user)
    await request(app).post(`${API}/checklists/${checklist._id}/invitations`).set('Authorization', as(sayz)).send({ username: 'dimas' })

    const [invite] = await listOf(dimas)
    expect(invite).toMatchObject({ type: 'checklist_invite', text: 'Sayz mengundangmu ke checklist Gunung Batur via Pura Jati.', to: '/checklist' })

    const pending = await request(app).get(`${API}/invitations/me`).set('Authorization', as(dimas))
    await request(app).post(`${API}/invitations/${pending.body[0].id}/accept`).set('Authorization', as(dimas))
    const [joined] = await listOf(sayz)
    expect(joined).toMatchObject({ type: 'member_joined', text: 'Dimas bergabung ke checklist Gunung Batur via Pura Jati.', to: `/checklist/${checklist._id}` })
  })

  test('gabung lewat tautan → member_joined sekali saja walau tautan dibuka berulang', async () => {
    const { batur, sayz, rani } = await setup()
    await createChecklist(batur, sayz.user, { inviteCode: 'abc123' })
    await request(app).post(`${API}/invites/abc123/join`).set('Authorization', as(rani))
    await request(app).post(`${API}/invites/abc123/join`).set('Authorization', as(rani))
    expect((await listOf(sayz)).filter((n) => n.type === 'member_joined')).toHaveLength(1)
    expect(await listOf(rani)).toEqual([])
  })

  test('konfirmasi draf → trip_verified', async () => {
    const { batur, sayz } = await setup()
    const draft = await createLogbook(sayz.user, batur, { isDraft: true })
    await request(app).post(`${API}/logbooks/drafts/${draft._id}/confirm`).set('Authorization', as(sayz))
    const [n] = await listOf(sayz)
    expect(n).toMatchObject({ type: 'trip_verified', text: 'Pendakian Gunung Batur terverifikasi dan masuk ke logbook-mu.', to: `/logbook/${draft._id}` })
  })

  test('suka entri publik: digabung selama belum dibaca, pemilik dan batal suka tidak memicu', async () => {
    const { batur, sayz, rani, dimas } = await setup()
    const entry = await createLogbook(sayz.user, batur, { verified: true, isPublic: true, slug: 'batur-pura-jati-abc123' })
    const like = (who) => request(app).put(`${API}/public/entries/batur-pura-jati-abc123/like`).set('Authorization', as(who))
    const unlike = (who) => request(app).delete(`${API}/public/entries/batur-pura-jati-abc123/like`).set('Authorization', as(who))

    await like(sayz) // pemilik menyukai entrinya sendiri
    expect(await listOf(sayz)).toEqual([])

    await like(rani)
    expect((await listOf(sayz)).map((n) => n.text)).toEqual(['Rani Novita menyukai logbook Gunung Batur-mu.'])
    await like(dimas)
    const merged = await listOf(sayz)
    expect(merged.map((n) => n.text)).toEqual(['Dimas dan 1 lainnya menyukai logbook Gunung Batur-mu.'])
    expect(merged[0].to).toBe(`/logbook/${entry._id}`)

    await unlike(dimas)
    expect(await listOf(sayz)).toHaveLength(1)

    // setelah dibaca, suka berikutnya menjadi notifikasi baru
    await request(app).post(`${API}/notifications/read-all`).set('Authorization', as(sayz))
    await like(dimas)
    expect((await listOf(sayz)).map((n) => n.read)).toEqual([false, true])
  })

  test('hapus akun ikut menghapus notifikasinya', async () => {
    const { sayz } = await setup()
    await Notification.create({ user_id: sayz.user._id, type: 'trip_verified', text: 'x', to: '/logbook/x' })
    await request(app).delete(`${API}/users/me`).set('Authorization', as(sayz))
    expect(await Notification.countDocuments()).toBe(0)
  })
})

describe('pengingat rencana (plan_reminder)', () => {
  test('dibuat sekali per anggota untuk rencana ≤ 3 hari lagi, tidak dibuat ulang setelah dihapus', async () => {
    const { batur, sayz, rani } = await setup()
    const soon = await createChecklist(batur, sayz.user, { members: [rani.user], plannedDate: addDays(today(), 2) })
    await createChecklist(batur, sayz.user, { plannedDate: addDays(today(), 10) }) // masih jauh
    await createChecklist(batur, sayz.user, { plannedDate: addDays(today(), -1) }) // sudah lewat

    expect(await unreadOf(sayz)).toBe(1)
    expect(await unreadOf(sayz)).toBe(1) // dipanggil lagi tidak menambah
    const [reminder] = await listOf(sayz)
    expect(reminder).toMatchObject({
      type: 'plan_reminder',
      text: 'Rencana pendakian Gunung Batur via Pura Jati tinggal 2 hari lagi. Cek lagi barang bawaanmu.',
      to: `/checklist/${soon._id}`,
    })

    await request(app).delete(`${API}/notifications/${reminder.id}`).set('Authorization', as(sayz))
    expect(await listOf(sayz)).toEqual([])

    // anggota lain mendapat pengingatnya sendiri
    expect((await listOf(rani)).map((n) => n.type)).toEqual(['plan_reminder'])
  })

  test('teks "hari ini" dan "besok"', async () => {
    const { batur, sayz } = await setup()
    await createChecklist(batur, sayz.user, { plannedDate: today() })
    await createChecklist(batur, sayz.user, { plannedDate: addDays(today(), 1) })
    const texts = (await listOf(sayz)).map((n) => n.text).sort()
    expect(texts).toEqual([
      'Rencana pendakian Gunung Batur via Pura Jati besok. Cek lagi barang bawaanmu.',
      'Rencana pendakian Gunung Batur via Pura Jati hari ini. Cek lagi barang bawaanmu.',
    ])
  })
})
