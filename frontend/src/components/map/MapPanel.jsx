import { useState } from 'react'
import { ArrowLeft, Check, ChevronDown, Download, LoaderCircle, MapPinned, MapPinOff, WifiOff } from 'lucide-react'
import { facilityIcon } from '../mountain/detail/facilityMeta'
import ProgressBar from '../ui/ProgressBar'
import { useNow } from '../../hooks/useNow'
import { formatAgo, formatBytes, formatDistance } from '../../utils/geo'
import { facilityLabel } from '../../utils/mountainDetail'

const STALE_MS = 5 * 60 * 1000

function Notice({ online, saved }) {
  if (online) return null
  return (
    <p className="mb-3 flex items-start gap-2 rounded-xl bg-warnbg px-3 py-2 text-[11.5px] leading-normal text-warn">
      <WifiOff size={14} className="mt-px shrink-0" />
      {saved
        ? 'Kamu sedang offline. Peta memakai data yang tersimpan di perangkat.'
        : 'Kamu sedang offline dan peta jalur ini belum diunduh, jadi sebagian area bisa kosong.'}
    </p>
  )
}

function Warning({ title, text }) {
  return (
    <div className="rounded-xl bg-warnbg px-3 py-2.5 text-warn">
      <b className="block text-[12.5px]">{title}</b>
      <span className="text-[11px] leading-normal">{text}</span>
    </div>
  )
}

function Plain({ title, text }) {
  return (
    <div>
      <b className="block text-[12.5px]">{title}</b>
      <span className="text-[11px] leading-normal text-mute">{text}</span>
    </div>
  )
}

// bagian atas panel: status Live Location, atau jarak ke pos berikutnya bila posisi sudah ada
function LiveStatus({ status, position, weakSignal, nav }) {
  const now = useNow(status === 'active' ? 15000 : null)

  if (status === 'denied') {
    return (
      <Warning
        title="Izin lokasi ditolak"
        text="Aktifkan izin lokasi untuk situs ini di pengaturan browser, lalu coba lagi."
      />
    )
  }
  if (status === 'unavailable') {
    return (
      <Warning
        title="Lokasi tidak tersedia"
        text="Browser atau perangkat ini tidak mendukung Geolocation. Live Location butuh koneksi HTTPS."
      />
    )
  }
  if (status === 'error') {
    return <Warning title="Posisi tidak ditemukan" text="Sinyal GPS lemah. Coba pindah ke tempat yang lebih terbuka." />
  }
  if (status === 'idle') {
    return (
      <Plain
        title="Live Location nonaktif"
        text="Aktifkan untuk melihat posisimu di peta dan jarak ke pos berikutnya. Hanya berjalan selama halaman ini terbuka."
      />
    )
  }
  if (status === 'waiting' || !position) {
    return (
      <div className="flex items-center gap-2 text-[12.5px] font-semibold">
        <LoaderCircle size={15} className="animate-spin text-leaf-deep" />
        Mencari posisimu…
      </div>
    )
  }

  const stale = now - position.timestamp > STALE_MS
  return (
    <div>
      {nav.isFar ? (
        <Plain
          title={`Kamu jauh dari jalur ini (±${formatDistance(nav.offRoute)})`}
          text="Panduan jarak aktif saat kamu sudah dekat dengan jalur."
        />
      ) : nav.atSummit ? (
        <b className="block text-[13px]">Kamu sudah sampai di puncak</b>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-[12.5px] font-bold">
            Menuju <span className="text-[11px] font-normal text-mute">{nav.next.name}</span>
          </div>
          <div className="whitespace-nowrap font-heading text-[15px] font-bold text-pine-deep">
            {formatDistance(nav.nextDistance)}
          </div>
        </div>
      )}
      {!nav.isFar && nav.isOffRoute && (
        <p className="mt-1.5 text-[11px] font-semibold text-warn">
          Kamu sekitar {formatDistance(nav.offRoute)} dari jalur. Periksa arahmu.
        </p>
      )}
      <p className="mt-2 flex items-center gap-1.5 text-[10px] text-mute">
        <span className={`inline-block size-1.5 rounded-full ${stale || weakSignal ? 'bg-warn' : 'bg-leaf'}`} />
        Posisi diperbarui {formatAgo(position.timestamp, now)}
        {position.accuracy ? ` · akurasi ±${Math.round(position.accuracy)} m` : ''}
        {weakSignal && ' · sinyal lemah'}
      </p>
    </div>
  )
}

