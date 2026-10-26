import { useState } from 'react'
import BottomSheet from '../ui/BottomSheet'
import { Field, Input } from '../ui/FormControls'
import { changePassword } from '../../api/user'
import { useAuth } from '../../context/AuthContext'
import { PASSWORD_MIN } from '../../utils/auth'

const FORM_ID = 'change-password-form'

function validate({ current, next, confirm }) {
  const errors = {}
  if (!current) errors.current = 'Isi kata sandi saat ini'
  if (!next) errors.next = 'Isi kata sandi baru'
  else if (next.length < PASSWORD_MIN) errors.next = `Minimal ${PASSWORD_MIN} karakter`
  else if (next === current) errors.next = 'Kata sandi baru harus berbeda dari yang lama'
  if (!confirm) errors.confirm = 'Ulangi kata sandi baru'
  else if (confirm !== next) errors.confirm = 'Kata sandi tidak sama'
  return errors
}

export default function ChangePasswordModal({ onClose, onSaved }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [showErrors, setShowErrors] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setServerErrors((s) => ({ ...s, [key]: undefined }))
  }
  const errors = { ...(showErrors ? validate(form) : {}), ...serverErrors }

  const submit = async (e) => {
    e.preventDefault()
    setShowErrors(true)
    if (Object.keys(validate(form)).length > 0) return

    setSaving(true)
    setSubmitError('')
    try {
      await changePassword(user.username, { currentPassword: form.current, newPassword: form.next })
      onSaved()
    } catch (err) {
      if (err.code === 'INVALID_CREDENTIALS') setServerErrors({ current: 'Kata sandi saat ini salah' })
      else setSubmitError('Gagal mengganti kata sandi. Coba lagi.')
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      open
      modal
      onClose={saving ? () => {} : onClose}
      title="Ganti Kata Sandi"
      footer={
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="hidden flex-1 rounded-xl border border-line bg-paper py-3 text-[13px] font-semibold disabled:opacity-60 md:block"
          >
            Batal
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={saving}
            className="flex-1 rounded-xl bg-pine py-3 text-[13.5px] font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Menyimpan...' : 'Simpan Kata Sandi'}
          </button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={submit} noValidate>
        <Field label="Kata sandi saat ini" htmlFor="pw-current" error={errors.current}>
          <Input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            value={form.current}
            onChange={set('current')}
            aria-invalid={Boolean(errors.current)}
          />
        </Field>
        <Field
          label="Kata sandi baru"
          htmlFor="pw-new"
          error={errors.next}
          hint={`Minimal ${PASSWORD_MIN} karakter`}
        >
          <Input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            value={form.next}
            onChange={set('next')}
            aria-invalid={Boolean(errors.next)}
          />
        </Field>
        <Field label="Ulangi kata sandi baru" htmlFor="pw-confirm" error={errors.confirm}>
          <Input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={set('confirm')}
            aria-invalid={Boolean(errors.confirm)}
          />
        </Field>
        {submitError && (
          <p className="mb-2 rounded-xl bg-warnbg px-3.5 py-2.5 text-xs font-semibold text-warn">{submitError}</p>
        )}
      </form>
    </BottomSheet>
  )
}
