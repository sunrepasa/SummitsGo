import mongoose from 'mongoose'
import { REVIEW_TAGS } from '../utils/schemas.js'

const { Schema } = mongoose

// Ulasan baru selalu "pending": baru tampil ke publik setelah admin menyetujuinya (Fase 8)
const reviewSchema = new Schema(
  {
    mountain_id: { type: Schema.Types.ObjectId, ref: 'Mountain', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    route: { type: String, default: null, trim: true },
    // pendakian yang mendasari ulasan (bila ditulis dari halaman logbook)
    logbook_id: { type: Schema.Types.ObjectId, ref: 'Logbook', default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    tags: { type: [{ type: String, enum: REVIEW_TAGS }], default: [] },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    // dihitung server saat ulasan dibuat, tidak pernah diambil dari klien
    verified: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true, collection: 'reviews' },
)

// sesuai SRS 3.2 catatan 6: pencarian ulasan per gunung selalu menyaring status
reviewSchema.index({ mountain_id: 1, status: 1, createdAt: -1 })
reviewSchema.index({ user_id: 1 })

export default mongoose.model('Review', reviewSchema)
