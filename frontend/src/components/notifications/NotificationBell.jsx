import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications'

// ikon lonceng dengan titik belum-dibaca; className dari pemanggil menentukan ukuran tombol
export default function NotificationBell({ className, size = 17 }) {
  const unread = useUnreadNotifications()

  return (
    <Link
      to="/notifications"
      className={`relative ${className}`}
      aria-label={unread ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'}
      title="Notifikasi"
    >
      <Bell size={size} />
      {unread > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-[8px] top-[7px] size-[9px] rounded-full border-2 border-paper bg-warn"
        />
      )}
    </Link>
  )
}
