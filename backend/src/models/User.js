import mongoose from 'mongoose'

const { Schema } = mongoose

// bentuk socials dan display mengikuti data mock frontend (profileOf di utils/profile.js),
// bukan SRS yang hanya mencatat instagram
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    usernameChangedAt: { type: Date, default: null },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    bio: { type: String, default: '', maxlength: 160 },
    socials: {
      tiktok: { type: String, default: '' },
      instagram: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    display: {
      joinedSince: { type: Boolean, default: true },
      extraStats: { type: Boolean, default: true },
      tiktok: { type: Boolean, default: true },
      instagram: { type: Boolean, default: true },
      website: { type: Boolean, default: true },
      // null = belum memilih (otomatis); array = id lencana pilihan pengguna
      shownBadges: { type: Schema.Types.Mixed, default: null },
    },
    isProfilePublic: { type: Boolean, default: true },
    savedMountains: [{ type: Schema.Types.ObjectId, ref: 'Mountain' }],
  },
  { timestamps: true, collection: 'users' },
)

export default mongoose.model('User', userSchema)
