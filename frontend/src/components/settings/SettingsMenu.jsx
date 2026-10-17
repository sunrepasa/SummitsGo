import { ChevronRight, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import Toggle from '../ui/Toggle'
import { APP_VERSION } from './AboutPane'
import { useProfileVisibility } from '../../hooks/useProfileVisibility'

function Group({ label, children }) {
  return (
    <>
      <div className="px-0.5 pb-2 pt-[18px] text-[11px] font-bold uppercase tracking-[.03em] text-mute">{label}</div>
      <div className="overflow-hidden rounded-[14px] border border-line bg-paper">{children}</div>
    </>
  )
}

const rowClass = 'flex items-center justify-between gap-3 border-t border-line px-3.5 py-[13px] first:border-t-0'

function LinkRow({ to, title, sub }) {
  return (
    <Link to={to} className={`${rowClass} hover:bg-stone`}>
      <div>
        <div className="text-[12.5px] font-semibold">{title}</div>
        {sub && <div className="mt-0.5 text-[10.5px] text-mute">{sub}</div>}
      </div>
      <ChevronRight size={16} className="shrink-0 text-mute" />
    </Link>
  )
}

// daftar pengaturan khusus mobile; di desktop diganti SettingsSidebar
export default function SettingsMenu({ onLogout }) {
  const { isPublic, saving, change } = useProfileVisibility()

  return (
    <div className="md:hidden">
      <Group label="Akun">
        <LinkRow to="/settings/account" title="Informasi Akun" sub="Email, username, tanggal bergabung" />
        <LinkRow to="/settings/security" title="Keamanan" sub="Kata sandi" />
      </Group>

      <Group label="Privasi">
        <div className={rowClass}>
          <div>
            <div className="text-[12.5px] font-semibold">Profil Publik</div>
            <div className="mt-0.5 text-[10.5px] text-mute">Orang lain bisa lihat profilmu lewat link</div>
          </div>
          <Toggle checked={isPublic} disabled={saving} onChange={change} label="Profil publik" />
        </div>
        <LinkRow
          to="/settings/public-logbook"
          title="Logbook Ditampilkan Publik"
          sub="Pilih entri yang muncul di profil publik"
        />
      </Group>

      <Group label="Lainnya">
        <LinkRow to="/settings/help" title="Bantuan & Dukungan" />
        <LinkRow to="/settings/about" title="Tentang SummitsGo" />
      </Group>

      <button
        type="button"
        onClick={onLogout}
        className="mt-[22px] flex w-full items-center justify-center gap-2 rounded-[14px] border border-line bg-paper py-[13px] text-[13px] font-semibold text-warn"
      >
        <LogOut size={15} />
        Keluar
      </button>
      <p className="mt-3.5 text-center text-[10.5px] text-mute">SummitsGo · Versi {APP_VERSION}</p>
    </div>
  )
}
