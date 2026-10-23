import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Download, Info, LocateFixed, MapPinned, Trash2, TriangleAlert } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import LeafletMap from '../../components/map/LeafletMap'
import MapLegend from '../../components/map/MapLegend'
import MapPanel from '../../components/map/MapPanel'
import StateScreen from '../../components/public/StateScreen'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../context/ToastContext'
import { getRouteMap } from '../../api/routeMap'
import { USE_MOCK } from '../../config'
import { useAsync } from '../../hooks/useAsync'
import { useBack } from '../../hooks/useBack'
import { useLiveLocation } from '../../hooks/useLiveLocation'
import { useMapDownload } from '../../hooks/useMapDownload'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { computeNavigation, formatBytes } from '../../utils/geo'
import { supportsOfflineMaps } from '../../utils/offlineMaps'

const roundBtn =
  'flex items-center justify-center rounded-full bg-paper shadow-[0_6px_16px_rgba(0,0,0,.15)]'

function MapSkeleton() {
  return (
    <div className="h-dvh animate-pulse bg-line" aria-busy="true" aria-label="Memuat peta">
      <div className="absolute inset-x-4 bottom-5 h-[130px] rounded-2xl bg-paper md:inset-y-4 md:left-4 md:right-auto md:h-auto md:w-[340px]" />
    </div>
  )
}

