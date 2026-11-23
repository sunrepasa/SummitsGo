import mongoose from 'mongoose'
import Checklist from '../models/Checklist.js'
import Invitation from '../models/Invitation.js'
import User from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { toDay } from '../utils/date.js'
import { mountainMap } from '../utils/logbookView.js'
import { notifyMemberJoined } from '../utils/notify.js'

const { ObjectId } = mongoose.Types

const invitationNotFound = () => new AppError('Undangan tidak ditemukan', 'NOT_FOUND', 404)
const invalidLink = () => new AppError('Undangan tidak valid', 'NOT_FOUND', 404)
const asObjectId = (value) => (ObjectId.isValid(value) && String(new ObjectId(value)) === String(value).toLowerCase() ? new ObjectId(value) : null)

// Tambahkan pengguna sebagai anggota. Syarat "belum menjadi anggota" ikut di dalam perintah yang sama,
// jadi menekan Gabung dua kali (atau terima undangan + gabung lewat tautan) tidak membuat anggota ganda.
// Mengembalikan true bila pengguna benar-benar baru bergabung.
async function addMember(checklistId, userId) {
  const result = await Checklist.updateOne(
    { _id: checklistId, 'members.user_id': { $ne: userId } },
    { $push: { members: { user_id: userId, role: 'member' } } },
  )
  return result.modifiedCount > 0
}

// ---------- undangan langsung (lewat username) ----------

// GET /invitations/me — undangan pending untuk saya, terbaru di atas
export async function myInvitations(req, res) {
  const invitations = await Invitation.find({ invitedUser_id: req.user.id, status: 'pending' }).sort({ createdAt: -1 }).lean()
  const checklists = await Checklist.find({ _id: { $in: invitations.map((i) => i.checklist_id) } })
    .select('mountain_id route plannedDate')
    .lean()
  const [mountains, inviters] = await Promise.all([
    mountainMap(checklists),
    User.find({ _id: { $in: invitations.map((i) => i.invitedBy) } }).select('name').lean(),
  ])
  const checklistById = new Map(checklists.map((c) => [String(c._id), c]))
  const nameById = new Map(inviters.map((u) => [String(u._id), u.name]))

  res.json(
    invitations
      .filter((i) => checklistById.has(String(i.checklist_id)))
      .map((i) => {
        const c = checklistById.get(String(i.checklist_id))
        return {
          id: String(i._id),
          from: nameById.get(String(i.invitedBy)) ?? 'Pengguna SummitsGo',
          mountain: mountains.get(String(c.mountain_id)) ?? null,
          route: c.route,
          plannedDate: toDay(c.plannedDate),
        }
      }),
  )
}

// POST /invitations/:id/accept → { checklistId }
export async function acceptInvitation(req, res) {
  const id = asObjectId(req.params.id)
  const me = new ObjectId(req.user.id)
  const invitation = id && (await Invitation.findOne({ _id: id, invitedUser_id: me, status: 'pending' }).lean())
  if (!invitation) throw invitationNotFound()

  if (!(await Checklist.exists({ _id: invitation.checklist_id }))) {
    await Invitation.deleteOne({ _id: invitation._id }) // checklist-nya sudah dihapus
    throw invitationNotFound()
  }

  const joined = await addMember(invitation.checklist_id, me)
  await Invitation.updateOne({ _id: invitation._id }, { $set: { status: 'accepted' } })
  if (joined) await notifyMemberJoined(await Checklist.findById(invitation.checklist_id).lean(), me)
  res.json({ checklistId: String(invitation.checklist_id) })
}

// POST /invitations/:id/decline
export async function declineInvitation(req, res) {
  const id = asObjectId(req.params.id)
  const result = id
    ? await Invitation.updateOne({ _id: id, invitedUser_id: req.user.id, status: 'pending' }, { $set: { status: 'declined' } })
    : { modifiedCount: 0 }
  if (result.modifiedCount === 0) throw invitationNotFound()
  res.json({ message: 'Undangan ditolak' })
}

// ---------- undangan lewat tautan /join/:code ----------

const findByCode = (code) => Checklist.findOne({ inviteCode: String(code).toLowerCase() }).lean()

// GET /invites/:code — pratinjau, tamu boleh. `joined` dan `checklistId` hanya untuk yang sudah anggota.
export async function inviteInfo(req, res) {
  const doc = await findByCode(req.params.code)
  if (!doc) throw invalidLink()

  const [mountains, users] = await Promise.all([
    mountainMap([doc]),
    User.find({ _id: { $in: doc.members.map((m) => m.user_id) } }).select('name').lean(),
  ])
  const nameById = new Map(users.map((u) => [String(u._id), u.name]))
  const leader = doc.members.find((m) => m.role === 'leader')
  const joined = Boolean(req.user && doc.members.some((m) => String(m.user_id) === req.user.id))

  res.json({
    code: doc.inviteCode,
    invitedBy: nameById.get(String(leader?.user_id)) ?? 'Ketua',
    mountain: mountains.get(String(doc.mountain_id)) ?? null,
    route: doc.route,
    plannedDate: toDay(doc.plannedDate),
    members: doc.members.map((m) => nameById.get(String(m.user_id))).filter(Boolean),
    joined,
    checklistId: joined ? String(doc._id) : null,
  })
}

// POST /invites/:code/join → { checklistId }. Sudah anggota tetap 200 (langsung dibukakan checklist-nya).
export async function joinByCode(req, res) {
  const doc = await findByCode(req.params.code)
  if (!doc) throw invalidLink()
  const me = new ObjectId(req.user.id)

  const joined = await addMember(doc._id, me)
  // undangan langsung yang masih pending untuk checklist ini ikut dianggap diterima
  await Invitation.updateMany({ checklist_id: doc._id, invitedUser_id: me, status: 'pending' }, { $set: { status: 'accepted' } })
  // hanya bila benar-benar baru bergabung, supaya membuka tautan berulang tidak memberi notifikasi ganda
  if (joined) await notifyMemberJoined(doc, me)
  res.json({ checklistId: String(doc._id) })
}
