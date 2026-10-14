import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function ConfirmDialog({
  icon: Icon,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Batal',
  busyLabel = 'Memproses...',
  busy = false,
  danger = false,
  onConfirm,
  onCancel,
}) {
  const panelRef = useRef(null)

  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [busy, onCancel])

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-[30px]">
      <div className="absolute inset-0 bg-[rgba(10,20,15,.55)]" onClick={busy ? undefined : onCancel} />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-[360px] animate-[modal-in_.2s_ease-out] rounded-[18px] bg-paper px-5 py-[22px] text-center outline-none md:rounded-[20px] md:p-6"
      >
        {Icon && <Icon size={28} className={`mx-auto mb-2.5 ${danger ? 'text-warn' : 'text-leaf-deep'}`} />}
        <h3 className="mb-2 font-heading text-[15px] font-bold md:text-[17px]">{title}</h3>
        <div className="mb-[18px] text-[11.5px] leading-[1.6] text-mute md:text-[12.5px]">{children}</div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-[11px] bg-stone py-[11px] text-[12.5px] font-semibold disabled:opacity-60 md:border md:border-line md:bg-paper"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 rounded-[11px] py-[11px] text-[12.5px] font-semibold text-white disabled:opacity-60 ${
              danger ? 'bg-warn' : 'bg-pine'
            }`}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}