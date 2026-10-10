import { Outlet } from 'react-router-dom'
import DesktopNav from './DesktopNav'
import BottomNav from './BottomNav'

export default function UserLayout() {
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