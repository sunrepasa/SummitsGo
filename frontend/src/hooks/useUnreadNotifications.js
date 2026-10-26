import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { NOTIFICATIONS_CHANGED, getUnreadCount } from '../api/notifications'
import { useAuth } from '../context/AuthContext'

// Jumlah notifikasi belum dibaca. Guest selalu 0 tanpa memanggil API (endpoint butuh token).
// Dimuat ulang saat pindah halaman dan saat ada notifikasi yang ditandai dibaca.
export function useUnreadNotifications() {
  const { isLoggedIn } = useAuth()
  const { pathname } = useLocation()
  const [count, setCount] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const bump = () => setTick((t) => t + 1)
    window.addEventListener(NOTIFICATIONS_CHANGED, bump)
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED, bump)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return undefined
    let cancelled = false
    getUnreadCount()
      .then((n) => !cancelled && setCount(n))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isLoggedIn, pathname, tick])

  return isLoggedIn ? count : 0
}
