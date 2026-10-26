import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Dialog kecil di tengah layar (mobile maupun desktop), sesuai mockup poster.
// Bertingkat: dialog Edit Poster dibuka di atas dialog Bagikan; dialog di bawahnya mematikan Escape (closeOnEscape)
// supaya satu tekanan Escape hanya menutup dialog paling atas.
export default function PosterDialog({ title, onClose, children, widthClass = 'w-[304px] md:w-[400px]', level = 0, floatingClose = false, closeOnEscape = true }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!closeOnEscape) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, closeOnEscape])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return createPortal(
    <div className={`fixed inset-0 flex items-center justify-center p-5 ${level ? 'z-[60]' : 'z-50'}`}>
      <div className="absolute inset-0 bg-[rgba(10,20,15,.55)]" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-full max-w-full animate-[modal-in_.2s_ease-out] rounded-[22px] bg-paper p-[18px] outline-none shadow-[0_24px_50px_rgba(0,0,0,.35)] md:p-[22px] ${widthClass}`}
      >
        {floatingClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute -right-3 -top-3 z-10 flex size-[30px] items-center justify-center rounded-full bg-paper text-mute shadow-[0_4px_12px_rgba(0,0,0,.25)]"
          >
            <X size={14} />
          </button>
        )}
        <div className="max-h-[calc(100dvh-40px-36px)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
