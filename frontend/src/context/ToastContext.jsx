import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, X } from 'lucide-react'

const ToastContext = createContext(null)
const DURATION_MS = 3500
const MAX_VISIBLE = 3

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const isError = toast.type === 'error'

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-full max-w-[360px] animate-[modal-in_.2s_ease-out] items-center gap-2.5 rounded-xl px-3.5 py-3 text-[12.5px] font-medium text-white shadow-lg ${
        isError ? 'bg-warn' : 'bg-pine'
      }`}
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
          isError ? 'bg-white/25' : 'bg-leaf text-[#12210F]'
        }`}
      >
        {isError ? <X size={12} strokeWidth={3} /> : <Check size={12} strokeWidth={3} />}
      </span>
      {toast.message}
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const push = useCallback((message, type) => {
    nextId.current += 1
    const toast = { id: nextId.current, message, type }
    setToasts((list) => [...list, toast].slice(-MAX_VISIBLE))
  }, [])

  const api = useMemo(
    () => ({
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-[90px] z-[70] flex flex-col items-center gap-2 px-5 md:inset-x-auto md:bottom-auto md:right-6 md:top-[84px] md:items-end md:px-0"
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook dan provider sengaja satu file
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast harus dipakai di dalam ToastProvider')
  return ctx
}