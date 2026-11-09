import mongoose from 'mongoose'

const { Schema } = mongoose

export const MAX_PHOTOS = 10

// foto tertanam di dokumen logbook; _id dipakai sebagai id foto di respons
const photoSchema = new Schema(
  {
    // path lokal ("/uploads/abc.jpg") atau URL lengkap layanan eksternal di masa depan
    url: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

const logbookSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mountain_id: { type: Schema.Types.ObjectId, ref: 'Mountain', required: true },
    route: { type: String, required: true, trim: true },
    // tanggal tanpa jam disimpan pukul 00:00 UTC (lihat utils/date.js)
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // null = lama pendakian tidak diisi; 0 = tektok (pulang hari)
    nights: { type: Number, default: null, min: 0 },
    note: { type: String, default: '', maxlength: 1000 },
    // true hanya untuk pendakian terdeteksi yang dikonfirmasi; entri manual selalu false
    verified: { type: Boolean, default: false },
    // true = pendakian terdeteksi yang belum dikonfirmasi pengguna (tidak tampil di riwayat)
    isDraft: { type: Boolean, default: false },
    photos: { type: [photoSchema], default: [] },
    // anggota rombongan dari checklist yang sama (hanya entri terverifikasi), termasuk pemilik
    crew: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    checklist_id: { type: Schema.Types.ObjectId, ref: 'Checklist', default: null },
    isPublic: { type: Boolean, default: false },
    // dibuat sekali saat pertama dipublikkan, tidak berubah walau entri diprivatkan lalu dipublikkan lagi.
    // Sengaja tanpa default: entri yang belum pernah publik tidak punya field ini sama sekali.
    slug: { type: String },
    // likes selalu sama dengan panjang likedBy; keduanya diubah bersamaan dalam satu perintah
    likes: { type: Number, default: 0, min: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true, collection: 'logbooks' },
)

logbookSchema.index({ user_id: 1, isDraft: 1, startDate: -1 })
// unik hanya untuk dokumen yang slug-nya berupa teks. Indeks "sparse" biasa tetap mencatat nilai null,
// sehingga entri privat kedua dengan slug null akan dianggap duplikat; partialFilterExpression menghindarinya.
logbookSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { slug: { $type: 'string' } } })

export default mongoose.model('Logbook', logbookSchema)
