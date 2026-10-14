import client from './client'
import { USE_MOCK } from '../config'
import { checklists, incomingInvitations } from '../data/checklists'
import { mountains } from '../data/mountains'
import { mountainDetails } from '../data/mountainDetails'
import { ME_ID, people } from '../data/people'
import { myTemplates, systemTemplates, withItemCount } from '../data/templates'
import { buildRecommendations } from '../utils/checklistRecommendations'
import { wait } from './mockDelay'

const FAST = 150
const codedError = (message, code, status) => Object.assign(new Error(message), { code, status })
const progressOf = (items) => ({ done: items.filter((i) => i.done).length, total: items.length })
const roleOf = (record) => record.members.find((m) => m.id === ME_ID)?.role

function findRecord(id) {
  const record = checklists.find((c) => c.id === id)
  if (!record || !roleOf(record)) throw codedError('Checklist tidak ditemukan', 'NOT_FOUND', 404)
  return record
}

function findItem(record, itemId) {
  const item = record.items.find((i) => i.id === itemId)
  if (!item) throw codedError('Barang tidak ditemukan', 'ITEM_NOT_FOUND', 404)
  return item
}

const requireLeader = (record) => {
  if (roleOf(record) !== 'leader') throw codedError('Hanya Ketua yang boleh melakukan ini', 'FORBIDDEN', 403)
}

function toDetail(record) {
  const mountain = mountains.find((m) => m.id === record.mountainId)
  return {
    id: record.id,
    mountain,
    route: record.route,
    plannedDate: record.plannedDate,
    viewerId: ME_ID,
    role: roleOf(record),
    members: record.members.map((m) => ({ ...m })),
    pendingInvites: record.pendingInvites.map((p) => ({ ...p })),
    items: record.items.map((i) => ({ ...i })),
    recommendations: buildRecommendations({
      mountain,
      details: mountainDetails[record.mountainId],
      route: record.route,
      items: record.items,
    }),
  }
}

// ---------- Daftar & detail ----------

export async function getMyChecklists() {
  if (USE_MOCK) {
    return wait(
      checklists.map((c) => ({
        id: c.id,
        mountain: mountains.find((m) => m.id === c.mountainId),
        route: c.route,
        plannedDate: c.plannedDate,
        role: roleOf(c),
        ...progressOf(c.items),
        members: c.members.map((m) => m.name),
      })),
    )
  }
  const { data } = await client.get('/checklists')
  return data
}

export async function getChecklistById(id) {
  if (USE_MOCK) {
    await wait(null, 350)
    return toDetail(findRecord(id))
  }
  const { data } = await client.get(`/checklists/${id}`)
  return data
}

export async function getChecklistTemplates() {
  if (USE_MOCK) {
    return wait({ mine: myTemplates.map(withItemCount), system: systemTemplates.map(withItemCount) }, 200)
  }
  const { data } = await client.get('/checklist-templates')
  return data
}

export async function createChecklist({ mountainId, route, plannedDate, templateId, leaderName }) {
  if (USE_MOCK) {
    const template = [...myTemplates, ...systemTemplates].find((t) => t.id === templateId)
    const id = `cl-${Date.now()}`
    checklists.unshift({
      id,
      mountainId,
      route,
      plannedDate: plannedDate || null,
      inviteCode: Math.random().toString(36).slice(2, 8),
      members: [{ id: ME_ID, name: leaderName, role: 'leader' }],
      pendingInvites: [],
      items: (template?.items ?? []).map((it, i) => ({
        id: `${id}-i${i + 1}`,
        name: it.name,
        category: it.category,
        ownerId: null,
        done: false,
        addedBy: ME_ID,
      })),
    })
    return wait(null, 500)
  }
  await client.post('/checklists', {
    mountainId,
    route,
    plannedDate: plannedDate || undefined,
    templateId: templateId || undefined,
  })
}

export async function deleteChecklist(id) {
  if (USE_MOCK) {
    requireLeader(findRecord(id))
    checklists.splice(
      checklists.findIndex((c) => c.id === id),
      1,
    )
    return wait(null, 400)
  }
  await client.delete(`/checklists/${id}`)
}

export async function saveAsTemplate(id, name) {
  if (USE_MOCK) {
    const record = findRecord(id)
    requireLeader(record)
    myTemplates.unshift({
      id: `tpl-me-${Date.now()}`,
      name,
      items: record.items.map(({ name: itemName, category }) => ({ name: itemName, category })),
    })
    return wait(null, 400)
  }
  await client.post(`/checklists/${id}/template`, { name })
}

// ---------- Barang ----------

export async function claimItem(checklistId, itemId) {
  if (USE_MOCK) {
    const item = findItem(findRecord(checklistId), itemId)
    // backend sungguhan harus menolak klaim kedua dengan cara yang sama
    if (item.ownerId && item.ownerId !== ME_ID) {
      throw codedError('Barang ini sudah diklaim anggota lain', 'ALREADY_CLAIMED', 409)
    }
    item.ownerId = ME_ID
    return wait(null, FAST)
  }
  await client.post(`/checklists/${checklistId}/items/${itemId}/claim`)
}

export async function unclaimItem(checklistId, itemId) {
  if (USE_MOCK) {
    const item = findItem(findRecord(checklistId), itemId)
    if (item.ownerId !== ME_ID || item.done) throw codedError('Tidak bisa membatalkan klaim', 'FORBIDDEN', 403)
    item.ownerId = null
    return wait(null, FAST)
  }
  await client.delete(`/checklists/${checklistId}/items/${itemId}/claim`)
}

