import { useEffect } from 'react'

export function useDismiss(ref, open, onClose) {
  useEffect(() => {
    if (!open) return
    const onMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [ref, open, onClose])
}