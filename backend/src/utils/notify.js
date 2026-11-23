import mongoose from 'mongoose'
import Checklist from '../models/Checklist.js'
import Mountain from '../models/Mountain.js'
import Notification from '../models/Notification.js'
import User from '../models/User.js'
import { addDays, parseDay, toDateOnly } from './date.js'

const { ObjectId } = mongoose.Types

// Pengingat rencana dikirim bila tanggal rencana tinggal sebanyak ini hari atau kurang
export const REMINDER_DAYS = 3

// Notifikasi hanya pelengkap. Bila menyimpannya gagal, aksi utama (mengundang, bergabung, menyukai)
// tetap dianggap berhasil, jadi error di sini dicatat saja dan tidak dilempar ke controller.
async function safely(task) {
  try {
    await task()
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') console.error('[notify] gagal membuat notifikasi:', err.message)
  }
}

export const notify = (userId, type, text, to) => safely(() => Notification.create({ user_id: userId, type, text, to }))

const nameOf = async (userId) => (await User.findById(userId).select('name').lean())?.name ?? 'Pengguna SummitsGo'
const mountainName = async (mountainId) => (await Mountain.findById(mountainId).select('name').lean())?.name ?? 'gunung'
const tripLabel = async (checklist) => `${await mountainName(checklist.mountain_id)} via ${checklist.route}`

// ---- pemicu yang dipanggil controller ----

// Ketua mengundang lewat username → yang diundang
export const notifyInvite = (checklist, inviterId, invitedUserId) =>
  safely(async () => {
    const text = `${await nameOf(inviterId)} mengundangmu ke checklist ${await tripLabel(checklist)}.`
    await Notification.create({ user_id: invitedUserId, type: 'checklist_invite', text, to: '/checklist' })
  })

// Anggota baru bergabung (terima undangan atau lewat tautan) → Ketua
export const notifyMemberJoined = (checklist, joinedUserId) =>
  safely(async () => {
    const leader = checklist.members.find((m) => m.role === 'leader')
    if (!leader || String(leader.user_id) === String(joinedUserId)) return
    const text = `${await nameOf(joinedUserId)} bergabung ke checklist ${await tripLabel(checklist)}.`
    await Notification.create({ user_id: leader.user_id, type: 'member_joined', text, to: `/checklist/${checklist._id}` })
  })

// Draf pendakian dikonfirmasi → pemiliknya
export const notifyTripVerified = (entry) =>
  safely(async () => {
    const text = `Pendakian ${await mountainName(entry.mountain_id)} terverifikasi dan masuk ke logbook-mu.`
    await Notification.create({ user_id: entry.user_id, type: 'trip_verified', text, to: `/logbook/${entry._id}` })
  })

// Orang lain menyukai entri → pemiliknya. Selama notifikasi suka untuk entri yang sama belum dibaca,
// notifikasi itu diperbarui ("Rani dan 2 lainnya…"), bukan ditambah baru, supaya lonceng tidak dibanjiri.
export const notifyLike = (entry, likerId) =>
  safely(async () => {
    if (String(entry.user_id) === String(likerId)) return
    // penyuka selain pemilik (pemilik boleh menyukai entrinya sendiri, tetapi tidak dihitung di sini)
    const others = (entry.likedBy ?? []).filter((id) => String(id) !== String(entry.user_id)).length
    const name = await nameOf(likerId)
    const who = others > 1 ? `${name} dan ${others - 1} lainnya` : name
    const text = `${who} menyukai logbook ${await mountainName(entry.mountain_id)}-mu.`
    // upsert: perbarui yang belum dibaca, atau buat baru bila tidak ada
    await Notification.updateOne(
      { user_id: entry.user_id, type: 'entry_liked', to: `/logbook/${entry._id}`, read: false },
      { $set: { text, createdAt: new Date() } },
      { upsert: true },
    )
  })

// Dipanggil setiap kali daftar atau jumlah notifikasi dibaca (keputusan Fase 7: tanpa cron).
// Checklist yang tanggal rencananya tinggal REMINDER_DAYS hari atau kurang mendapat satu pengingat
// per anggota. Penanda remindedAt diubah dalam perintah yang sama dengan syarat "belum diingatkan",
// jadi dua request bersamaan tidak membuat pengingat ganda.
async function createPlanReminders(userId) {
  const me = new ObjectId(userId)
  const todayText = toDateOnly(new Date())
  const today = parseDay(todayText)
  const due = await Checklist.find({
    plannedDate: { $gte: today, $lte: addDays(today, REMINDER_DAYS) },
    members: { $elemMatch: { user_id: me, remindedAt: null } },
  })
    .select('mountain_id route plannedDate')
    .lean()

  for (const checklist of due) {
    const claimed = await Checklist.updateOne(
      { _id: checklist._id, members: { $elemMatch: { user_id: me, remindedAt: null } } },
      { $set: { 'members.$.remindedAt': new Date() } },
    )
    if (claimed.modifiedCount === 0) continue

    const days = Math.round((checklist.plannedDate - today) / (24 * 60 * 60 * 1000))
    const when = days === 0 ? 'hari ini' : days === 1 ? 'besok' : `tinggal ${days} hari lagi`
    const text = `Rencana pendakian ${await tripLabel(checklist)} ${when}. Cek lagi barang bawaanmu.`
    await notify(me, 'plan_reminder', text, `/checklist/${checklist._id}`)
  }
}

// Pengingat yang gagal dibuat tidak boleh membuat daftar notifikasi ikut gagal dimuat
export const ensurePlanReminders = (userId) => safely(() => createPlanReminders(userId))
