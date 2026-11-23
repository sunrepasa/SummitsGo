import mongoose from 'mongoose'

const { Schema } = mongoose

export const NOTIFICATION_TYPES = ['checklist_invite', 'member_joined', 'badge_earned', 'trip_verified', 'entry_liked', 'plan_reminder']

// Notifikasi selalu dibuat server (utils/notify.js), tidak pernah dari klien.
const notificationSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    text: { type: String, required: true, maxlength: 300 },
    // halaman frontend yang dibuka saat notifikasi diketuk, misalnya /checklist/<id>
    to: { type: String, required: true },
    read: { type: Boolean, default: false },
    // diisi sendiri, bukan timestamps: notifikasi suka yang digabung (entry_liked) memperbarui waktunya
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'notifications' },
)

// SRS 3.2 catatan 6: daftar notifikasi per pengguna, terbaru di atas
notificationSchema.index({ user_id: 1, createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)
