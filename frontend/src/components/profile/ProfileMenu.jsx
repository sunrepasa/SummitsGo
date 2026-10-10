import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Menu, Settings } from 'lucide-react'
import { useDismiss } from '../../hooks/useDismiss'

const items = [
  { to: '/settings', label: 'Pengaturan & Privasi', icon: Settings },
  { to: '/dashboard', label: 'Dashboard Saya', icon: LayoutDashboard },
]

export default function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismiss(ref, open, () => setOpen(false))

  return (
    <div ref={ref} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex size-[34px] items-center justify-center rounded-full border border-line bg-paper"
      >
        <Menu size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[42px] z-20 w-[210px] rounded-[14px] border border-line bg-paper p-1.5 shadow-lg"
        >
          {items.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-[9px] rounded-[9px] px-2.5 py-2.5 text-[12.5px] hover:bg-stone"
            >
              <Icon size={15} className="text-mute" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}