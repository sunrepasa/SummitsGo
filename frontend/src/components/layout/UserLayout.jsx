import { Outlet } from 'react-router-dom'
import DesktopNav from './DesktopNav'
import BottomNav from './BottomNav'

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-stone">
      <DesktopNav />
      <main className="mx-auto w-full max-w-[1100px] pb-[74px] md:px-6 md:pb-12">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}