import { BookOpen, Lock, SearchX, Share2, TriangleAlert } from 'lucide-react'
import { useParams } from 'react-router-dom'
import BackTopBar from '../../components/layout/BackTopBar'
import ProfileCard from '../../components/profile/ProfileCard'
import LoginToLikeDialog from '../../components/public/LoginToLikeDialog'
import PublicEntryCard from '../../components/public/PublicEntryCard'
import StateScreen from '../../components/public/StateScreen'
import { LogbookFeedCardSkeleton } from '../../components/logbook/LogbookFeedCard'
import { useToast } from '../../context/ToastContext'
import { getPublicProfile } from '../../api/publicProfile'
import { useAsync } from '../../hooks/useAsync'
import { useBack } from '../../hooks/useBack'
import { usePublicLikes } from '../../hooks/usePublicLikes'
import { copyText, publicProfileUrl } from '../../utils/clipboard'
import { getLogbookStats } from '../../utils/logbookStats'

const feedGrid = 'grid gap-3 md:gap-[18px] lg:grid-cols-2 xl:grid-cols-3'
const layout =
  'px-5 pb-6 pt-4 md:grid md:grid-cols-[300px_1fr] md:items-start md:gap-8 md:px-0 md:pt-7 lg:grid-cols-[360px_1fr]'

function ProfileSkeleton() {
  return (
    <div className={`${layout} animate-pulse`} aria-busy="true" aria-label="Memuat profil">
      <div className="h-[210px] rounded-[18px] bg-line md:h-[380px]" />
      <div className={`mt-4 md:mt-0 ${feedGrid}`}>
        <LogbookFeedCardSkeleton />
        <LogbookFeedCardSkeleton />
      </div>
    </div>
  )
}

function ProfileContent({ username }) {
  const toast = useToast()
  const goBack = useBack('/')
  const likes = usePublicLikes()
  const { data, error, loading, reload } = useAsync(() => getPublicProfile(username), [username])

  const share = async () => {
    const ok = await copyText(publicProfileUrl(username))
    if (ok) toast.success('Tautan profil disalin')
    else toast.error('Gagal menyalin tautan. Salin dari bilah alamat browser.')
  }

  const topBar = (right) => <BackTopBar onBack={goBack} title="Profil" right={right} />

  if (loading) {
    return (
      <>
        {topBar(null)}
        <ProfileSkeleton />
      </>
    )
  }

  if (error) {
    const isPrivate = error.code === 'PROFILE_PRIVATE' || error.status === 403
    const notFound = error.status === 404

    return (
      <>
        {topBar(null)}
        {isPrivate ? (
          <StateScreen
            icon={Lock}
            title="Profil ini bersifat privat"
            text="Pemilik profil belum mengaktifkan Profil Publik."
          />
        ) : notFound ? (
          <StateScreen
            icon={SearchX}
            title="Profil tidak ditemukan"
            text={`Tidak ada pengguna dengan username @${username}.`}
          />
        ) : (
          <StateScreen
            icon={TriangleAlert}
            title="Gagal memuat profil"
            text="Periksa koneksi lalu coba lagi."
            action={
              <button
                type="button"
                onClick={reload}
                className="rounded-full bg-pine px-5 py-2.5 text-[13px] font-semibold text-white"
              >
                Coba Lagi
              </button>
            }
          />
        )}
      </>
    )
  }

  const { user, entries } = data
  const stats = getLogbookStats(entries)

  return (
    <>
      {topBar(
        <button
          type="button"
          onClick={share}
          aria-label="Bagikan profil"
          className="flex size-8 items-center justify-center rounded-full border border-line bg-paper"
        >
          <Share2 size={15} />
        </button>,
      )}

      <div className={layout}>
        <div className="md:sticky md:top-[86px]">
          <ProfileCard user={user} stats={stats} onShare={share} />
        </div>

        <section>
          <h2 className="pb-2.5 pt-4 font-heading text-[14.5px] font-bold md:pt-0 md:text-lg">Logbook</h2>

          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-paper px-5 py-10 text-center text-mute">
              <BookOpen size={34} strokeWidth={1.5} className="mx-auto mb-2.5" />
              <h3 className="mb-1 font-heading text-[14px] text-ink">Belum ada logbook yang ditampilkan</h3>
              <p className="text-xs">{user.name} belum membagikan pendakian apa pun.</p>
            </div>
          ) : (
            <>
              <div className={feedGrid}>
                {entries.map((entry) => (
                  <PublicEntryCard
                    key={entry.slug}
                    entry={entry}
                    like={likes.stateOf(entry)}
                    onToggleLike={() => likes.toggle(entry)}
                  />
                ))}
              </div>
              <p className="mt-4 text-center text-[10.5px] text-mute md:text-left md:text-xs">
                Hanya menampilkan logbook yang dipilih <b>{user.name}</b> untuk profil publik.
              </p>
            </>
          )}
        </section>
      </div>

      {likes.needLogin && <LoginToLikeDialog onClose={likes.closeLogin} />}
    </>
  )
}

// halaman ini bisa dibuka tanpa login (guest); key memastikan state dibuang saat berpindah profil
export default function PublicProfile() {
  const { username } = useParams()
  return <ProfileContent key={username} username={username} />
}
