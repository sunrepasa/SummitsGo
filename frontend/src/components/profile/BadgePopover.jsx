import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import BadgeMedal from '../ui/BadgeMedal'
import { POPOVER_WIDTH } from '../../utils/popoverPosition'

export default function BadgePopover({ badge, position, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const onMouseDown = (e) => {
      // klik pada lencana ditangani tombolnya sendiri (buka atau tutup), bukan di sini
      if (ref.current?.contains(e.target) || e.target.closest?.('[data-badge-trigger]')) return
      onClose()
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    // posisi dihitung sekali saat dibuka, jadi digulir atau diubah ukurannya menutup popup
    window.addEventListener('scroll', onClose, true)
    window.addEventListener('resize', onClose)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onClose, true)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose])

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={badge.name}
      className="fixed z-[45] animate-[modal-in_.15s_ease-out] rounded-2xl border border-line bg-paper p-4 text-left shadow-lg"
      style={{ ...position, width: POPOVER_WIDTH, maxWidth: 'calc(100vw - 24px)' }}
    >
      <div className="flex items-center gap-3">
        <BadgeMedal icon={badge.icon} tier={badge.tier} label={badge.label} image={badge.image} size={64} />
        <div className="min-w-0">
          <p className="font-heading text-sm font-bold leading-tight">{badge.name}</p>
          {badge.tierName && (
            <p className="mt-0.5 text-[11px] font-semibold text-mute">Tingkat {badge.tierName}</p>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs leading-normal">Didapat setelah kamu {badge.description}.</p>

      {badge.next ? (
        <p className="mt-2 text-[11.5px] leading-normal text-mute">
          Tingkat berikutnya ({badge.next.tierName}): {badge.next.description}. Pencapaianmu saat
          ini: {badge.valueText}.
        </p>
      ) : (
        badge.tierCount > 1 && (
          <p className="mt-2 text-[11.5px] font-semibold text-leaf-deep">Tingkat tertinggi tercapai</p>
        )
      )}
    </div>,
    document.body,
  )
}