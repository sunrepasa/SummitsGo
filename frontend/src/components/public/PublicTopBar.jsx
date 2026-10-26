import { ArrowLeft } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import Logo from '../ui/Logo'
import { useAuth } from '../../context/AuthContext'

// bilah atas mobile untuk halaman yang sering dibuka dari tautan bagikan: kembali, merek, masuk/avatar
export default function PublicTopBar({ onBack }) {
  const { isLoggedIn, user } = useAuth()
  const location = useLocation()

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-stone px-5 pb-3 pt-4 md:hidden">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali"
          className="flex size-8 items-center justify-center rounded-full border border-line bg-paper"
        >
          <ArrowLeft size={15} />
        </button>
        <Link to="/" className="flex items-center gap-2 font-heading text-[15px] font-bold">
          <Logo size={28} />
          SummitsGo
        </Link>
      </div>

      {isLoggedIn ? (
        <Link to="/profile" aria-label="Profilku">
          <Avatar name={user.name} size={32} />
        </Link>
      ) : (
        <Link
          to="/login"
          state={{ from: location.pathname }}
          className="rounded-full bg-pine px-3.5 py-[7px] text-xs font-semibold text-white"
        >
          Masuk
        </Link>
      )}
    </header>
  )
}