function MapReady({ routeMap, goBack }) {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const mapRef = useRef(null)
  const online = useOnlineStatus()
  const download = useMapDownload(routeMap)
  // ?live=1 dan ?download=1 dikirim tombol di halaman detail gunung; dibaca sekali saat halaman dibuka
  const live = useLiveLocation({ autoStart: searchParams.get('live') === '1' })
  const [legendOpen, setLegendOpen] = useState(false)
  const [confirm, setConfirm] = useState(() =>
    searchParams.get('download') === '1' && !download.saved ? 'download' : null,
  )
  // posisi palsu untuk demo (hanya mode mock): { index, at }
  const [sim, setSim] = useState(null)

  useEffect(() => {
    if (!searchParams.has('live') && !searchParams.has('download')) return
    const next = new URLSearchParams(searchParams)
    next.delete('live')
    next.delete('download')
    setSearchParams(next, { replace: true })
    // hanya saat halaman dibuka
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canDownload = supportsOfflineMaps()
  const simPoint = sim ? routeMap.checkpoints[sim.index] : null
  const position = simPoint
    ? { lat: simPoint.lat, lng: simPoint.lng, accuracy: 15, timestamp: sim.at }
    : live.position
  const liveForPanel = sim ? { ...live, status: 'active', weakSignal: false } : live
  const nav = position ? computeNavigation(routeMap, position) : null

  const requestDownload = () => {
    if (!online) {
      toast.error('Kamu sedang offline. Sambungkan internet untuk mengunduh peta.')
      return
    }
    setConfirm('download')
  }

  const recenter = () => {
    if (!mapRef.current?.flyToUser()) {
      mapRef.current?.fitRoute()
      if (live.status === 'idle') toast.success('Aktifkan Live Location untuk melihat posisimu')
    }
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-stone">
      <LeafletMap
        ref={mapRef}
        routeMap={routeMap}
        user={position ? { lat: position.lat, lng: position.lng, accuracy: position.accuracy } : null}
        className="absolute inset-0"
      />

      <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2.5 bg-gradient-to-b from-black/35 to-transparent px-4 py-4 md:hidden">
        <button type="button" onClick={goBack} aria-label="Kembali" className={`${roundBtn} size-[34px]`}>
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0 text-white">
          <div className="truncate font-heading text-[14.5px] font-bold">{routeMap.mountain.name}</div>
          <div className="text-[10.5px] opacity-85">Via {routeMap.route}</div>
        </div>
        <button
          type="button"
          onClick={() => setLegendOpen((v) => !v)}
          aria-label="Keterangan ikon"
          aria-expanded={legendOpen}
          className={`${roundBtn} ml-auto size-[34px]`}
        >
          <Info size={16} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setLegendOpen((v) => !v)}
        aria-label="Keterangan ikon"
        aria-expanded={legendOpen}
        className={`${roundBtn} absolute right-4 top-4 z-10 hidden size-10 md:flex`}
      >
        <Info size={17} />
      </button>
      {legendOpen && <MapLegend />}

      <button
        type="button"
        onClick={recenter}
        aria-label="Pusatkan peta ke posisimu"
        className={`${roundBtn} absolute bottom-[200px] right-4 z-10 size-10 md:bottom-[112px]`}
      >
        <LocateFixed size={17} />
      </button>

      <MapPanel
        routeMap={routeMap}
        live={liveForPanel}
        position={position}
        nav={nav}
        online={online}
        download={download}
        canDownload={canDownload}
        demo={USE_MOCK ? { sim, onChange: setSim } : null}
        onBack={goBack}
        onStartLive={live.start}
        onStopLive={() => {
          setSim(null)
          live.stop()
        }}
        onDownload={requestDownload}
        onCancelDownload={download.cancel}
        onRemove={() => setConfirm('remove')}
        onFocus={(c) => mapRef.current?.focusPoint(c.lat, c.lng)}
      />

      {confirm === 'download' && (
        <ConfirmDialog
          icon={Download}
          title="Unduh peta jalur ini?"
          confirmLabel="Unduh"
          onConfirm={() => {
            setConfirm(null)
            download.start()
          }}
          onCancel={() => setConfirm(null)}
        >
          Peta <b>{routeMap.mountain.name} via {routeMap.route}</b> akan disimpan di perangkat ini supaya bisa dipakai
          tanpa internet. Ukurannya sekitar <b>{formatBytes(download.plan.estimatedBytes)}</b> (
          {download.plan.count} potongan peta). Sebaiknya unduh saat terhubung Wi-Fi.
        </ConfirmDialog>
      )}

      {confirm === 'remove' && (
        <ConfirmDialog
          icon={Trash2}
          danger
          title="Hapus peta offline?"
          confirmLabel="Ya, Hapus"
          onConfirm={() => {
            setConfirm(null)
            download.remove()
          }}
          onCancel={() => setConfirm(null)}
        >
          Peta <b>{routeMap.mountain.name} via {routeMap.route}</b> dihapus dari perangkat ini. Kamu bisa
          mengunduhnya lagi kapan saja saat online.
        </ConfirmDialog>
      )}
    </div>
  )
}

function MapContent({ id, route }) {
  const goBack = useBack(`/mountain/${id}`)
  const { data, error, loading, reload } = useAsync(
    () =>
      route
        ? getRouteMap(id, route)
        : Promise.reject(Object.assign(new Error('Jalur belum dipilih'), { status: 404 })),
    [id, route],
  )

  if (loading) return <MapSkeleton />
  if (error) {
    const notFound = error.status === 404
    return (
      <div className="min-h-dvh bg-stone">
        <div className="px-4 py-4">
          <button
            type="button"
            onClick={goBack}
            aria-label="Kembali"
            className="flex size-9 items-center justify-center rounded-full border border-line bg-paper"
          >
            <ArrowLeft size={16} />
          </button>
        </div>
        <StateScreen
          icon={notFound ? MapPinned : TriangleAlert}
          title={notFound ? 'Peta jalur belum tersedia' : 'Gagal memuat peta'}
          text={
            notFound
              ? 'Peta untuk jalur ini belum dipetakan. Kamu tetap bisa melihat info pos di halaman gunung.'
              : 'Periksa koneksi lalu coba lagi.'
          }
          action={
            notFound ? (
              <Link
                to={`/mountain/${id}`}
                className="rounded-full bg-pine px-5 py-2.5 text-[13px] font-semibold text-white"
              >
                Ke Detail Gunung
              </Link>
            ) : (
              <button
                type="button"
                onClick={reload}
                className="rounded-full bg-pine px-5 py-2.5 text-[13px] font-semibold text-white"
              >
                Coba Lagi
              </button>
            )
          }
        />
      </div>
    )
  }
  return <MapReady routeMap={data} goBack={goBack} />
}

// Halaman ini terbuka untuk guest (tanpa login) karena peta offline dan Live Location termasuk fitur inti.
// key membuat seluruh state (unduhan, Live Location) dibuang saat berpindah jalur.
export default function MapPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const route = searchParams.get('route')
  return <MapContent key={`${id}:${route}`} id={id} route={route} />
}