export async function setItemDone(checklistId, itemId, done) {
  if (USE_MOCK) {
    const item = findItem(findRecord(checklistId), itemId)
    if (item.ownerId !== ME_ID) throw codedError('Hanya pemilik yang bisa mencentang', 'FORBIDDEN', 403)
    item.done = done
    return wait(null, FAST)
  }
  await client.patch(`/checklists/${checklistId}/items/${itemId}`, { done })
}

export async function addItem(checklistId, { name, category }) {
  if (USE_MOCK) {
    const record = findRecord(checklistId)
    const existingCategory = record.items.find((i) => i.category.toLowerCase() === category.trim().toLowerCase())
    record.items.push({
      id: `${checklistId}-i${Date.now()}`,
      name: name.trim(),
      category: existingCategory?.category ?? category.trim(),
      ownerId: null,
      done: false,
      addedBy: ME_ID,
    })
    return wait(null, 300)
  }
  await client.post(`/checklists/${checklistId}/items`, { name, category })
}

export async function removeItem(checklistId, itemId) {
  if (USE_MOCK) {
    const record = findRecord(checklistId)
    const item = findItem(record, itemId)
    const allowed = roleOf(record) === 'leader' || (item.addedBy === ME_ID && !item.ownerId)
    if (!allowed) throw codedError('Tidak boleh menghapus barang ini', 'FORBIDDEN', 403)
    record.items.splice(record.items.indexOf(item), 1)
    return wait(null, FAST)
  }
  await client.delete(`/checklists/${checklistId}/items/${itemId}`)
}

// ---------- Anggota & undangan ----------

export async function removeMember(checklistId, memberId) {
  if (USE_MOCK) {
    const record = findRecord(checklistId)
    requireLeader(record)
    record.members = record.members.filter((m) => m.id !== memberId)
    // barang yang diklaimnya kembali belum diklaim dan centangnya dihapus
    record.items.forEach((i) => {
      if (i.ownerId === memberId) {
        i.ownerId = null
        i.done = false
      }
    })
    return wait(null, 300)
  }
  await client.delete(`/checklists/${checklistId}/members/${memberId}`)
}

export async function createInviteLink(checklistId) {
  if (USE_MOCK) {
    const record = findRecord(checklistId)
    requireLeader(record)
    await wait(null, 600)
    return `${window.location.origin}/join/${record.inviteCode}`
  }
  const { data } = await client.post(`/checklists/${checklistId}/invite-link`)
  return data.url
}

// state: 'member' | 'invited' | null. Minimal 2 karakter, maksimal 5 hasil.
export async function searchUsers(query, checklistId) {
  const q = query.trim().toLowerCase().replace(/^@/, '')
  if (USE_MOCK) {
    if (q.length < 2) return wait([], 100)
    const record = findRecord(checklistId)
    const result = people
      .filter((p) => p.username.includes(q) || p.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({
        ...p,
        state: record.members.some((m) => m.id === p.id)
          ? 'member'
          : record.pendingInvites.some((i) => i.userId === p.id)
            ? 'invited'
            : null,
      }))
    return wait(result, 250)
  }
  const { data } = await client.get('/users/search', { params: { q, checklistId, limit: 5 } })
  return data
}

export async function inviteByUsername(checklistId, username) {
  if (USE_MOCK) {
    const record = findRecord(checklistId)
    requireLeader(record)
    const person = people.find((p) => p.username === username)
    if (!person) throw codedError('Pengguna tidak ditemukan', 'USER_NOT_FOUND', 404)
    if (record.members.some((m) => m.id === person.id)) {
      throw codedError('Sudah menjadi anggota', 'ALREADY_MEMBER', 409)
    }
    if (record.pendingInvites.some((i) => i.userId === person.id)) {
      throw codedError('Sudah diundang', 'ALREADY_INVITED', 409)
    }
    record.pendingInvites.push({ id: `pi-${Date.now()}`, userId: person.id, username: person.username, name: person.name })
    return wait(null, 400)
  }
  await client.post(`/checklists/${checklistId}/invitations`, { username })
}

export async function cancelInvitation(checklistId, invitationId) {
  if (USE_MOCK) {
    const record = findRecord(checklistId)
    requireLeader(record)
    record.pendingInvites = record.pendingInvites.filter((i) => i.id !== invitationId)
    return wait(null, FAST)
  }
  await client.delete(`/checklists/${checklistId}/invitations/${invitationId}`)
}

export async function getMyInvitations() {
  if (USE_MOCK) {
    return wait(
      incomingInvitations.map((inv) => ({
        id: inv.id,
        from: inv.from.name,
        mountain: mountains.find((m) => m.id === inv.checklist.mountainId),
        route: inv.checklist.route,
        plannedDate: inv.checklist.plannedDate,
      })),
      250,
    )
  }
  const { data } = await client.get('/invitations/me')
  return data
}

export async function acceptInvitation(invitationId) {
  if (USE_MOCK) {
    const index = incomingInvitations.findIndex((i) => i.id === invitationId)
    if (index === -1) throw codedError('Undangan tidak ditemukan', 'NOT_FOUND', 404)
    const [{ checklist }] = incomingInvitations.splice(index, 1)
    checklists.unshift({
      ...checklist,
      members: [...checklist.members, { id: ME_ID, name: 'Sayz', role: 'member' }],
    })
    return wait(checklist.id, 400)
  }
  const { data } = await client.post(`/invitations/${invitationId}/accept`)
  return data.checklistId
}

export async function declineInvitation(invitationId) {
  if (USE_MOCK) {
    const index = incomingInvitations.findIndex((i) => i.id === invitationId)
    if (index !== -1) incomingInvitations.splice(index, 1)
    return wait(null, 300)
  }
  await client.post(`/invitations/${invitationId}/decline`)
}
