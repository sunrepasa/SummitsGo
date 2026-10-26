import { useState } from 'react'
import { Backpack, ChevronRight, LayoutDashboard, ListChecks, Map as MapIcon, Plus, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import BackTopBar from '../../components/layout/BackTopBar'
import GuestPrompt from '../../components/auth/GuestPrompt'
import CreateChecklistModal from '../../components/checklist/CreateChecklistModal'
import ActiveTripCard from '../../components/dashboard/ActiveTripCard'
import StatCard from '../../components/dashboard/StatCard'
import LogbookListItem, { LogbookListItemSkeleton } from '../../components/logbook/LogbookListItem'
import BadgeMedal from '../../components/ui/BadgeMedal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getMyChecklists } from '../../api/checklist'
import { getMyLogbooks } from '../../api/logbook'
import { useAsync } from '../../hooks/useAsync'
import { getEarnedBadges } from '../../utils/badges'
import { isActiveChecklist, pickActiveTrip } from '../../utils/dashboard'
import { getLogbookStats } from '../../utils/logbookStats'
import { getSavedMaps } from '../../utils/savedMaps'

const RECENT_LOGBOOKS = 3
const perks = [
  { icon: ListChecks, label: 'Checklist tersimpan' },
  { icon: LayoutDashboard, label: 'Ringkasan trip' },
]

function Card({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-line bg-paper p-4 md:rounded-[18px] md:p-[22px] ${className}`}>
      <div className="mb-3 flex items-center justify-between md:mb-3.5">
        <h2 className="font-heading text-[13.5px] font-bold md:text-[17px]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

const seeAll = (to) => (
  <Link to={to} className="text-[11.5px] font-semibold text-leaf-deep md:text-[13px]">
    Lihat Semua ›
  </Link>
)

function Shortcut({ to, onClick, icon: Icon, title, hint }) {
  const body = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F0E1] text-leaf-deep md:size-11">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <b className="block text-[13px] md:text-[14.5px]">{title}</b>
        <span className="block text-[11px] text-mute md:text-xs">{hint}</span>
      </span>
      <ChevronRight size={16} className="shrink-0 text-mute" />
    </>
  )
  const cls =
    'flex w-full items-center gap-3 rounded-[14px] border border-line p-3 text-left md:p-4 md:transition md:hover:-translate-y-0.5 md:hover:shadow-lg'
  return to ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  )
}

function NoTrip({ onCreate }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-paper px-6 py-9 text-center md:rounded-[20px] md:py-11">
      <Backpack size={34} strokeWidth={1.5} className="mx-auto mb-2 text-mute" />
      <h3 className="mb-1.5 font-heading text-[15px] md:text-[17px]">Belum ada trip aktif</h3>
      <p className="mb-4 text-xs text-mute md:text-[13px]">Buat checklist untuk mulai menyiapkan pendakianmu.</p>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center gap-1 rounded-full bg-pine px-[22px] py-2.5 text-[12.5px] font-semibold text-white md:text-[13.5px]"
      >
        <Plus size={14} />
        Buat Checklist Baru
      </button>
    </div>
  )
}

function ErrorNote({ children }) {
  return <p className="rounded-xl bg-warnbg px-4 py-3 text-[12.5px] text-warn">{children}</p>
}

function RecentLogbooks({ state }) {
  const { data, error, loading } = state
  if (error) return <ErrorNote>Gagal memuat logbook.</ErrorNote>
  if (loading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 2 }, (_, i) => (
          <LogbookListItemSkeleton key={i} />
        ))}
      </div>
    )
  }
  if (data.length === 0) return <p className="py-6 text-center text-[13px] text-mute">Belum ada riwayat pendakian.</p>
  return (
    <div className="space-y-2.5">
      {data.slice(0, RECENT_LOGBOOKS).map((entry) => (
        <LogbookListItem key={entry.id} entry={entry} />
      ))}
    </div>
  )
}

function BadgesCard({ stats }) {
  const badges = stats ? getEarnedBadges(stats) : []
  if (badges.length === 0) return null
  return (
    <Card title="Lencana Saya" action={seeAll('/profile')}>
      <ul className="flex flex-wrap gap-3">
        {badges.map((b) => (
          <li key={b.id} className="flex w-[60px] flex-col items-center text-center">
            <BadgeMedal image={b.image} size={52} />
            <span className="mt-1 text-[10.5px] font-semibold">
              {b.name} {b.tierName}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function DashboardLoggedIn() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const checklists = useAsync(getMyChecklists, [])
  const logbooks = useAsync(getMyLogbooks, [])
  const [creating, setCreating] = useState(false)

  const stats = logbooks.data ? getLogbookStats(logbooks.data) : null
  const activeCount = checklists.data?.filter((c) => isActiveChecklist(c)).length
  const trip = checklists.data ? pickActiveTrip(checklists.data) : null
  const savedCount = getSavedMaps().length
  const firstName = user.name.split(' ')[0]

  const saved = () => {
    setCreating(false)
    checklists.reload()
    toast.success('Checklist berhasil dibuat')
  }

  let tripBlock
  if (checklists.error) tripBlock = <ErrorNote>Gagal memuat checklist. Coba muat ulang halaman.</ErrorNote>
  else if (checklists.loading) tripBlock = <div className="h-[190px] animate-pulse rounded-2xl bg-line md:h-[250px]" />
  else if (trip) tripBlock = <ActiveTripCard trip={trip} />
  else tripBlock = <NoTrip onCreate={() => setCreating(true)} />

  return (
    <>
      <BackTopBar onBack={() => navigate(-1)} title="Dashboard" />

      <div className="px-5 pb-6 pt-4 md:px-0 md:pb-0 md:pt-8">
        <div className="mb-1 md:mb-6">
          <h1 className="font-heading text-lg font-bold md:text-[28px]">Halo, {firstName}! 👋</h1>
          <p className="text-[11.5px] text-mute md:mt-1 md:text-sm">Semoga persiapan pendakianmu lancar.</p>
        </div>

        <div className="md:grid md:grid-cols-[minmax(0,1fr)_330px] md:items-start md:gap-6">
          <div className="min-w-0 space-y-4 pt-3 md:space-y-[18px] md:pt-0">
            <div className="grid grid-cols-2 gap-2.5 md:gap-4">
              <StatCard value={stats ? stats.climbed : '–'} label="Gunung Pernah Didaki" />
              <StatCard value={activeCount ?? '–'} label="Checklist Aktif" />
            </div>

            {tripBlock}

            <Card title="Logbook Terakhir" action={seeAll('/logbook')}>
              <RecentLogbooks state={logbooks} />
            </Card>
          </div>

          <aside className="mt-4 space-y-4 md:sticky md:top-[90px] md:mt-0 md:space-y-[18px]">
            <Card title="Mulai Sesuatu">
              <div className="space-y-2.5 md:space-y-3">
                <Shortcut to="/search" icon={Search} title="Cari Gunung" hint="Temukan tujuan pendakian berikutnya" />
                <Shortcut
                  onClick={() => setCreating(true)}
                  icon={Plus}
                  title="Buat Checklist Baru"
                  hint="Siapkan daftar bawaan trip"
                />
                <Shortcut
                  to="/saved-maps"
                  icon={MapIcon}
                  title="Peta Tersimpan"
                  hint={savedCount ? `${savedCount} peta siap dipakai offline` : 'Unduh peta untuk dipakai offline'}
                />
              </div>
            </Card>
            <BadgesCard stats={stats} />
          </aside>
        </div>
      </div>

      {creating && <CreateChecklistModal onClose={() => setCreating(false)} onSaved={saved} />}
    </>
  )
}

export default function Dashboard() {
  const { isLoggedIn } = useAuth()
  if (isLoggedIn) return <DashboardLoggedIn />
  return (
    <>
      <BackTopBar to="/" title="Dashboard" />
      <GuestPrompt
        icon={LayoutDashboard}
        title="Kamu belum masuk"
        description="Login untuk melihat ringkasan trip, checklist aktif, dan logbook terakhirmu."
        perks={perks}
      />
    </>
  )
}
