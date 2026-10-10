import { BookOpen, ListChecks, Star, User } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import GuestPrompt from '../../components/auth/GuestPrompt'
import ProfileCard from '../../components/profile/ProfileCard'
import ProfileMenu from '../../components/profile/ProfileMenu'
import LogbookFeedCard, { LogbookFeedCardSkeleton } from '../../components/logbook/LogbookFeedCard'
import { useAuth } from '../../context/AuthContext'
import { getMyLogbooks } from '../../api/logbook'
import { useAsync } from '../../hooks/useAsync'
import { getLogbookStats } from '../../utils/logbookStats'

const perks = [
  { icon: ListChecks, label: 'Checklist tersimpan' },
  { icon: BookOpen, label: 'Catat logbook' },
  { icon: Star, label: 'Tulis ulasan' },
]

const feedGrid = 'grid gap-3 md:gap-[18px] lg:grid-cols-2 xl:grid-cols-3'

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

function LogbookFeed({ state }) {
  const { data, error, loading } = state

  if (error) {
    return (
      <p className="rounded-xl bg-warnbg px-4 py-3 text-[12.5px] text-warn">
        Gagal memuat logbook. Coba muat ulang halaman.
      </p>
    )
  }
  if (loading) {
    return (
      <div className={feedGrid}>
        {Array.from({ length: 2 }, (_, i) => (
          <LogbookFeedCardSkeleton key={i} />
        ))}
      </div>
    )
  }
  if (data.length === 0) {
    return <p className="py-10 text-center text-xs text-mute">Belum ada entri logbook.</p>
  }
  return (
    <div className={feedGrid}>
      {data.map((entry) => (
        <LogbookFeedCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}

function ProfileLoggedIn() {
  const { user, logout } = useAuth()
  const logbooks = useAsync(getMyLogbooks, [])
  const stats = logbooks.data ? getLogbookStats(logbooks.data) : null

  return (
    <div className="px-5 pb-6 pt-4 md:grid md:grid-cols-[300px_1fr] md:items-start md:gap-8 md:px-0 md:pt-7 lg:grid-cols-[360px_1fr]">
      <div className="md:sticky md:top-[86px]">
        <ProfileCard user={user} stats={stats} />
      </div>

      <section>
        <h2 className="pb-2.5 pt-4 font-heading text-[14.5px] font-bold md:pt-0 md:text-lg">Logbook</h2>
        <LogbookFeed state={logbooks} />

        {/* sementara — pindah ke halaman Pengaturan & Privasi saat halaman itu dibuat */}
        <button
          type="button"
          onClick={logout}
          className="mt-6 rounded-full border border-line bg-paper px-5 py-2.5 text-[13px] font-semibold text-warn"
        >
          Keluar
        </button>
      </section>
    </div>
  )
}

export default function Profile() {
  const { isLoggedIn } = useAuth()

  return (
    <>
      <TopBar title="Profil" right={isLoggedIn ? <ProfileMenu /> : null} />
      {isLoggedIn ? <ProfileLoggedIn /> : <ProfileGuest />}
    </>
  )
}