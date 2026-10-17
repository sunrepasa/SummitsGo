import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import BackTopBar from '../../components/layout/BackTopBar'
import SettingsMenu from '../../components/settings/SettingsMenu'
import SettingsSidebar from '../../components/settings/SettingsSidebar'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { DEFAULT_SECTION, SECTIONS } from '../../components/settings/sections'
import { useAuth } from '../../context/AuthContext'
import { useSignOut } from '../../hooks/useSignOut'

// /settings: mobile menampilkan daftar, desktop langsung membuka panel Informasi Akun.
// /settings/:section: mobile menampilkan satu panel penuh, desktop sidebar + panel.
export default function Settings() {
  const { section } = useParams()
  const { isLoggedIn } = useAuth()
  const location = useLocation()
  const signOut = useSignOut()
  const [confirmingLogout, setConfirmingLogout] = useState(false)

  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (section && !SECTIONS[section]) return <Navigate to="/settings" replace />

  const current = section ?? DEFAULT_SECTION
  const { Pane, title } = SECTIONS[current]

  return (
    <>
      <BackTopBar to={section ? '/settings' : '/profile'} title={section ? title : 'Pengaturan & Privasi'} />

      <div className="px-5 pb-8 md:px-0 md:pb-12">
        <h1 className="hidden pb-5 pt-8 font-heading text-[26px] font-bold md:block">Pengaturan &amp; Privasi</h1>

        <div className="md:grid md:grid-cols-[260px_minmax(0,1fr)] md:items-start md:gap-7">
          <aside className={`${section ? 'hidden' : ''} md:sticky md:top-[88px] md:block`}>
            <SettingsMenu onLogout={() => setConfirmingLogout(true)} />
            <SettingsSidebar current={current} onLogout={() => setConfirmingLogout(true)} />
          </aside>

          <main className={`${section ? 'pt-4' : 'hidden'} min-w-0 md:block md:pt-0`}>
            <Pane />
          </main>
        </div>
      </div>

      {confirmingLogout && (
        <ConfirmDialog
          icon={LogOut}
          title="Keluar dari akunmu?"
          confirmLabel="Ya, Keluar"
          onConfirm={signOut}
          onCancel={() => setConfirmingLogout(false)}
        >
          Kamu perlu masuk lagi untuk membuka checklist, logbook, dan ulasanmu.
        </ConfirmDialog>
      )}
    </>
  )
}