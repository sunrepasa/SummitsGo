import mongoose from 'mongoose'

const { Schema } = mongoose

export const MAX_ITEMS = 200 // batas barang per checklist, mencegah dokumen membengkak

// anggota tertanam di checklist; tanpa _id sendiri karena dikenali dari user_id
const memberSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['leader', 'member'], required: true },
  },
  { _id: false },
)

// barang tertanam; _id dipakai sebagai itemId di URL
const itemSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  category: { type: String, required: true, trim: true, maxlength: 30 },
  // anggota yang membawa barang ini; null = belum diklaim
  owner_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  // hanya pemilik klaim yang boleh mencentang
  done: { type: Boolean, default: false },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
})

const checklistSchema = new Schema(
  {
    mountain_id: { type: Schema.Types.ObjectId, ref: 'Mountain', required: true },
    route: { type: String, required: true, trim: true },
    // tanggal tanpa jam, disimpan pukul 00:00 UTC seperti tanggal logbook; null = belum ditentukan
    plannedDate: { type: Date, default: null },
    // kode pendek untuk tautan /join/:code
    inviteCode: { type: String, required: true },
    members: { type: [memberSchema], default: [] },
    items: { type: [itemSchema], default: [] },
    // progres (done/total) TIDAK disimpan: selalu dihitung dari items saat dibaca (SRS 3.2 catatan 2)
  },
  { timestamps: true, collection: 'checklists' },
)

checklistSchema.index({ inviteCode: 1 }, { unique: true })
// "checklist yang saya ikuti" dicari lewat anggota
checklistSchema.index({ 'members.user_id': 1, createdAt: -1 })

export default mongoose.model('Checklist', checklistSchema)
