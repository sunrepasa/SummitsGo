import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import DesktopNav from './DesktopNav'
import BottomNav from './BottomNav'
import { useAuth } from '../../context/AuthContext'

// Halaman utama (tab di nav bawah). Halaman lain, seperti detail atau pengaturan, punya tombol kembali
// sendiri dan tampil penuh tanpa nav bawah.
const MAIN_PATHS = new Set(['/', '/checklist', '/search', '/logbook', '/profile'])

export default function UserLayout() {
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isMainPage = MAIN_PATHS.has(location.pathname.replace(/(.)\/$/, '$1'))

  // penanda dari useSignOut: logout dijalankan setelah pindah halaman, lalu penanda dibersihkan
  // supaya tidak berulang saat refresh
  useEffect(() => {
    if (!location.state?.signOut) return
    logout()
    navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, logout, navigate])

  return (
    <div className="min-h-screen bg-stone">
      <DesktopNav />
      <main className={`page-container md:pb-12 ${isMainPage ? 'pb-[74px]' : ''}`}>
        <Outlet />
      </main>
      {isMainPage && <BottomNav />}
    </div>
  )
}
