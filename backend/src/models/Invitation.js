import mongoose from 'mongoose'

const { Schema } = mongoose

const invitationSchema = new Schema(
  {
    checklist_id: { type: Schema.Types.ObjectId, ref: 'Checklist', required: true },
    invitedUser_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'invitations' },
)

// "undangan untuk saya" (SRS 3.2 catatan indeks)
invitationSchema.index({ invitedUser_id: 1, status: 1, createdAt: -1 })
// satu orang hanya boleh punya satu undangan pending per checklist. Dijaga database, jadi dua klik
// "Undang" yang bersamaan tidak membuat undangan ganda. Undangan yang sudah ditolak tidak ikut dihitung.
invitationSchema.index(
  { checklist_id: 1, invitedUser_id: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } },
)

export default mongoose.model('Invitation', invitationSchema)
