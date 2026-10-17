import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import DesktopNav from './DesktopNav'
import BottomNav from './BottomNav'
import { useAuth } from '../../context/AuthContext'

export default function UserLayout() {
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

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
      <main className="page-container pb-[74px] md:pb-12">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
