import { BookOpen, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import DraftCard from '../../components/logbook/DraftCard'
import LogbookListItem, { LogbookListItemSkeleton } from '../../components/logbook/LogbookListItem'
import { useAuth } from '../../context/AuthContext'
import {
  confirmLogbookDraft,
  dismissLogbookDraft,
  getLogbookDrafts,
  getMyLogbooks,
} from '../../api/logbook'
import { useAsync } from '../../hooks/useAsync'
import { getLogbookStats } from '../../utils/logbookStats'

const listStack = 'space-y-2.5 md:space-y-3'
const GUEST_STATS = { climbed: 0, highest: 0 }
const LOGIN_STATE = { from: '/logbook' }

function AddButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 rounded-full bg-[#E7F0E1] px-[13px] py-2 text-[11.5px] font-semibold text-pine-deep md:px-5 md:py-2.5 md:text-[13px]"
    >
      <Plus size={14} />
      Tambah Manual
    </button>
  )
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-[14px] border border-line bg-paper p-3 text-center md:rounded-2xl md:p-5 md:text-left">
      <b className="block font-heading text-[19px] md:text-3xl">{value}</b>
      <span className="text-[10.5px] text-mute md:text-[12.5px]">{label}</span>
    </div>
  )
}

function EmptyHistory({ children }) {
  return (
    <div className="px-[30px] py-[70px] text-center text-mute md:rounded-[18px] md:border md:border-dashed md:border-line md:bg-paper md:py-[90px]">
      <BookOpen size={38} strokeWidth={1.5} className="mx-auto mb-3" />
      <h3 className="mb-1.5 font-heading text-[15px] text-ink md:text-[17px]">Belum ada riwayat</h3>
      <p className="text-xs leading-normal md:text-[13px]">Catatan pendakianmu akan muncul di sini.</p>
      {children}
    </div>
  )
}

function countByMountain(entries) {
  const counts = new Map()
  entries.forEach((e) => counts.set(e.mountain.id, (counts.get(e.mountain.id) ?? 0) + 1))
  return counts
}

function History({ state }) {
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
      <div className={listStack}>
        {Array.from({ length: 3 }, (_, i) => (
          <LogbookListItemSkeleton key={i} />
        ))}
      </div>
    )
  }
  if (data.length === 0) return <EmptyHistory />

  const counts = countByMountain(data)
  return (
    <div className={listStack}>
      {data.map((entry) => (
        <LogbookListItem key={entry.id} entry={entry} repeat={counts.get(entry.mountain.id)} />
      ))}
    </div>
  )
}

function LogbookView({ stats, onAdd, drafts = [], onSave, onDismiss, children }) {
  const climbed = stats ? stats.climbed : '–'
  const highest = stats && stats.highest > 0 ? `${stats.highest.toLocaleString('id-ID')} m` : '–'

  return (
    <>
      <TopBar title="Logbook" right={<AddButton onClick={onAdd} />} />

      <div className="px-5 pb-6 md:px-0 md:pb-0">
        <div className="hidden items-center justify-between pb-[22px] pt-[30px] md:flex">
          <h1 className="font-heading text-[26px] font-bold">Logbook</h1>
          <AddButton onClick={onAdd} />
        </div>

        <div className="md:grid md:grid-cols-[260px_1fr] md:items-start md:gap-7">
          <aside className="grid grid-cols-2 gap-2.5 pt-3.5 md:sticky md:top-[86px] md:grid-cols-1 md:gap-3.5 md:pt-0">
            <StatCard value={climbed} label="Gunung Didaki" />
            <StatCard value={highest} label="Tertinggi Dicapai" />
          </aside>

          <section>
            {drafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} onSave={onSave} onDismiss={onDismiss} />
            ))}
            <div className="pt-4 md:pt-0">{children}</div>
          </section>
        </div>
      </div>
    </>
  )
}

function LogbookLoggedIn() {
  const logbooks = useAsync(getMyLogbooks, [])
  const drafts = useAsync(getLogbookDrafts, [])
  const stats = logbooks.data ? getLogbookStats(logbooks.data) : null

  const save = async (id) => {
    await confirmLogbookDraft(id)
    logbooks.reload()
    drafts.reload()
  }
  const dismiss = async (id) => {
    await dismissLogbookDraft(id)
    drafts.reload()
  }

  return (
    <LogbookView stats={stats} drafts={drafts.data ?? []} onSave={save} onDismiss={dismiss}>
      <History state={logbooks} />
    </LogbookView>
  )
}

// guest tidak memanggil API sama sekali: endpoint logbook butuh token, dan datanya memang kosong
function LogbookGuest() {
  const navigate = useNavigate()

  return (
    <LogbookView stats={GUEST_STATS} onAdd={() => navigate('/login', { state: LOGIN_STATE })}>
      <EmptyHistory>
        <Link
          to="/login"
          state={LOGIN_STATE}
          className="mt-4 inline-block text-[12.5px] font-semibold text-leaf-deep"
        >
          Masuk untuk mencatat pendakianmu
        </Link>
      </EmptyHistory>
    </LogbookView>
  )
}

export default function Logbook() {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <LogbookLoggedIn /> : <LogbookGuest />
}