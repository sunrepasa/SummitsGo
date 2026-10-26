import { useSyncExternalStore } from 'react'

const subscribe = (callback) => {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

// navigator.onLine hanya menandakan ada/tidaknya koneksi jaringan, bukan jaminan internet benar-benar jalan
export const useOnlineStatus = () =>
  useSyncExternalStore(subscribe, () => navigator.onLine, () => true)
