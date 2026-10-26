import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import BadgeMedal from '../ui/BadgeMedal'
import BottomSheet from '../ui/BottomSheet'
import BadgePopover from './BadgePopover'
import { popoverPosition } from '../../utils/popoverPosition'

const LONG_PRESS_MS = 450

// Galeri lencana untuk memilih yang tampil di profil. Ketuk = pilih/batal pilih (yang terpilih tampil abu dengan tanda ✓),
// tekan lama = penjelasan lencana, sama seperti saat lencana di profil diketuk.
export default function BadgePickerSheet({ earned, selectedIds, max, onToggle, onClose }) {
  const [info, setInfo] = useState(null)
  const [limitHit, setLimitHit] = useState(false)
  const timer = useRef(null)
  const longPressed = useRef(false)

  useEffect(() => () => clearTimeout(timer.current), [])

  const cancelPress = () => clearTimeout(timer.current)

  const startPress = (badge) => (e) => {
    longPressed.current = false
    // posisi diambil sekarang karena e.currentTarget kosong saat timer berjalan
    const position = popoverPosition(e.currentTarget.getBoundingClientRect())
    cancelPress()
    timer.current = setTimeout(() => {
      longPressed.current = true
      setInfo({ badge, position })
    }, LONG_PRESS_MS)
  }

  const tap = (badge) => {
    // klik yang menyusul tekan-lama tidak boleh ikut memilih
    if (longPressed.current) {
      longPressed.current = false
      return
    }
    if (info) {
      setInfo(null)
      return
    }
    const selected = selectedIds.includes(badge.id)
    if (!selected && selectedIds.length >= max) {
      setLimitHit(true)
      return
    }
    setLimitHit(false)
    onToggle(badge.id)
  }

  return (
    <>
      <BottomSheet
        open
        modal
        onClose={onClose}
        title="Pilih Lencana"
        titleAddon={
          <span className={`text-xs font-semibold ${limitHit ? 'text-warn' : 'text-mute'}`}>
            {selectedIds.length}/{max}
          </span>
        }
        footer={
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-pine py-3 text-[13.5px] font-semibold text-white"
          >
            Selesai
          </button>
        }
      >
        <p className={`mb-3 text-[11.5px] leading-normal ${limitHit ? 'font-semibold text-warn' : 'text-mute'}`}>
          {limitHit
            ? `Maksimal ${max} lencana. Batalkan salah satu dulu untuk memilih yang lain.`
            : `Pilih sampai ${max} lencana untuk ditampilkan di profil. Yang berwarna abu dan bertanda ✓ sedang dipilih. Tekan lama untuk melihat penjelasannya.`}
        </p>

        {earned.length === 0 ? (
          <p className="py-8 text-center text-xs leading-normal text-mute">
            Belum ada lencana. Selesaikan pendakian terverifikasi untuk mendapatkannya.
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-2.5 pb-3 md:grid-cols-4">
            {earned.map((b) => {
              const selected = selectedIds.includes(b.id)
              return (
                <li key={b.id}>
                  <button
                    type="button"
                    data-badge-trigger
                    aria-pressed={selected}
                    aria-label={`${b.name}${b.tierName ? `, tingkat ${b.tierName}` : ''}. ${b.description}`}
                    onPointerDown={startPress(b)}
                    onPointerUp={cancelPress}
                    onPointerLeave={cancelPress}
                    onPointerCancel={cancelPress}
                    onContextMenu={(e) => e.preventDefault()}
                    onClick={() => tap(b)}
                    className={`relative flex w-full touch-manipulation select-none flex-col items-center gap-1.5 rounded-2xl border px-1.5 py-3 text-center [-webkit-touch-callout:none] ${
                      selected ? 'border-line bg-stone' : 'border-line bg-paper'
                    }`}
                  >
                    <span className={selected ? 'opacity-45 grayscale' : ''}>
                      <BadgeMedal image={b.image} size={64} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold">{b.name}</span>
                      <span className="block text-[10.5px] text-mute">
                        {b.tierName ? `Tingkat ${b.tierName}` : 'Satu tingkat'}
                      </span>
                    </span>
                    {selected && (
                      <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-pine text-white">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </BottomSheet>

      {info && (
        <BadgePopover badge={info.badge} position={info.position} onClose={() => setInfo(null)} zClass="z-[65]" />
      )}
    </>
  )
}
