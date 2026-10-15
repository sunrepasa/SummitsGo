import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function BottomSheet({ open, onClose, title, titleAddon, children, footer, modal = false }) {
  const panelRef = useRef(null)

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

  // efek terpisah dari yang di atas: onClose sering berganti identitas tiap render,
  // dan fokus tidak boleh direbut ulang setiap kali itu terjadi
  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  if (!open) return null

  // lewat portal karena TopBar sticky membentuk stacking context sendiri,
  // tanpa portal sheet bisa tertutup BottomNav
  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-end ${
        modal ? 'md:items-center md:justify-center md:p-6' : 'md:hidden'
      }`}
    >
      <div className="absolute inset-0 bg-[rgba(10,20,15,.45)]" onClick={onClose} />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[85vh] w-full animate-[sheet-up_.25s_ease-out] flex-col rounded-t-[22px] bg-paper outline-none ${
          modal
            ? 'md:max-h-[90vh] md:max-w-[480px] md:animate-[modal-in_.2s_ease-out] md:rounded-[20px]'
            : ''
        }`}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line md:hidden" />

        <header className="flex items-center justify-between px-5 pb-2 pt-3 md:px-6 md:pb-3 md:pt-6">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="font-heading text-[17px] font-bold">{title}</h2>
            {titleAddon}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex size-8 items-center justify-center rounded-full bg-stone text-mute"
          >
            <X size={16} />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-2 md:px-6">{children}</div>

        {footer && (
          <div className="border-t border-line px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 md:px-6 md:pb-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}