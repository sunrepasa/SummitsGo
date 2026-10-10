import { useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  Map as MapIcon,
  Mountain,
  Search,
  Settings,
  User,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDismiss } from '../../hooks/useDismiss'
import Avatar from '../ui/Avatar'

const menu = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/checklist', label: 'Checklist' },
  { to: '/logbook', label: 'Logbook' },
]

const iconBtn =
  'flex size-9 items-center justify-center rounded-full border border-line bg-paper text-ink hover:bg-stone'

function SearchBox() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')

  const onSubmit = (e) => {
    e.preventDefault()
    const q = query.trim()
    const next = new URLSearchParams(pathname === '/search' ? params : undefined)
    if (q) next.set('q', q)
    else next.delete('q')
    navigate({ pathname: '/search', search: next.toString() })
  }

  return (
    <form
      onSubmit={onSubmit}
      className="hidden w-[200px] items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2.5 focus-within:border-pine lg:flex xl:w-[320px] 2xl:w-[300px]"
    >
      <Search size={16} className="shrink-0 text-mute" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Cari gunung"
        placeholder="Cari gunung atau lokasi..."
        className="w-full min-w-0 bg-transparent text-[12.5px] outline-none placeholder:text-mute"
      />
    </form>
  )
}

function GuestActions() {
  return (
    <>
      <Link
        to="/login"
        className="rounded-full border border-line bg-paper px-[18px] py-[9px] text-[13px] font-semibold"
      >
        Masuk
      </Link>
      <Link
        to="/register"
        className="rounded-full bg-pine px-[18px] py-[9px] text-[13px] font-semibold text-white"
      >
        Daftar
      </Link>
    </>
  )
}

function UserMenu({ user }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismiss(ref, open, () => setOpen(false))

  const items = [
    { to: '/profile', label: 'Profil', icon: User },
    { to: '/dashboard', label: 'Dashboard Saya', icon: LayoutDashboard },
    { to: '/settings', label: 'Pengaturan & Privasi', icon: Settings },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-line bg-paper py-[3px] pl-[3px] pr-2.5"
      >
        <Avatar name={user.name} size={30} />
        <span className="text-[12.5px] font-semibold">{user.name}</span>
        <ChevronDown size={14} className="text-mute" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[46px] z-40 w-[210px] rounded-2xl border border-line bg-paper p-1.5 shadow-lg"
        >
          {items.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-[13px] hover:bg-stone"
            >
              <Icon size={16} className="text-mute" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DesktopNav() {
  const { user, isLoggedIn } = useAuth()

  return (
    <header className="sticky top-0 z-30 hidden border-b border-line bg-stone md:block">
      {/* 2xl: tiga kolom supaya menu tepat di tengah; di bawahnya menu menempel ke logo karena ruang kanan tidak cukup */}
      <div className="page-container flex items-center gap-4 py-3.5 2xl:grid 2xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Link to="/" className="flex w-fit items-center gap-[9px]">
          <span className="flex size-8 items-center justify-center rounded-[9px] bg-pine text-white">
            <Mountain size={18} />
          </span>
          <span className="hidden font-heading text-lg font-bold lg:inline">SummitsGo</span>
        </Link>

        <nav className="flex gap-1.5">
          {menu.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-[13px] ${
                  isActive
                    ? 'bg-[#E3EEE6] font-semibold text-pine-deep'
                    : 'font-medium text-mute hover:text-ink'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5 2xl:ml-0 2xl:min-w-0 2xl:justify-end">
          <SearchBox />
          <Link to="/search" className={`${iconBtn} lg:hidden`} aria-label="Cari gunung">
            <Search size={17} />
          </Link>
          <Link to="/saved-maps" className={iconBtn} aria-label="Peta Tersimpan" title="Peta Tersimpan">
            <MapIcon size={17} />
          </Link>
          <button type="button" className={iconBtn} aria-label="Notifikasi">
            <Bell size={17} />
          </button>
          {isLoggedIn ? <UserMenu user={user} /> : <GuestActions />}
        </div>
      </div>
    </header>
  )
}