import { useState } from 'react'
import BottomSheet from '../../ui/BottomSheet'
import { Field, Input } from '../../ui/FormControls'
import { saveAsTemplate } from '../../../api/checklist'

const FORM_ID = 'save-template-form'
const MIN = 2
const MAX = 40

export default function SaveTemplateModal({ checklist, onClose, onSaved }) {
  const [name, setName] = useState(`Checklist ${checklist.mountain.name}`.slice(0, MAX))
  const [showError, setShowError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const trimmed = name.trim()
  const error = trimmed.length < MIN ? `Nama template minimal ${MIN} karakter` : ''

  const submit = async (e) => {
    e.preventDefault()
    setShowError(true)
    if (error) return

    setSaving(true)
    setSubmitError('')
    try {
      await saveAsTemplate(checklist.id, trimmed)
      onSaved()
    } catch {
      setSubmitError('Gagal menyimpan template. Coba lagi.')
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      open
      modal
      onClose={onClose}
      title="Simpan sebagai Template"
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
            {saving ? 'Menyimpan...' : 'Simpan Template'}
          </button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={submit} noValidate>
        <p className="mb-3.5 text-xs leading-normal text-mute">
          Susunan kategori dan barang ({checklist.items.length} barang) disimpan ke Template Saya. Klaim dan status
          centang tidak ikut tersimpan.
        </p>
        <Field label="Nama template" htmlFor="template-name" error={showError ? error : undefined}>
          <Input
            id="template-name"
            value={name}
            maxLength={MAX}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(showError && error)}
            autoFocus
          />
        </Field>
        {submitError && (
          <p className="mb-2 rounded-xl bg-warnbg px-3.5 py-2.5 text-xs font-semibold text-warn">{submitError}</p>
        )}
      </form>
    </BottomSheet>
  )
}
