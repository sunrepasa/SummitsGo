import { useState } from 'react'
import { Check, Lock, RefreshCw, X } from 'lucide-react'
import Avatar from '../ui/Avatar'
import BottomSheet from '../ui/BottomSheet'
import ConfirmDialog from '../ui/ConfirmDialog'
import { Field, Input, PrefixInput, Textarea } from '../ui/FormControls'
import Toggle from '../ui/Toggle'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { updateProfile } from '../../api/user'
import { useUsernameCheck } from '../../hooks/useUsernameCheck'
import { dateToIso, formatDateRange } from '../../utils/date'
import { BIO_MAX, SOCIAL_MAX, parseWebsite, profileOf, validateHandle } from '../../utils/profile'
import { getUsernameUnlockDate, normalizeUsername, validateUsername } from '../../utils/username'

const FORM_ID = 'edit-profile-form'
const NAME_MAX = 50

const feedbackIcons = { lock: Lock, check: Check, x: X }
const feedbackTones = {
  ok: 'font-semibold text-leaf-deep',
  bad: 'font-semibold text-warn',
  mute: 'text-mute',
}

function SectionTitle({ children }) {
  return <p className="mb-2.5 mt-5 border-t border-line pt-4 text-xs font-bold">{children}</p>
}

function LinkField({ id, label, show, onShow, canShow, error, hint, children }) {
  return (
    <div className="mb-3.5">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[11.5px] font-semibold md:text-xs">
          {label}
        </label>
        <span className="flex items-center gap-2 text-[11px] text-mute">
          Tampilkan
          <Toggle
            checked={show}
            onChange={onShow}
            disabled={!canShow}
            label={`Tampilkan ${label} di profil`}
          />
        </span>
      </div>
      {children}
      {error ? (
        <p className="mt-1.5 text-[11px] font-semibold text-warn">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-[11px] text-mute">{hint}</p>
      )}
    </div>
  )
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line py-3 first:border-t-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold">{title}</p>
        <p className="mt-px text-[11px] text-mute">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  )
}

export default function EditProfileModal({ onClose }) {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const current = profileOf(user)

  const [name, setName] = useState(user.name)
  const [username, setUsername] = useState(user.username)
  const [bio, setBio] = useState(current.bio)
  const [socials, setSocials] = useState(current.socials)
  const [display, setDisplay] = useState(current.display)
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

  const bioError = bio.length > BIO_MAX ? `Maksimal ${BIO_MAX} karakter` : ''
  const tiktokError = validateHandle(socials.tiktok, SOCIAL_MAX.tiktok)
  const instagramError = validateHandle(socials.instagram, SOCIAL_MAX.instagram)
  const website = parseWebsite(socials.website)

  const draft = {
    bio: bio.trim(),
    socials: { tiktok: socials.tiktok, instagram: socials.instagram, website: website.href },
    display,
  }
  const profileChanged = JSON.stringify(draft) !== JSON.stringify(current)

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
  const fieldsOk = !nameError && !bioError && !tiktokError && !instagramError && !website.error
  const dirty = trimmedName !== user.name || !unchanged || profileChanged
  const canSave = dirty && fieldsOk && usernameOk && !saving

  const setSocial = (key, transform = (v) => v) => (e) =>
    setSocials((s) => ({ ...s, [key]: transform(e.target.value) }))
  const setShow = (key) => (on) => setDisplay((d) => ({ ...d, [key]: on }))

  const save = async () => {
    setSaving(true)
    setSubmitError('')
    try {
      const updated = await updateProfile(user, { name: trimmedName, username, ...draft })
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
            <PrefixInput
              prefix="@"
              id="ep-username"
              value={username}
              onChange={(e) => {
                setUsername(normalizeUsername(e.target.value))
                setRejected('')
              }}
              disabled={locked}
              invalid={feedback?.tone === 'bad'}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-describedby="ep-username-status"
            />

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

          <SectionTitle>Tentang</SectionTitle>
          <Field label="Bio (opsional)" htmlFor="ep-bio" error={bioError}>
            <Textarea
              id="ep-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan sedikit tentang dirimu..."
              aria-invalid={Boolean(bioError)}
            />
            <p
              className={`mt-1 text-right text-[10.5px] ${
                bioError ? 'font-semibold text-warn' : 'text-mute'
              }`}
            >
              {bio.length}/{BIO_MAX}
            </p>
          </Field>

          <SectionTitle>Tautan</SectionTitle>
          <LinkField
            id="ep-tiktok"
            label="TikTok"
            show={display.tiktok}
            onShow={setShow('tiktok')}
            canShow={socials.tiktok !== ''}
            error={tiktokError}
          >
            <PrefixInput
              prefix="@"
              id="ep-tiktok"
              value={socials.tiktok}
              onChange={setSocial('tiktok', normalizeUsername)}
              placeholder="username"
              invalid={Boolean(tiktokError)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
          </LinkField>

          <LinkField
            id="ep-instagram"
            label="Instagram"
            show={display.instagram}
            onShow={setShow('instagram')}
            canShow={socials.instagram !== ''}
            error={instagramError}
          >
            <PrefixInput
              prefix="@"
              id="ep-instagram"
              value={socials.instagram}
              onChange={setSocial('instagram', normalizeUsername)}
              placeholder="username"
              invalid={Boolean(instagramError)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
          </LinkField>

          <LinkField
            id="ep-website"
            label="Link Bebas"
            show={display.website}
            onShow={setShow('website')}
            canShow={socials.website.trim() !== ''}
            error={website.error}
            hint="Boleh tanpa https://, akan ditambahkan otomatis saat disimpan"
          >
            <Input
              id="ep-website"
              inputMode="url"
              value={socials.website}
              onChange={setSocial('website')}
              placeholder="contoh.com"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={Boolean(website.error)}
            />
          </LinkField>

          <SectionTitle>Tampilan Profil</SectionTitle>
          <ToggleRow
            title="Bergabung sejak"
            description="Bulan dan tahun kamu mendaftar"
            checked={display.joinedSince}
            onChange={setShow('joinedSince')}
          />
          <ToggleRow
            title="Statistik tambahan"
            description="Total pendakian dan hari di gunung"
            checked={display.extraStats}
            onChange={setShow('extraStats')}
          />
          <ToggleRow
            title="Lencana"
            description="Dihitung otomatis dari logbook-mu"
            checked={display.badges}
            onChange={setShow('badges')}
          />

          {submitError && <p className="mt-3 text-xs font-semibold text-warn">{submitError}</p>}
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