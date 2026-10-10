import { BookOpen, ListChecks, Star, User } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import GuestPrompt from '../../components/auth/GuestPrompt'
import { useAuth } from '../../context/AuthContext'

const perks = [
  { icon: ListChecks, label: 'Checklist tersimpan' },
  { icon: BookOpen, label: 'Catat logbook' },
  { icon: Star, label: 'Tulis ulasan' },
]

function ProfileGuest() {
  return (
    <GuestPrompt
      icon={User}
      title="Kamu belum masuk"
      description="Login untuk menyimpan checklist, mencatat logbook, menulis ulasan, dan mengakses fitur lainnya."
      perks={perks}
    />
  )
}

// sementara — diganti tampilan Profil (login) saat langkah berikutnya
function ProfileLoggedIn() {
  const { user, logout } = useAuth()

  return (
    <div className="px-5 pt-6 text-[13px] text-mute md:px-0">
      <p>
        Masuk sebagai {user.name} (@{user.username})
      </p>
      <button
        type="button"
        onClick={logout}
        className="mt-4 rounded-full border border-line bg-paper px-5 py-2.5 font-semibold text-warn"
      >
        Keluar
      </button>
    </div>
  )
}

export default function Profile() {
  const { isLoggedIn } = useAuth()

  return (
    <>
      <TopBar title="Profil" />
      {isLoggedIn ? <ProfileLoggedIn /> : <ProfileGuest />}
    </>
  )
}