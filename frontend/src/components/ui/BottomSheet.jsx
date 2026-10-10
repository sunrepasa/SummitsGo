import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function BottomSheet({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  // lewat portal karena TopBar sticky membentuk stacking context sendiri,
  // tanpa portal sheet bisa tertutup BottomNav
  return createPortal(
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-[rgba(10,20,15,.45)]" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-x-0 bottom-0 flex max-h-[85vh] animate-[sheet-up_.25s_ease-out] flex-col rounded-t-[22px] bg-paper"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line" />

        <header className="flex items-center justify-between px-5 pb-2 pt-3">
          <h2 className="font-heading text-[17px] font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex size-8 items-center justify-center rounded-full bg-stone text-mute"
          >
            <X size={16} />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-2">{children}</div>

        {footer && (
          <div className="border-t border-line px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}