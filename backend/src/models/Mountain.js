import mongoose from 'mongoose'

const { Schema } = mongoose

const linkSchema = new Schema({ label: String, url: String }, { _id: false })

const mountainSchema = new Schema(
  {
    // id di respons API = slug (keputusan #1); ObjectId hanya dipakai di database
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true }, // kabupaten
    province: { type: String, required: true, trim: true },
    elevation: { type: Number, required: true, min: 0 },
    difficulty: { type: String, enum: ['beginner', 'medium', 'hard'], required: true },
    status: { type: String, enum: ['open', 'quota_full', 'closed'], default: 'open' },
    // rating dan reviewCount dihitung ulang dari review approved pada Fase 3
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    popularity: { type: Number, default: 0, min: 0 },
    cover: { type: String, default: null }, // URL gambar (keputusan #7)
    description: { type: String, default: '' },
    activeClimbers: { type: Number, default: 0, min: 0 },
    estimate: { type: String, default: null },
    volcano: {
      type: new Schema(
        { level: Number, label: String, verifiedAt: String, source: { type: linkSchema, default: null } },
        { _id: false },
      ),
      default: null,
    },
    hikingInfo: {
      type: new Schema(
        {
          registration: String,
          officialLink: { type: linkSchema, default: null },
          guide: String,
          rules: String,
          bestTime: String,
        },
        { _id: false },
      ),
      default: null,
    },
    emergency: {
      type: [new Schema({ type: { type: String }, title: String, name: String, phone: String }, { _id: false })],
      default: [],
    },
    // sesuai batasan proyek: selalu null, tidak diimplementasikan
    managed_by: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: true, collection: 'mountains' },
)

mountainSchema.index({ name: 'text', province: 'text', location: 'text' })

export default mongoose.model('Mountain', mountainSchema)
