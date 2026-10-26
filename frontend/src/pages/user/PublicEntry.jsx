import { Mountain, TriangleAlert } from 'lucide-react'
import { useParams } from 'react-router-dom'
import EntryStats from '../../components/logbook/detail/EntryStats'
import LikeButton from '../../components/logbook/detail/LikeButton'
import LoginToLikeDialog from '../../components/public/LoginToLikeDialog'
import PublicEntryHero from '../../components/public/PublicEntryHero'
import PublicPhotos from '../../components/public/PublicPhotos'
import { CrewSection, OwnerSection } from '../../components/public/PublicPeople'
import PublicTopBar from '../../components/public/PublicTopBar'
import StateScreen from '../../components/public/StateScreen'
import { getPublicEntry } from '../../api/publicProfile'
import { useAsync } from '../../hooks/useAsync'
import { useBack } from '../../hooks/useBack'
import { usePublicLikes } from '../../hooks/usePublicLikes'

const twoColumns = 'md:grid md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-6'

function EntrySkeleton() {
  return (
    <div className="animate-pulse md:pt-[22px]" aria-busy="true" aria-label="Memuat entri">
      <div className="h-[150px] bg-line md:mb-[22px] md:h-[230px] md:rounded-[22px]" />
      <div className={`space-y-3 px-5 pt-4 md:space-y-0 md:px-0 md:pt-0 ${twoColumns}`}>
        <div className="space-y-3">
          <div className="h-14 rounded-2xl bg-line" />
          <div className="h-[130px] rounded-2xl bg-line" />
        </div>
        <div className="hidden h-[200px] rounded-[18px] bg-line md:block" />
      </div>
    </div>
  )
}

function EntryContent({ slug }) {
  const goBack = useBack('/')
  const likes = usePublicLikes()
  const { data: entry, error, loading, reload } = useAsync(() => getPublicEntry(slug), [slug])

  const topBar = <PublicTopBar onBack={goBack} />

  if (loading) {
    return (
      <>
        {topBar}
        <EntrySkeleton />
      </>
    )
  }

  if (error) {
    const unavailable = error.status === 404
    return (
      <>
        {topBar}
        {unavailable ? (
          <StateScreen
            icon={Mountain}
            title="Entri tidak tersedia"
            text="Entri ini bersifat privat atau sudah dihapus oleh pemiliknya."
          />
        ) : (
          <StateScreen
            icon={TriangleAlert}
            title="Gagal memuat entri"
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

  const like = likes.stateOf(entry)
  const toggleLike = () => likes.toggle(entry)
  const hasCrew = entry.crew.length > 0

  return (
    <>
      {topBar}
      <PublicEntryHero mountain={entry.mountain} route={entry.route} verified={entry.verified} />

      <div className={`pb-6 md:pb-12 ${twoColumns}`}>
        <div className="min-w-0 md:flex md:flex-col md:gap-[18px]">
          <div className="border-b border-line px-5 py-3 md:hidden">
            <LikeButton liked={like.liked} count={like.count} onToggle={toggleLike} />
          </div>

          <EntryStats entry={entry} />
          <PublicPhotos photos={entry.photos} />
          <OwnerSection owner={entry.owner} variant="mobile" />
          {hasCrew && <CrewSection crew={entry.crew} variant="mobile" />}
        </div>

        <aside className="hidden md:sticky md:top-[88px] md:flex md:flex-col md:gap-4">
          <LikeButton variant="card" liked={like.liked} count={like.count} onToggle={toggleLike} />
          <OwnerSection owner={entry.owner} variant="desktop" />
          {hasCrew && <CrewSection crew={entry.crew} variant="desktop" />}
        </aside>
      </div>

      {likes.needLogin && <LoginToLikeDialog onClose={likes.closeLogin} />}
    </>
  )
}

// halaman ini bisa dibuka tanpa login (guest); key memastikan state dibuang saat berpindah entri
export default function PublicEntry() {
  const { slug } = useParams()
  return <EntryContent key={slug} slug={slug} />
}
