import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, ListChecks, Star } from 'lucide-react'
import Logo from '../../components/ui/Logo'
import LoginForm from '../../components/auth/LoginForm'
import RegisterForm from '../../components/auth/RegisterForm'
import { useAuth } from '../../context/AuthContext'
import { homeFor } from '../../utils/auth'

const perks = [
  { icon: ListChecks, label: 'Checklist tersimpan' },
  { icon: BookOpen, label: 'Catat logbook' },
  { icon: Star, label: 'Tulis ulasan' },
]

const copy = {
  login: { title: 'Masuk', subtitle: 'Masuk dengan username atau email kamu.' },
  register: { title: 'Buat Akun', subtitle: 'Daftar gratis untuk mulai menyimpan pendakianmu.' },
}

function BrandPanel() {
  return (
    <aside
      className="relative overflow-hidden px-7 pb-[26px] pt-[50px] text-center text-white md:flex md:min-h-screen md:flex-col md:px-14 md:py-12 md:text-left"
      style={{ background: 'linear-gradient(160deg, #24473A 0%, #142822 85%)' }}
    >
      <div
        className="absolute -bottom-10 -right-[30px] size-[150px] rounded-full opacity-35 blur-[6px] md:-bottom-[90px] md:-right-20 md:size-[420px] md:opacity-30 md:blur-[10px]"
        style={{ background: 'conic-gradient(from 210deg, #7FB069, transparent 40%)' }}
      />

      <Link
        to="/"
        aria-label="SummitsGo, ke Beranda"
        className="relative flex flex-col items-center md:flex-row md:gap-[11px]"
      >
        <Logo size={36} tone="glass" className="mb-2 md:mb-0" />
        <span className="hidden font-heading text-xl font-bold md:inline">SummitsGo</span>
      </Link>

      <div className="relative md:my-auto md:max-w-[440px]">
        <h2 className="font-heading text-[19px] font-bold md:text-[38px] md:leading-[1.18]">
          Selamat Datang di SummitsGo
        </h2>
        <p className="mt-1 text-[11.5px] text-[#B9CDC1] md:mt-3.5 md:text-[15px] md:leading-relaxed">
          Masuk untuk menyimpan checklist, logbook, dan ulasanmu.
        </p>

        <ul className="mt-[34px] hidden flex-col gap-3.5 md:flex">
          {perks.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3.5 text-sm">
              <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] bg-white/10">
                <Icon size={17} />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

function Tabs({ mode, onChange }) {
  const tabs = [
    ['login', 'Masuk'],
    ['register', 'Daftar'],
  ]

  return (
    <div role="tablist" className="mb-5 flex rounded-xl border border-line bg-paper p-1 md:mb-6 md:rounded-[13px]">
      {tabs.map(([value, label]) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={mode === value}
          onClick={() => onChange(value)}
          className={`flex-1 rounded-[9px] py-[9px] text-[12.5px] font-semibold md:rounded-[10px] md:py-2.5 md:text-[13.5px] ${
            mode === value ? 'bg-pine text-white' : 'text-mute'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function AuthPage({ mode }) {
  const { isLoggedIn, user } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()

  if (isLoggedIn) return <Navigate to={homeFor(user, state?.from)} replace />

  const { title, subtitle } = copy[mode]
  const switchMode = (next) => navigate(`/${next}`, { replace: true, state })
  const continueAsGuest = () => navigate(homeFor(null, state?.from))

  return (
    <div className="flex min-h-screen flex-col bg-stone md:grid md:grid-cols-2">
      <BrandPanel />

      <main className="flex flex-1 flex-col px-6 pb-5 pt-6 md:items-center md:justify-center md:p-10">
        <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col md:flex-none">
          <h1 className="sr-only font-heading text-[26px] font-bold md:not-sr-only">{title}</h1>
          <p className="mb-[26px] mt-1.5 hidden text-[13.5px] text-mute md:block">{subtitle}</p>

          <Tabs mode={mode} onChange={switchMode} />

          {mode === 'login' ? (
            <LoginForm onSwitch={() => switchMode('register')} />
          ) : (
            <RegisterForm onSwitch={() => switchMode('login')} />
          )}

          <div className="mt-auto pt-3.5 text-center text-[11.5px] text-mute md:mt-[30px] md:border-t md:border-line md:pt-[22px] md:text-[13px]">
            <span className="hidden md:inline">Belum mau masuk? </span>
            <button
              type="button"
              onClick={continueAsGuest}
              className="underline underline-offset-2 md:font-semibold md:text-ink md:underline-offset-[3px]"
            >
              <span className="md:hidden">Lewati dulu, jelajah sebagai tamu →</span>
              <span className="hidden md:inline">Lanjutkan sebagai tamu →</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}