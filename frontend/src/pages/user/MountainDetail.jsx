import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MountainSnow } from 'lucide-react'
import ActionBar from '../../components/mountain/detail/ActionBar'
import DetailHero from '../../components/mountain/detail/DetailHero'
import DetailSkeleton from '../../components/mountain/detail/DetailSkeleton'
import MapCard from '../../components/mountain/detail/MapCard'
import ReviewModal from '../../components/mountain/detail/ReviewModal'
import ReviewsSection from '../../components/mountain/detail/ReviewsSection'
import RoutesSection from '../../components/mountain/detail/RoutesSection'
import {
  ActiveClimbers,
  Description,
  EmergencyContacts,
  Facilities,
  HikingInfo,
  StatsBlock,
  VolcanoStatus,
  Weather,
} from '../../components/mountain/detail/DetailInfo'
import CreateChecklistModal from '../../components/checklist/CreateChecklistModal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getMountainById } from '../../api/mountain'
import { getMountainReviews } from '../../api/review'
import { isMountainSaved, setMountainSaved } from '../../api/savedMountain'
import { getMountainWeather } from '../../api/weather'
import { useAsync } from '../../hooks/useAsync'

function NotFound({ notFound, onRetry }) {
  return (
    <div className="px-[30px] py-24 text-center text-mute">
      <MountainSnow size={42} strokeWidth={1.5} className="mx-auto mb-3" />
      <h1 className="mb-1.5 font-heading text-base text-ink md:text-lg">
        {notFound ? 'Gunung tidak ditemukan' : 'Gagal memuat detail gunung'}
      </h1>
      <p className="mb-4 text-xs md:text-[13px]">
        {notFound ? 'Alamat yang kamu buka tidak cocok dengan gunung mana pun.' : 'Periksa koneksi lalu coba lagi.'}
      </p>
      {notFound ? (
        <Link to="/search" className="rounded-full bg-pine px-5 py-2.5 text-[13px] font-semibold text-white">
          Cari Gunung
        </Link>
      ) : (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-pine px-5 py-2.5 text-[13px] font-semibold text-white"
        >
          Coba Lagi
        </button>
      )}
    </div>
  )
}

function DetailContent({ mountain: m }) {
  const { isLoggedIn } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [selectedRoute, setSelectedRoute] = useState(null)
  const [reviewing, setReviewing] = useState(false)
  const [creatingChecklist, setCreatingChecklist] = useState(false)
  const [saving, setSaving] = useState(false)
  // null = belum ditoggle di halaman ini, pakai nilai dari server
  const [savedOverride, setSavedOverride] = useState(null)

  const weather = useAsync(() => getMountainWeather(m.id), [m.id])
  const reviews = useAsync(() => getMountainReviews(m.id), [m.id])
  const savedState = useAsync(() => (isLoggedIn ? isMountainSaved(m.id) : Promise.resolve(false)), [m.id, isLoggedIn])

  const saved = savedOverride ?? Boolean(savedState.data)
  const activeRoute = m.routes.find((r) => r.name === selectedRoute) ?? m.routes[0]

  const toLogin = () => navigate('/login', { state: { from: `/mountain/${m.id}` } })
  const requireLogin = (action) => () => (isLoggedIn ? action() : toLogin())

  const toggleSave = async () => {
    const next = !saved
    setSaving(true)
    try {
      await setMountainSaved(m.id, next)
      setSavedOverride(next)
      toast.success(next ? 'Gunung disimpan' : 'Dihapus dari gunung tersimpan')
    } catch {
      toast.error('Gagal menyimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const comingSoon = () => toast.success('Segera hadir: peta offline dan Live Location')

  const map = (className) => (
    <MapCard
      routes={m.routes}
      activeRoute={activeRoute}
      onSelectRoute={setSelectedRoute}
      onDownload={comingSoon}
      onLive={comingSoon}
      className={className}
    />
  )

  const actions = {
    saved,
    saving,
    onToggleSave: requireLogin(toggleSave),
    onChecklist: requireLogin(() => setCreatingChecklist(true)),
  }

  return (
    <>
      <DetailHero mountain={m} />

      <div className="pb-[90px] md:grid md:grid-cols-[minmax(0,1fr)_340px] md:items-start md:gap-6 md:pb-12">
        <div className="md:flex md:flex-col md:gap-[18px]">
          <StatsBlock mountain={m} />
          <ActiveClimbers count={m.activeClimbers} />
          <VolcanoStatus volcano={m.volcano} />
          <div className="md:hidden">{map()}</div>
          <Description text={m.description} />
          <RoutesSection routes={m.routes} />
          <Weather state={weather} />
          <HikingInfo info={m.hikingInfo} hasBasecamp={m.routes.some((r) => r.basecamp)} />
          <EmergencyContacts contacts={m.emergency} />
          <Facilities routes={m.routes} />
          <ReviewsSection mountain={m} state={reviews} onWrite={requireLogin(() => setReviewing(true))} />
        </div>

        <aside className="hidden md:sticky md:top-[88px] md:flex md:flex-col md:gap-4">
          {map()}
          <ActionBar variant="inline" {...actions} />
        </aside>
      </div>

      <ActionBar variant="bar" {...actions} />

      {reviewing && (
        <ReviewModal
          mountain={m}
          onClose={() => setReviewing(false)}
          onSaved={() => {
            setReviewing(false)
            reviews.reload()
            toast.success('Ulasan terkirim')
          }}
        />
      )}
      {creatingChecklist && (
        <CreateChecklistModal
          initialMountainId={m.id}
          onClose={() => setCreatingChecklist(false)}
          onSaved={() => {
            setCreatingChecklist(false)
            toast.success('Checklist berhasil dibuat')
            navigate('/checklist')
          }}
        />
      )}
    </>
  )
}

export default function MountainDetail() {
  const { id } = useParams()
  const { data, error, loading, reload } = useAsync(() => getMountainById(id), [id])

  if (loading) return <DetailSkeleton />
  if (error) return <NotFound notFound={error.status === 404} onRetry={reload} />
  // key = id supaya state lokal (jalur terpilih, status simpan) reset saat pindah gunung
  return <DetailContent key={data.id} mountain={data} />
}