function Checkpoints({ checkpoints, onFocus }) {
  return (
    <div className="mt-4 hidden min-h-0 flex-1 flex-col md:flex">
      <p className="mb-1 text-xs font-semibold text-mute">Pos di jalur ini</p>
      <ul className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2">
        {checkpoints.map((c) => (
          <li key={c.name} className="border-t border-dashed border-line first:border-t-0">
            <button
              type="button"
              onClick={() => onFocus(c)}
              className="flex w-full items-center justify-between gap-2 rounded-lg py-2.5 text-left text-[12.5px] hover:bg-stone"
            >
              <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                <b className="font-semibold">{c.name}</b>
                {(c.facilities ?? []).map((f) => {
                  const Icon = facilityIcon[f]
                  return (
                    <span
                      key={f}
                      role="img"
                      aria-label={facilityLabel[f]}
                      title={facilityLabel[f]}
                      className={f === 'blankspot' || f === 'danger' ? 'text-warn' : 'text-leaf-deep'}
                    >
                      <Icon size={13} />
                    </span>
                  )
                })}
              </span>
              <span className="whitespace-nowrap text-[11.5px] text-mute">
                {c.type === 'basecamp' ? 'Titik awal' : c.type === 'summit' ? 'Puncak' : `${c.distance ?? ''}`}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Hanya di mode mock: menggeser posisi palsu di sepanjang pos agar Live Location bisa didemokan dari rumah.
// Awalnya diciutkan menjadi satu baris supaya tidak memakan tempat di layar HP; ketuk untuk membuka.
function DemoControls({ checkpoints, sim, onChange }) {
  const [open, setOpen] = useState(false)
  const btn = 'flex-1 rounded-lg border border-line bg-paper py-1.5 text-[11.5px] font-semibold disabled:opacity-40'
  const index = sim?.index ?? -1
  const move = (delta) => onChange({ index: Math.min(checkpoints.length - 1, Math.max(0, index + delta)), at: Date.now() })

  return (
    <div className="mt-3 rounded-xl border border-dashed border-line px-3 py-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 py-1 text-left text-[10.5px] text-mute"
      >
        <span className="min-w-0 truncate">
          Mode demo (hanya mock){sim ? ` · posisi palsu di ${checkpoints[sim.index].name}` : ''}
        </span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="flex gap-2 pb-1.5 pt-1">
          <button type="button" className={btn} disabled={index <= 0} onClick={() => move(-1)}>
            Mundur
          </button>
          <button type="button" className={btn} disabled={index >= checkpoints.length - 1} onClick={() => move(1)}>
            {sim ? 'Maju' : 'Mulai'}
          </button>
          <button type="button" className={btn} disabled={!sim} onClick={() => onChange(null)}>
            Stop
          </button>
        </div>
      )}
    </div>
  )
}

export default function MapPanel({
  routeMap,
  live,
  position,
  nav,
  online,
  download,
  canDownload,
  demo,
  onBack,
  onStartLive,
  onStopLive,
  onDownload,
  onCancelDownload,
  onRemove,
  onFocus,
}) {
  const liveOn = live.status === 'active' || live.status === 'waiting'
  const downloading = download.phase === 'downloading'
  const busy = download.phase !== 'idle'
  const percent = download.progress.total ? (download.progress.done / download.progress.total) * 100 : 0
  const btn = 'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-[11px] text-[12.5px] font-semibold'

  return (
    <section className="absolute inset-x-4 bottom-5 z-10 flex max-h-[65%] flex-col overflow-y-auto rounded-2xl bg-paper p-4 shadow-[0_-6px_20px_rgba(0,0,0,.12)] md:inset-y-4 md:left-4 md:right-auto md:max-h-none md:w-[340px] md:overflow-visible md:p-5 md:shadow-[0_12px_32px_rgba(0,0,0,.18)]">
      <header className="mb-4 hidden items-center gap-3 md:flex">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-paper"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-heading text-base font-bold">{routeMap.mountain.name}</h1>
          <p className="text-xs text-mute">
            Via {routeMap.route} · {routeMap.mountain.elevation.toLocaleString('id-ID')} mdpl
          </p>
        </div>
      </header>

      <Notice online={online} saved={Boolean(download.saved)} />

      <LiveStatus status={live.status} position={position} weakSignal={live.weakSignal} nav={nav} />

      <div className="mt-3.5 flex gap-2">
        <button
          type="button"
          onClick={liveOn ? onStopLive : onStartLive}
          disabled={live.status === 'unavailable'}
          className={`${btn} disabled:opacity-40 ${liveOn ? 'bg-[#E7F0E1] text-pine-deep' : 'bg-pine text-white'}`}
        >
          {liveOn ? <MapPinOff size={15} /> : <MapPinned size={15} />}
          {liveOn ? 'Matikan Live Location' : 'Aktifkan Live Location'}
        </button>

        {download.saved ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            title="Peta tersimpan. Ketuk untuk menghapus."
            className={`${btn} bg-[#E7F0E1] text-pine-deep disabled:opacity-60`}
          >
            <Check size={15} />
            Tersimpan
          </button>
        ) : (
          <button
            type="button"
            onClick={onDownload}
            disabled={busy || !canDownload}
            className={`${btn} bg-leaf text-[#12210F] disabled:opacity-50`}
          >
            {downloading ? <LoaderCircle size={15} className="animate-spin" /> : <Download size={15} />}
            {downloading ? 'Mengunduh…' : 'Unduh Peta'}
          </button>
        )}
      </div>

      {downloading && (
        <div className="mt-3">
          <ProgressBar value={percent} />
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-mute">
            <span>
              Mengunduh peta… {Math.round(percent)}% ({download.progress.done}/{download.progress.total})
            </span>
            <button type="button" onClick={onCancelDownload} className="font-semibold text-warn">
              Batal
            </button>
          </div>
        </div>
      )}
      {download.saved && !downloading && (
        <p className="mt-2 text-[10.5px] text-mute">
          Peta tersimpan offline · {formatBytes(download.saved.bytes)}
        </p>
      )}
      {!canDownload && !download.saved && (
        <p className="mt-2 text-[10.5px] text-mute">Browser ini tidak mendukung penyimpanan peta offline.</p>
      )}

      <Checkpoints checkpoints={routeMap.checkpoints} onFocus={onFocus} />

      {demo && <DemoControls checkpoints={routeMap.checkpoints} sim={demo.sim} onChange={demo.onChange} />}
    </section>
  )
}
