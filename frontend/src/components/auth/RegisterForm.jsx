import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Field, Input, PrefixInput } from '../ui/FormControls'
import { FormError, SubmitButton, SwitchPrompt } from './AuthParts'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { registerRequest } from '../../api/auth'
import { useUsernameCheck } from '../../hooks/useUsernameCheck'
import { normalizeUsername, validateUsername } from '../../utils/username'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_MAX = 50
const PASSWORD_MIN = 8
const DEFAULT_HINT = 'Huruf kecil, angka, titik, garis bawah, dan strip. Tanpa spasi.'

const tones = {
  ok: 'font-semibold text-leaf-deep',
  bad: 'font-semibold text-warn',
  mute: 'text-mute',
}

function UsernameFeedback({ feedback, onRetry }) {
  const Icon = feedback.icon === 'check' ? Check : feedback.icon === 'x' ? X : null

  return (
    <p
      id="reg-username-status"
      aria-live="polite"
      className={`mt-1.5 flex items-center gap-1 text-[11px] ${tones[feedback.tone]}`}
    >
      {feedback.icon === 'spinner' ? (
        <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        Icon && <Icon size={12} strokeWidth={3} />
      )}
      {feedback.text}
      {feedback.retry && (
        <button type="button" onClick={onRetry} className="ml-1 underline">
          Coba lagi
        </button>
      )}
    </p>
  )
}

export default function RegisterForm({ onSwitch }) {
  const { login } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [showErrors, setShowErrors] = useState(false)
  // nilai yang ditolak server saat mendaftar (misalnya baru saja diambil orang lain)
  const [rejected, setRejected] = useState({ username: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { username } = form
  const name = form.name.trim()
  const email = form.email.trim()

  const formatError = username ? validateUsername(username) : ''
  const check = useUsernameCheck(username, !username || Boolean(formatError))
  const status = username && rejected.username === username ? 'taken' : check.status
  const usernameOk = Boolean(username) && !formatError && status === 'available'

  const emailRejected = email !== '' && rejected.email === email.toLowerCase()
  const problems = {
    name: !name ? 'Nama lengkap wajib diisi' : name.length > NAME_MAX ? `Maksimal ${NAME_MAX} karakter` : '',
    email: !email
      ? 'Email wajib diisi'
      : !EMAIL_PATTERN.test(email)
        ? 'Format email tidak valid'
        : emailRejected
          ? 'Email sudah terdaftar'
          : '',
    password: !form.password
      ? 'Kata sandi wajib diisi'
      : form.password.length < PASSWORD_MIN
        ? `Minimal ${PASSWORD_MIN} karakter`
        : '',
  }
  const errors = showErrors || emailRejected ? problems : {}
  const hasProblems = Object.values(problems).some(Boolean)

  let feedback
  if (!username) {
    feedback = showErrors
      ? { tone: 'bad', icon: 'x', text: 'Username wajib diisi' }
      : { tone: 'mute', text: DEFAULT_HINT }
  } else if (formatError) {
    feedback = { tone: 'bad', icon: 'x', text: formatError }
  } else if (status === 'checking') {
    feedback = { tone: 'mute', icon: 'spinner', text: 'Memeriksa...' }
  } else if (status === 'available') {
    feedback = { tone: 'ok', icon: 'check', text: 'Username tersedia' }
  } else if (status === 'taken') {
    feedback = { tone: 'bad', icon: 'x', text: 'Username sudah dipakai' }
  } else {
    feedback = { tone: 'bad', icon: 'x', text: 'Gagal memeriksa username.', retry: true }
  }

  const set = (key, transform = (v) => v) => (e) =>
    setForm((f) => ({ ...f, [key]: transform(e.target.value) }))

  const submit = async (e) => {
    e.preventDefault()
    setShowErrors(true)
    if (hasProblems || !usernameOk) return

    setSaving(true)
    setSubmitError('')
    try {
      const session = await registerRequest({ name, username, email, password: form.password })
      login(session)
      toast.success('Akun berhasil dibuat. Selamat datang!')
    } catch (err) {
      setSaving(false)
      if (err.code === 'USERNAME_TAKEN') setRejected((r) => ({ ...r, username }))
      else if (err.code === 'EMAIL_TAKEN') setRejected((r) => ({ ...r, email: email.toLowerCase() }))
      else setSubmitError('Gagal membuat akun. Coba lagi.')
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <Field label="Nama Lengkap" htmlFor="reg-name" error={errors.name}>
        <Input
          id="reg-name"
          value={form.name}
          onChange={set('name')}
          placeholder="Nama kamu"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
        />
      </Field>

      <Field label="Username" htmlFor="reg-username">
        <PrefixInput
          prefix="@"
          id="reg-username"
          value={form.username}
          onChange={set('username', normalizeUsername)}
          placeholder="username"
          invalid={feedback.tone === 'bad'}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-describedby="reg-username-status"
        />
        <UsernameFeedback feedback={feedback} onRetry={check.retry} />
      </Field>

      <Field label="Email" htmlFor="reg-email" error={errors.email}>
        <Input
          id="reg-email"
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="nama@email.com"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={Boolean(errors.email)}
        />
      </Field>

      <Field label="Kata Sandi" htmlFor="reg-password" error={errors.password}>
        <Input
          id="reg-password"
          type="password"
          value={form.password}
          onChange={set('password')}
          placeholder={`Minimal ${PASSWORD_MIN} karakter`}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
        />
      </Field>

      <div className="mt-1.5">
        <FormError message={submitError} />
        <SubmitButton busy={saving} busyLabel="Mendaftar..." disabled={status === 'checking'}>
          Daftar Akun
        </SubmitButton>
      </div>
      <SwitchPrompt text="Sudah punya akun?" action="Masuk di sini" onClick={onSwitch} />
    </form>
  )
}