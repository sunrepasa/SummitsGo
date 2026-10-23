import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../context/ToastContext'
import { downloadMapTiles, planDownload, removeOfflineMap, saveRouteData } from '../utils/offlineMaps'
import { getSavedMap, mapIdOf, putSavedMap } from '../utils/savedMaps'

// Unduh dan hapus peta offline satu jalur. Pakai key={mapId} di halaman agar state ikut berganti saat jalur berganti.
export function useMapDownload(routeMap) {
  const toast = useToast()
  const mapId = mapIdOf(routeMap.mountain.id, routeMap.route)
  const plan = useMemo(() => planDownload(routeMap.path), [routeMap])
  const [saved, setSaved] = useState(() => getSavedMap(mapId))
  const [phase, setPhase] = useState('idle') // 'idle' | 'downloading' | 'removing'
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const abortRef = useRef(null)

  // keluar dari halaman saat mengunduh = batalkan, supaya tidak ada unduhan yatim
  useEffect(() => () => abortRef.current?.abort(), [])

  const start = useCallback(async () => {
    const controller = new AbortController()
    abortRef.current = controller
    setPhase('downloading')
    setProgress({ done: 0, total: plan.count })
    try {
      const result = await downloadMapTiles({
        plan,
        signal: controller.signal,
        onProgress: (done, total) => setProgress({ done, total }),
      })
      const meta = {
        id: mapId,
        mountainId: routeMap.mountain.id,
        mountainName: routeMap.mountain.name,
        route: routeMap.route,
        bounds: plan.bounds,
        zMin: plan.zMin,
        zMax: plan.zMax,
        tileCount: result.tileCount,
        bytes: result.bytes,
        savedAt: new Date().toISOString(),
      }
      await saveRouteData(mapId, routeMap)
      putSavedMap(meta)
      setSaved(meta)
      toast.success('Peta tersimpan untuk dipakai offline')
    } catch (err) {
      if (err.name === 'AbortError') {
        toast.success('Unduhan peta dibatalkan')
      } else if (err.code === 'UNSUPPORTED') {
        toast.error('Browser ini tidak mendukung penyimpanan peta offline.')
      } else {
        toast.error('Gagal mengunduh peta. Periksa koneksi lalu coba lagi.')
      }
    } finally {
      abortRef.current = null
      setPhase('idle')
    }
  }, [plan, mapId, routeMap, toast])

  const cancel = useCallback(() => abortRef.current?.abort(), [])

  const remove = useCallback(async () => {
    if (!saved) return
    setPhase('removing')
    try {
      await removeOfflineMap(saved)
      setSaved(null)
      toast.success('Peta offline dihapus')
    } catch {
      toast.error('Gagal menghapus peta offline. Coba lagi.')
    } finally {
      setPhase('idle')
    }
  }, [saved, toast])

  return { plan, saved, phase, progress, start, cancel, remove }
}
