import { useState } from 'react'
import { BadgeCheck, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import Toggle from '../ui/Toggle'
import { useToast } from '../../context/ToastContext'
import { getMyLogbooks, setLogbookPublic } from '../../api/logbook'
import { useAsync } from '../../hooks/useAsync'
import { formatDateRange, formatNights } from '../../utils/date'
import { coverBackground } from '../../utils/mountainLabels'

function Row({ entry, isPublic, busy, showDuration, onToggle }) {
  const { mountain, route, startDate, endDate, nights, verified } = entry
  const duration = showDuration ? formatNights(nights) : null

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-3 md:gap-4 md:py-3.5 md:pl-3.5 md:pr-5">
      <div
        className="size-[52px] shrink-0 rounded-[10px] md:size-[68px] md:rounded-xl"
        style={{ background: coverBackground(mountain.cover) }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <b className="whitespace-nowrap text-[13px] md:text-[15px]">{mountain.name}</b>
          {verified && (
            <Badge>
              <BadgeCheck size={11} />
              Terverifikasi
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-mute md:mt-1 md:text-[12.5px]">
          Via {route} · {formatDateRange(startDate, endDate)}
          {duration && ` · ${duration}`}
        </p>
        <p
          className={`mt-0.5 text-[11px] font-semibold md:hidden ${isPublic ? 'text-leaf-deep' : 'text-mute'}`}
        >
          {isPublic ? 'Publik' : 'Privat'}
        </p>
      </div>
      <span
        className={`hidden w-[50px] text-right text-xs font-semibold md:block ${
          isPublic ? 'text-leaf-deep' : 'text-mute'
        }`}
      >
        {isPublic ? 'Publik' : 'Privat'}
      </span>
      <Toggle
        checked={isPublic}
        disabled={busy}
        onChange={onToggle}
        label={`Tampilkan ${mountain.name} via ${route} secara publik`}
      />
    </li>
  )
}

function Skeleton({ columns }) {
  return (
    <ul className={`grid animate-pulse gap-2.5 ${columns === 2 ? 'md:grid-cols-2' : ''}`} aria-busy="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="h-[76px] rounded-2xl bg-line md:h-[96px]" />
      ))}
    </ul>
  )
}

// columns: 1 untuk panel Privasi, 2 untuk halaman penuh di desktop
export default function PublicLogbookList({ columns = 1, showDuration = false }) {
  const toast = useToast()
  const { data, error, loading, reload } = useAsync(getMyLogbooks, [])
  // status yang baru diubah di layar (optimistis); dikembalikan bila server menolak
  const [overrides, setOverrides] = useState({})
  const [busyIds, setBusyIds] = useState(() => new Set())

  const setBusy = (id, on) =>
    setBusyIds((set) => {
      const next = new Set(set)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const toggle = async (entry, next) => {
    if (busyIds.has(entry.id)) return
    setBusy(entry.id, true)
    setOverrides((o) => ({ ...o, [entry.id]: next }))
    try {
      await setLogbookPublic(entry.id, next)
    } catch {
      setOverrides((o) => ({ ...o, [entry.id]: !next }))
      toast.error('Gagal mengubah visibilitas entri. Coba lagi.')
    } finally {
      setBusy(entry.id, false)
    }
  }

  if (loading) return <Skeleton columns={columns} />

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-paper px-5 py-8 text-center text-xs text-mute">
        Gagal memuat logbook.{' '}
        <button type="button" onClick={reload} className="font-semibold text-leaf-deep">
          Coba lagi
        </button>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-paper px-5 py-8 text-center text-xs text-mute">
        <BookOpen size={30} strokeWidth={1.5} className="mx-auto mb-2" />
        Belum ada entri logbook.{' '}
        <Link to="/logbook" className="font-semibold text-leaf-deep">
          Ke Logbook
        </Link>
      </div>
    )
  }

  return (
    <ul className={`grid gap-2.5 md:gap-3 ${columns === 2 ? 'md:grid-cols-2' : ''}`}>
      {data.map((entry) => (
        <Row
          key={entry.id}
          entry={entry}
          isPublic={overrides[entry.id] ?? entry.isPublic}
          busy={busyIds.has(entry.id)}
          showDuration={showDuration}
          onToggle={(next) => toggle(entry, next)}
        />
      ))}
    </ul>
  )
}
