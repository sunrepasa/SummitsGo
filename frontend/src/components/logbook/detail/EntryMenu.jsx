import { useRef, useState } from 'react'
import { EllipsisVertical, Pencil, Share2, Trash2 } from 'lucide-react'
import { useDismiss } from '../../../hooks/useDismiss'

const itemClass = 'flex w-full items-center gap-2.5 rounded-[9px] px-3 py-[11px] text-left text-[13px] hover:bg-stone'

// menu ⋮ khusus mobile; di desktop aksi yang sama ada di kartu samping
export default function EntryMenu({ onEditNote, onShare, onDelete }) {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  useDismiss(ref, open, () => setOpen(false))

  const pick = (action) => () => {
    setOpen(false)
    action()
  }

  return (
    <div ref={ref} className="absolute right-4 top-4 md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu entri"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex size-[34px] items-center justify-center rounded-full bg-black/35 text-white"
      >
        <EllipsisVertical size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[42px] z-30 w-[190px] rounded-[14px] border border-line bg-paper p-1.5 shadow-[0_12px_28px_rgba(20,40,34,.22)]"
        >
          <button type="button" role="menuitem" onClick={pick(onEditNote)} className={itemClass}>
            <Pencil size={15} />
            Edit Catatan
          </button>
          <button type="button" role="menuitem" onClick={pick(onShare)} className={itemClass}>
            <Share2 size={15} />
            Bagikan
          </button>
          <div className="mx-1.5 my-1 h-px bg-line" />
          <button type="button" role="menuitem" onClick={pick(onDelete)} className={`${itemClass} font-semibold text-warn`}>
            <Trash2 size={15} />
            Hapus Entri
          </button>
        </div>
      )}
    </div>
  )
}
