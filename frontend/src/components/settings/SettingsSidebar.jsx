import { LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SECTION_GROUPS } from './sections'

// menu samping desktop; di mobile diganti SettingsMenu
export default function SettingsSidebar({ current, onLogout }) {
  return (
    <nav aria-label="Pengaturan" className="hidden md:block">
      <div className="rounded-[18px] border border-line bg-paper p-2.5">
        {SECTION_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-1.5 pt-3.5 text-[10.5px] font-bold uppercase tracking-[.04em] text-mute first:pt-1.5">
              {group.label}
            </div>
            {group.items.map(({ id, label, icon: Icon }) => (
              <Link
                key={id}
                to={`/settings/${id}`}
                aria-current={current === id ? 'page' : undefined}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium ${
                  current === id ? 'bg-pine text-white' : 'text-ink hover:bg-stone'
                }`}
              >
                <Icon size={16} className={current === id ? 'text-white' : 'text-mute'} />
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[14px] border border-line bg-paper py-3 text-[13px] font-semibold text-warn hover:bg-warnbg"
      >
        <LogOut size={15} />
        Keluar
      </button>
    </nav>
  )
}
