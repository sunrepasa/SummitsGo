import { useCallback, useEffect, useRef, useState } from 'react'

const supported = () => typeof navigator !== 'undefined' && 'geolocation' in navigator

// Live Location: memantau posisi lewat Geolocation API (watchPosition).
// Hanya berjalan selama halaman ini terbuka dan layar aktif; browser menghentikannya saat tab di latar belakang,
// jadi ini bukan tracking terus-menerus.
// status: 'idle' | 'waiting' (menunggu izin / sinyal pertama) | 'active' | 'denied' | 'unavailable' | 'error'
export function useLiveLocation({ autoStart = false } = {}) {
  const [state, setState] = useState(() => ({
    status: !supported() ? 'unavailable' : autoStart ? 'waiting' : 'idle',
    position: null,
    weakSignal: false,
  }))
  const watchId = useRef(null)

  const clear = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  }, [])

  // hanya mendaftarkan pemantauan; state diubah dari callback (asynchronous)
  const begin = useCallback(() => {
    if (!supported() || watchId.current !== null) return
    watchId.current = navigator.geolocation.watchPosition(
      (pos) =>
        setState({
          status: 'active',
          weakSignal: false,
          position: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          },
        }),
      (err) => {
        // TIMEOUT (3): pemantauan tetap berjalan dan mencoba lagi sendiri, cukup tandai sinyal lemah
        if (err.code === err.TIMEOUT) {
          setState((s) => ({ ...s, weakSignal: true }))
          return
        }
        clear()
        setState({ status: err.code === err.PERMISSION_DENIED ? 'denied' : 'error', position: null, weakSignal: false })
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    )
  }, [clear])

  const start = useCallback(() => {
    if (!supported()) return
    setState({ status: 'waiting', position: null, weakSignal: false })
    begin()
  }, [begin])

  const stop = useCallback(() => {
    clear()
    setState({ status: supported() ? 'idle' : 'unavailable', position: null, weakSignal: false })
  }, [clear])

  useEffect(() => {
    if (autoStart) begin()
    return clear
    // autoStart hanya dibaca saat halaman dibuka
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ...state, start, stop }
}
