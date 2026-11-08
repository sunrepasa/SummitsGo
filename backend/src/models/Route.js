import mongoose from 'mongoose'

const { Schema } = mongoose

const routeSchema = new Schema(
  {
    mountain_id: { type: Schema.Types.ObjectId, ref: 'Mountain', required: true },
    name: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['beginner', 'medium', 'hard'], required: true },
    duration: { type: String, default: null },
    description: { type: String, default: '' },
    // null = data basecamp belum ada (frontend menyembunyikan bagian ini)
    basecamp: {
      type: new Schema(
        { name: String, price: Number, address: String, mapsUrl: String, whatsapp: String, phone: String },
        { _id: false },
      ),
      default: null,
    },
    posts: {
      type: [
        new Schema(
          { name: String, distance: String, duration: String, facilities: [String], dangerNote: String },
          { _id: false },
        ),
      ],
      default: [],
    },
    // garis jalur rapat [[lat, lng], ...]; kosong = peta belum tersedia (mapAvailable dihitung dari sini)
    path: { type: [[Number]], default: [] },
    // titik penting pada peta; pathIndex dihitung server saat membaca
    checkpoints: {
      type: [new Schema({ type: { type: String }, name: String, lat: Number, lng: Number }, { _id: false })],
      default: [],
    },
    summitName: { type: String, default: 'Puncak' },
  },
  { timestamps: true, collection: 'routes' },
)

routeSchema.index({ mountain_id: 1 })
routeSchema.index({ mountain_id: 1, name: 1 }, { unique: true })

export default mongoose.model('Route', routeSchema)
