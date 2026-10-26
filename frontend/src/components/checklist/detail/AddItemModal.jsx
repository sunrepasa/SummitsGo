import { useState } from 'react'
import BottomSheet from '../../ui/BottomSheet'
import { Field, Input, Select } from '../../ui/FormControls'
import { addItem } from '../../../api/checklist'

const FORM_ID = 'add-item-form'
const NEW = '__new__'
const NAME_MAX = 60
const CATEGORY_MIN = 2
const CATEGORY_MAX = 30

export default function AddItemModal({ checklistId, categories, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [choice, setChoice] = useState(categories[0] ?? NEW)
  const [newCategory, setNewCategory] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const creating = choice === NEW
  const trimmedName = name.trim()
  const trimmedCategory = newCategory.trim()

  const errors = {}
  if (!trimmedName) errors.name = 'Nama barang wajib diisi'
  if (creating) {
    if (trimmedCategory.length < CATEGORY_MIN || trimmedCategory.length > CATEGORY_MAX) {
      errors.category = `Nama kategori ${CATEGORY_MIN}–${CATEGORY_MAX} karakter`
    } else if (categories.some((c) => c.toLowerCase() === trimmedCategory.toLowerCase())) {
      errors.category = 'Kategori ini sudah ada, pilih dari daftar'
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setShowErrors(true)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    setSubmitError('')
    try {
      await addItem(checklistId, { name: trimmedName, category: creating ? trimmedCategory : choice })
      onSaved()
    } catch {
      setSubmitError('Gagal menambah barang. Coba lagi.')
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      open
      modal
      onClose={onClose}
      title="Tambah Barang"
      footer={
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="hidden flex-1 rounded-xl border border-line bg-paper py-3 text-[13px] font-semibold md:block"
          >
            Batal
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={saving}
            className="flex-1 rounded-xl bg-pine py-3 text-[13.5px] font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Menambah...' : 'Tambah'}
          </button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={submit} noValidate>
        <p className="mb-3.5 text-xs leading-normal text-mute">
          Barang baru muncul sebagai &quot;belum diklaim&quot;, siapa saja bisa mengklaimnya.
        </p>

        <Field label="Nama barang" htmlFor="item-name" error={showErrors ? errors.name : undefined}>
          <Input
            id="item-name"
            value={name}
            maxLength={NAME_MAX}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(showErrors && errors.name)}
            placeholder="Contoh: Headlamp"
            autoFocus
          />
        </Field>

        <Field label="Kategori" htmlFor="item-category">
          <Select id="item-category" value={choice} onChange={(e) => setChoice(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value={NEW}>+ Buat kategori baru…</option>
          </Select>
        </Field>

        {creating && (
          <Field label="Nama kategori baru" htmlFor="item-new-category" error={showErrors ? errors.category : undefined}>
            <Input
              id="item-new-category"
              value={newCategory}
              maxLength={CATEGORY_MAX}
              onChange={(e) => setNewCategory(e.target.value)}
              aria-invalid={Boolean(showErrors && errors.category)}
              placeholder="Contoh: Dokumentasi"
            />
          </Field>
        )}

        {submitError && (
          <p className="mb-2 rounded-xl bg-warnbg px-3.5 py-2.5 text-xs font-semibold text-warn">{submitError}</p>
        )}
      </form>
    </BottomSheet>
  )
}
