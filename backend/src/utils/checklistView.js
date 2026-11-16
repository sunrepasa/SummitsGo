import Invitation from '../models/Invitation.js'
import User from '../models/User.js'
import { toDay } from './date.js'
import { mountainMap } from './logbookView.js'

// Bentuk respons checklist mengikuti mock frontend (api/checklist.js dan data/checklists.js).
// Progres done/total selalu dihitung dari daftar barang, tidak pernah disimpan.

const progressOf = (items) => ({ done: items.filter((i) => i.done).length, total: items.length })
const roleOf = (doc, userId) => doc.members.find((m) => String(m.user_id) === String(userId))?.role ?? null

async function nameMap(ids) {
  const users = await User.find({ _id: { $in: [...new Set(ids.map(String))] } }).select('name username').lean()
  return new Map(users.map((u) => [String(u._id), u]))
}

// GET /checklists — kartu daftar
export async function checklistSummaries(docs, viewerId) {
  const [mountains, users] = await Promise.all([mountainMap(docs), nameMap(docs.flatMap((d) => d.members.map((m) => m.user_id)))])
  return docs
    .filter((d) => mountains.has(String(d.mountain_id)))
    .map((d) => ({
      id: String(d._id),
      mountain: mountains.get(String(d.mountain_id)),
      route: d.route,
      plannedDate: toDay(d.plannedDate),
      role: roleOf(d, viewerId),
      ...progressOf(d.items),
      members: d.members.map((m) => users.get(String(m.user_id))?.name).filter(Boolean),
    }))
}

// GET /checklists/:id — halaman detail
export async function checklistDetail(doc, viewerId) {
  const pending = await Invitation.find({ checklist_id: doc._id, status: 'pending' }).sort({ createdAt: 1 }).lean()
  const [mountains, users] = await Promise.all([
    mountainMap([doc]),
    nameMap([...doc.members.map((m) => m.user_id), ...pending.map((p) => p.invitedUser_id)]),
  ])

  return {
    id: String(doc._id),
    mountain: mountains.get(String(doc.mountain_id)) ?? null,
    route: doc.route,
    plannedDate: toDay(doc.plannedDate),
    // dipakai frontend untuk menandai "milik saya" pada klaim barang
    viewerId: String(viewerId),
    role: roleOf(doc, viewerId),
    members: doc.members
      .filter((m) => users.has(String(m.user_id)))
      .map((m) => ({ id: String(m.user_id), name: users.get(String(m.user_id)).name, role: m.role })),
    pendingInvites: pending
      .filter((p) => users.has(String(p.invitedUser_id)))
      .map((p) => {
        const u = users.get(String(p.invitedUser_id))
        return { id: String(p._id), userId: String(p.invitedUser_id), username: u.username, name: u.name }
      }),
    items: doc.items.map((i) => ({
      id: String(i._id),
      name: i.name,
      category: i.category,
      ownerId: i.owner_id ? String(i.owner_id) : null,
      done: i.done,
      addedBy: String(i.addedBy),
    })),
    // rekomendasi barang (keputusan #6): dikirim kosong dulu; aturan rekomendasi diputuskan belakangan
    recommendations: [],
  }
}
