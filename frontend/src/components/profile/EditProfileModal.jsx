import { useState } from 'react'
import { Check, Lock, RefreshCw, X } from 'lucide-react'
import Avatar from '../ui/Avatar'
import BottomSheet from '../ui/BottomSheet'
import ConfirmDialog from '../ui/ConfirmDialog'
import { Field, Input } from '../ui/FormControls'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { updateProfile } from '../../api/user'
import { useUsernameCheck } from '../../hooks/useUsernameCheck'
import { dateToIso, formatDateRange } from '../../utils/date'
import { getUsernameUnlockDate, normalizeUsername, validateUsername } from '../../utils/username'

const FORM_ID = 'edit-profile-form'
const NAME_MAX = 50

const feedbackIcons = { lock: Lock, check: Check, x: X }
const feedbackTones = {
  ok: 'font-semibold text-leaf-deep',
  bad: 'font-semibold text-warn',
  mute: 'text-mute',
}

export default function EditProfileModal({ onClose }) {
  const { user, updateUser } = useAuth()
  const toast = useToast()

  const [name, setName] = useState(user.name)
  const [username, setUsername] = useState(user.username)
  const [rejected, setRejected] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const unlockDate = getUsernameUnlockDate(user.usernameChangedAt)
  const locked = Boolean(unlockDate)
  const unchanged = username === user.username
  const formatError = unchanged ? '' : validateUsername(username)
  const check = useUsernameCheck(username, locked || unchanged || Boolean(formatError))
  // rejected: username yang ditolak server saat disimpan (misalnya baru saja diambil orang lain)
  const status = rejected === username ? 'taken' : check.status

  const trimmedName = name.trim()
  const nameError = !trimmedName
    ? 'Nama lengkap wajib diisi'
    : trimmedName.length > NAME_MAX
      ? `Maksimal ${NAME_MAX} karakter`
      : ''

  let feedback = null
  if (locked) {
    feedback = { tone: 'mute', icon: 'lock', text: `Username bisa diganti lagi pada ${formatDateRange(dateToIso(unlockDate))}` }
  } else if (formatError) {
    feedback = { tone: 'bad', icon: 'x', text: formatError }
  } else if (unchanged) {
    feedback = { tone: 'mute', text: 'Ini username kamu saat ini' }
  } else if (status === 'checking') {
    feedback = { tone: 'mute', icon: 'spinner', text: 'Memeriksa...' }
  } else if (status === 'available') {
    feedback = { tone: 'ok', icon: 'check', text: 'Username tersedia' }
  } else if (status === 'taken') {
    feedback = { tone: 'bad', icon: 'x', text: 'Username sudah dipakai' }
  } else if (status === 'error') {
    feedback = { tone: 'bad', icon: 'x', text: 'Gagal memeriksa username.', retry: true }
  }

  const FeedbackIcon = feedback ? feedbackIcons[feedback.icon] : null
  const usernameOk = unchanged || (!locked && !formatError && status === 'available')
  const dirty = trimmedName !== user.name || !unchanged
  const canSave = dirty && !nameError && usernameOk && !saving

  const save = async () => {
    setSaving(true)
    setSubmitError('')
    try {
      const updated = await updateProfile(user, { name: trimmedName, username })
      updateUser(updated)
      toast.success('Profil berhasil diperbarui')
      onClose()
    } catch (err) {
      setSaving(false)
      setConfirming(false)
      if (err.code === 'USERNAME_TAKEN') setRejected(username)
      else if (err.code === 'USERNAME_COOLDOWN') setSubmitError('Username belum bisa diganti saat ini. Coba lagi nanti.')
      else setSubmitError('Gagal menyimpan. Coba lagi.')
    }
  }

  const submit = (e) => {
    e.preventDefault()
    if (!canSave) return
    if (unchanged) save()
    else setConfirming(true)
  }

  // saat dialog konfirmasi terbuka atau sedang menyimpan, Esc dan klik latar tidak boleh menutup form ini
  const guardedClose = confirming || saving ? () => {} : onClose

  return (
    <>
      <BottomSheet
        open
        modal
        onClose={guardedClose}
        title="Edit Profil"
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
              disabled={!canSave}
              className="flex-1 rounded-xl bg-pine py-3 text-[13.5px] font-semibold text-white disabled:opacity-50"
            >
              {saving && !confirming ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        }
      >
        <form id={FORM_ID} onSubmit={submit} noValidate>
          <div className="mb-5 flex justify-center">
            <Avatar name={trimmedName || user.name} size={76} />
          </div>

          <Field label="Nama Lengkap" htmlFor="ep-name" error={nameError}>
            <Input
              id="ep-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              aria-invalid={Boolean(nameError)}
            />
          </Field>

          <Field label="Username" htmlFor="ep-username">
            <div
              className={`flex items-center rounded-[11px] border px-[13px] ${
                locked ? 'bg-stone' : 'bg-paper'
              } ${feedback?.tone === 'bad' ? 'border-warn' : 'border-line focus-within:border-pine'}`}
            >
              <span className="select-none text-[12.5px] text-mute md:text-[13px]">@</span>
              <input
                id="ep-username"
                value={username}
                onChange={(e) => {
                  setUsername(normalizeUsername(e.target.value))
                  setRejected('')
                }}
                disabled={locked}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={feedback?.tone === 'bad'}
                aria-describedby="ep-username-status"
                className="min-w-0 flex-1 bg-transparent py-[11px] pl-1 text-[12.5px] text-ink outline-none disabled:text-mute md:text-[13px]"
              />
            </div>

            {feedback && (
              <p
                id="ep-username-status"
                aria-live="polite"
                className={`mt-1.5 flex items-center gap-1 text-[11px] ${feedbackTones[feedback.tone]}`}
              >
                {feedback.icon === 'spinner' ? (
                  <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  FeedbackIcon && <FeedbackIcon size={12} strokeWidth={3} />
                )}
                {feedback.text}
                {feedback.retry && (
                  <button type="button" onClick={check.retry} className="ml-1 underline">
                    Coba lagi
                  </button>
                )}
              </p>
            )}
          </Field>

          <Field label="Email" htmlFor="ep-email" hint="Ubah email lewat Pengaturan Akun">
            <Input id="ep-email" value={user.email ?? '–'} disabled />
          </Field>

          {submitError && <p className="mb-2 text-xs font-semibold text-warn">{submitError}</p>}
        </form>
      </BottomSheet>

      {confirming && (
        <ConfirmDialog
          icon={RefreshCw}
          title="Yakin ganti username?"
          confirmLabel="Ya, Ganti"
          busyLabel="Menyimpan..."
          busy={saving}
          onConfirm={save}
          onCancel={() => setConfirming(false)}
        >
          Setelah diganti, kamu perlu menunggu <b className="text-ink">7 hari</b> sebelum bisa mengganti
          username lagi.
        </ConfirmDialog>
      )}
    </>
  )
}