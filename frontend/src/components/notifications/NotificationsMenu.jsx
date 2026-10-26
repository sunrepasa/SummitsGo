import { useRef, useState } from 'react'
import { CheckCheck, EllipsisVertical, Trash2 } from 'lucide-react'
import { useDismiss } from '../../hooks/useDismiss'

const item =
  'flex w-full items-center gap-2.5 rounded-[9px] px-3 py-[11px] text-left text-[13px] hover:bg-stone disabled:opacity-40 disabled:hover:bg-transparent'

// menu ⋮ untuk aksi massal: tandai dibaca, hapus yang sudah dibaca, hapus semua
export default function NotificationsMenu({ unread, read, total, onMarkAll, onDeleteRead, onDeleteAll }) {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  useDismiss(ref, open, () => setOpen(false))

  const pick = (action) => () => {
    setOpen(false)
    action()
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu notifikasi"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={total === 0}
        className="flex size-[34px] items-center justify-center rounded-full border border-line bg-paper text-ink disabled:opacity-40 md:size-10"
      >
        <EllipsisVertical size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[42px] z-30 w-[230px] rounded-[14px] border border-line bg-paper p-1.5 shadow-[0_12px_28px_rgba(20,40,34,.22)] md:top-12"
        >
          <button type="button" role="menuitem" disabled={unread === 0} onClick={pick(onMarkAll)} className={item}>
            <CheckCheck size={15} />
            Tandai semua dibaca
          </button>
          <div className="mx-1.5 my-1 h-px bg-line" />
          <button type="button" role="menuitem" disabled={read === 0} onClick={pick(onDeleteRead)} className={`${item} text-warn`}>
            <Trash2 size={15} />
            Hapus yang sudah dibaca
          </button>
          <button type="button" role="menuitem" onClick={pick(onDeleteAll)} className={`${item} font-semibold text-warn`}>
            <Trash2 size={15} />
            Hapus semua
          </button>
        </div>
      )}
    </div>
  )
}
