import { useState } from 'react'
import { ChevronRight, Map as MapIcon, Trash2, WifiOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import BackTopBar from '../../components/layout/BackTopBar'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../context/ToastContext'
import { useBack } from '../../hooks/useBack'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { dateToIso, formatDateRange } from '../../utils/date'
import { formatBytes } from '../../utils/geo'
import { removeOfflineMap } from '../../utils/offlineMaps'
import { getSavedMaps } from '../../utils/savedMaps'

const mapUrl = (m) => `/mountain/${m.mountainId}/map?route=${encodeURIComponent(m.route)}`

function SavedMapRow({ map, onDelete }) {
  return (
    <li className="flex items-center gap-3 rounded-[14px] border border-line bg-paper p-3 md:gap-[18px] md:rounded-2xl md:px-[18px] md:py-3.5">
      <Link to={mapUrl(map)} className="flex min-w-0 flex-1 items-center gap-3 md:gap-[18px]">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-[#E7F0E1] text-leaf-deep md:size-14 md:rounded-xl">
          <MapIcon size={22} />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block truncate text-[13.5px] md:text-base">{map.mountainName}</b>
          <span className="block text-xs text-mute md:text-[13px]">Via {map.route}</span>
          <span className="block text-[10.5px] text-mute md:text-xs">
            {formatBytes(map.bytes)} · diunduh {formatDateRange(dateToIso(new Date(map.savedAt)))}
          </span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-mute" />
      </Link>
      <button
        type="button"
        onClick={() => onDelete(map)}
        aria-label={`Hapus peta ${map.mountainName} via ${map.route}`}
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-warn"
      >
        <Trash2 size={15} />
      </button>
    </li>
  )
}

// Daftar peta offline di perangkat ini. Terbuka untuk guest karena unduh peta tidak butuh login;
// peta tersimpan di browser perangkat, jadi tidak ikut berpindah bersama akun.
export default function SavedMaps() {
  const toast = useToast()
  const goBack = useBack('/')
  const online = useOnlineStatus()
  const [maps, setMaps] = useState(getSavedMaps)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const totalBytes = maps.reduce((sum, m) => sum + m.bytes, 0)

  const doDelete = async () => {
    setDeleting(true)
    try {
      await removeOfflineMap(toDelete)
      setMaps(getSavedMaps())
      toast.success('Peta offline dihapus')
    } catch {
      toast.error('Gagal menghapus peta offline. Coba lagi.')
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  return (
    <>
      <BackTopBar onBack={goBack} title="Peta Tersimpan" />

      <div className="px-5 pb-8 md:px-0">
        <h1 className="hidden pt-8 font-heading text-2xl font-bold md:block">Peta Tersimpan</h1>
        <p className="mb-4 mt-3 text-xs leading-normal text-mute md:mb-5 md:mt-1.5 md:text-[13px]">
          {maps.length > 0
            ? `${maps.length} peta · ${formatBytes(totalBytes)} di perangkat ini`
            : 'Peta yang kamu unduh tersimpan di perangkat ini dan bisa dipakai tanpa internet.'}
        </p>

        {!online && (
          <p className="mb-4 flex items-start gap-2 rounded-xl bg-warnbg px-3 py-2.5 text-[11.5px] leading-normal text-warn">
            <WifiOff size={14} className="mt-px shrink-0" />
            Kamu sedang offline. Peta di bawah tetap bisa dibuka.
          </p>
        )}

        {maps.length === 0 ? (
          <div className="px-[30px] py-[70px] text-center text-mute md:rounded-[18px] md:border md:border-dashed md:border-line md:bg-paper md:py-[90px]">
            <MapIcon size={38} strokeWidth={1.5} className="mx-auto mb-3" />
            <h2 className="mb-1.5 font-heading text-[15px] text-ink md:text-[17px]">Belum ada peta tersimpan</h2>
            <p className="mb-4 text-xs leading-normal md:text-[13px]">
              Buka detail gunung lalu pilih Unduh Peta untuk memakainya saat tidak ada sinyal.
            </p>
            <Link to="/search" className="rounded-full bg-pine px-5 py-2.5 text-[13px] font-semibold text-white">
              Cari Gunung
            </Link>
          </div>
        ) : (
          <ul className="space-y-2.5 md:space-y-3">
            {maps.map((m) => (
              <SavedMapRow key={m.id} map={m} onDelete={setToDelete} />
            ))}
          </ul>
        )}
      </div>

      {toDelete && (
        <ConfirmDialog
          icon={Trash2}
          danger
          title="Hapus peta offline?"
          confirmLabel="Ya, Hapus"
          busy={deleting}
          busyLabel="Menghapus..."
          onConfirm={doDelete}
          onCancel={() => setToDelete(null)}
        >
          Peta <b>{toDelete.mountainName} via {toDelete.route}</b> dihapus dari perangkat ini. Kamu bisa mengunduhnya
          lagi kapan saja saat online.
        </ConfirmDialog>
      )}
    </>
  )
}
