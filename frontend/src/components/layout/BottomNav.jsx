import { NavLink } from 'react-router-dom'
import { BookOpen, House, ListChecks, Search, User } from 'lucide-react'

const items = [
  { to: '/', label: 'Beranda', icon: House, end: true },
  { to: '/checklist', label: 'Checklist', icon: ListChecks },
  { to: '/search', label: 'Cari', icon: Search },
  { to: '/logbook', label: 'Logbook', icon: BookOpen },
  { to: '/profile', label: 'Profil', icon: User },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-[74px] items-center justify-around border-t border-line bg-paper pb-2.5 md:hidden">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10.5px] font-medium ${
              isActive ? 'text-pine' : 'text-mute'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}