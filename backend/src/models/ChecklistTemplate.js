import mongoose from 'mongoose'

const { Schema } = mongoose

// isi template hanya nama dan kategori; klaim dan centang tidak ikut tersimpan
const templateItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    category: { type: String, required: true, trim: true, maxlength: 30 },
  },
  { _id: false },
)

const checklistTemplateSchema = new Schema(
  {
    // null = template bawaan sistem (dari seed); berisi id pengguna = template milik pengguna itu
    user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    items: { type: [templateItemSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'checklist_templates' },
)

checklistTemplateSchema.index({ user_id: 1, createdAt: -1 })

export default mongoose.model('ChecklistTemplate', checklistTemplateSchema)
