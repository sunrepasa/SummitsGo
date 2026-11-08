import mongoose from 'mongoose'

const { Schema } = mongoose

// SEMENTARA (Fase 3): hanya field yang dibutuhkan untuk menghitung label "Terverifikasi" pada ulasan.
// Fase 5 melengkapi field lain sesuai SRS 3.2 (tanggal, foto, catatan, crew, slug, suka).
const logbookSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mountain_id: { type: Schema.Types.ObjectId, ref: 'Mountain', required: true },
    route: { type: String, required: true, trim: true },
    verified: { type: Boolean, default: false },
    // true = pendakian terdeteksi yang belum dikonfirmasi pengguna
    isDraft: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'logbooks' },
)

logbookSchema.index({ user_id: 1 })

export default mongoose.model('Logbook', logbookSchema)
