import { useState } from 'react'
import { Field, Input } from '../ui/FormControls'
import { FormError, SubmitButton, SwitchPrompt } from './AuthParts'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { loginRequest } from '../../api/auth'

export default function LoginForm({ onSwitch }) {
  const { login } = useAuth()
  const toast = useToast()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const problems = {
    identifier: identifier.trim() ? '' : 'Isi username atau email',
    password: password ? '' : 'Isi kata sandi',
  }
  const errors = showErrors ? problems : {}

  const submit = async (e) => {
    e.preventDefault()
    setShowErrors(true)
    if (problems.identifier || problems.password) return

    setSaving(true)
    setSubmitError('')
    try {
      const session = await loginRequest({ identifier, password })
      login(session)
      toast.success(`Selamat datang, ${session.user.name}`)
    } catch (err) {
      setSaving(false)
      setSubmitError(
        err.code === 'INVALID_CREDENTIALS'
          ? 'Username/email atau kata sandi salah'
          : 'Gagal masuk. Coba lagi.',
      )
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <Field label="Username atau Email" htmlFor="login-identifier" error={errors.identifier}>
        <Input
          id="login-identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="username atau nama@email.com"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={Boolean(errors.identifier)}
        />
      </Field>

      <Field label="Kata Sandi" htmlFor="login-password" error={errors.password}>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
        />
      </Field>

      {/* belum berfungsi: alur reset kata sandi belum masuk daftar fitur */}
      <div className="-mt-1 mb-4 text-right md:mb-5">
        <button type="button" className="text-[11px] font-semibold text-pine-deep md:text-[12.5px]">
          Lupa kata sandi?
        </button>
      </div>

      <FormError message={submitError} />
      <SubmitButton busy={saving} busyLabel="Masuk...">
        Masuk
      </SubmitButton>
      <SwitchPrompt text="Belum punya akun?" action="Daftar di sini" onClick={onSwitch} />
    </form>
  )
}