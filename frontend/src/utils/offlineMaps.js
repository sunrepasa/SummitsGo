import { boundsOf, countTiles, padBounds, tilesForBounds } from './geo'
import { deleteSavedMap, getSavedMaps } from './savedMaps'

// Sumber tile bisa diganti lewat env. Template hanya boleh memakai {z}, {x}, {y} (tanpa {s} / {r})
// karena URL yang sama dipakai sebagai kunci Cache API.
// PENTING: server tile gratis OpenStreetMap melarang unduhan massal. Area satu jalur masih wajar untuk
// pengembangan dan demo, tetapi untuk produksi pakai penyedia tile yang mengizinkan penyimpanan offline.
export const TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION = import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; OpenStreetMap'

export const MAP_MIN_ZOOM = 11
export const MAP_MAX_ZOOM = 16

const CACHE_NAME = 'summitsgo-tiles-v1'
const DOWNLOAD_MIN_ZOOM = 12
const MAX_TILES = 700
const AVG_TILE_BYTES = 18 * 1024
const CONCURRENCY = 4
// area unduhan dilebihkan sedikit dari kotak jalur supaya tepi jalur tidak terpotong
const PADDING_RATIO = 0.15

const codedError = (message, code) => Object.assign(new Error(message), { code })

export const tileUrl = ({ z, x, y }) => TILE_URL.replace('{z}', z).replace('{x}', x).replace('{y}', y)

export const supportsOfflineMaps = () => typeof window !== 'undefined' && 'caches' in window

// Rencana unduhan untuk sebuah jalur. Zoom tertinggi diturunkan bila jumlah tile melebihi batas.
export function planDownload(path) {
  const bounds = padBounds(boundsOf(path), PADDING_RATIO)
  let zMax = MAP_MAX_ZOOM
  while (zMax > DOWNLOAD_MIN_ZOOM && countTiles(bounds, DOWNLOAD_MIN_ZOOM, zMax) > MAX_TILES) zMax--
  const count = countTiles(bounds, DOWNLOAD_MIN_ZOOM, zMax)
  return { bounds, zMin: DOWNLOAD_MIN_ZOOM, zMax, count, estimatedBytes: count * AVG_TILE_BYTES }
}

// Tile dari cache bila ada (dipakai CachedTileLayer); null berarti ambil dari jaringan.
export async function readCachedTile(url) {
  if (!supportsOfflineMaps()) return null
  try {
    const cache = await caches.open(CACHE_NAME)
    const res = await cache.match(url)
    return res ? await res.blob() : null
  } catch {
    return null
  }
}

// Mengunduh semua tile rencana ke Cache API. Bila dibatalkan atau terlalu banyak yang gagal,
// tile yang baru ditambahkan di proses ini dibuang lagi supaya tidak ada peta setengah jadi.
export async function downloadMapTiles({ plan, onProgress, signal }) {
  if (!supportsOfflineMaps()) throw codedError('Browser tidak mendukung penyimpanan offline', 'UNSUPPORTED')

  // minta penyimpanan permanen agar browser tidak menghapus peta saat ruang menipis (boleh ditolak)
  navigator.storage?.persist?.().catch(() => {})

  const cache = await caches.open(CACHE_NAME)
  const tiles = tilesForBounds(plan.bounds, plan.zMin, plan.zMax)
  const added = []
  let cursor = 0
  let done = 0
  let failed = 0
  let bytes = 0

  const worker = async () => {
    while (cursor < tiles.length && !signal?.aborted) {
      const url = tileUrl(tiles[cursor++])
      try {
        if (!(await cache.match(url))) {
          const res = await fetch(url, { mode: 'cors', signal })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          bytes += Number(res.headers.get('content-length')) || AVG_TILE_BYTES
          await cache.put(url, res)
          added.push(url)
        }
      } catch {
        if (signal?.aborted) return
        failed++
      }
      done++
      onProgress?.(done, tiles.length)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const tooManyFailed = failed > tiles.length * 0.05
  if (signal?.aborted || tooManyFailed) {
    await Promise.all(added.map((url) => cache.delete(url)))
    throw signal?.aborted
      ? Object.assign(new Error('Dibatalkan'), { name: 'AbortError' })
      : codedError('Sebagian peta gagal diunduh', 'NETWORK')
  }
  return { tileCount: tiles.length, bytes: bytes || tiles.length * AVG_TILE_BYTES }
}

// Menghapus tile milik satu peta, kecuali tile yang juga dipakai peta tersimpan lain (area jalur bisa tumpang tindih).
export async function removeMapTiles(meta, otherMaps = []) {
  if (!supportsOfflineMaps()) return
  const keep = new Set(
    otherMaps.flatMap((m) => tilesForBounds(m.bounds, m.zMin, m.zMax).map(tileUrl)),
  )
  const cache = await caches.open(CACHE_NAME)
  await Promise.all(
    tilesForBounds(meta.bounds, meta.zMin, meta.zMax)
      .map(tileUrl)
      .filter((url) => !keep.has(url))
      .map((url) => cache.delete(url)),
  )
}

// --- data jalur offline ---
// Garis jalur dan titik pos juga disimpan agar halaman peta bisa dibuka tanpa internet
// (di mode API sungguhan, data ini datang dari server). Disimpan di Cache API, bukan localStorage, karena ukurannya bisa besar.
const ROUTE_CACHE = 'summitsgo-routes-v1'
const routeKey = (id) => `/__offline/route-map/${encodeURIComponent(id)}`

export async function saveRouteData(id, data) {
  if (!supportsOfflineMaps()) return
  try {
    const cache = await caches.open(ROUTE_CACHE)
    await cache.put(routeKey(id), new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }))
  } catch {
    // gagal menyimpan data jalur tidak membatalkan unduhan peta
  }
}

export async function readRouteData(id) {
  if (!supportsOfflineMaps()) return null
  try {
    const cache = await caches.open(ROUTE_CACHE)
    const res = await cache.match(routeKey(id))
    return res ? await res.json() : null
  } catch {
    return null
  }
}

// Menghapus satu peta offline seutuhnya: tile, data jalur, dan catatannya.
export async function removeOfflineMap(meta) {
  await removeMapTiles(meta, getSavedMaps().filter((m) => m.id !== meta.id))
  if (supportsOfflineMaps()) {
    try {
      await (await caches.open(ROUTE_CACHE)).delete(routeKey(meta.id))
    } catch {
      // data jalur yatim tidak berbahaya
    }
  }
  deleteSavedMap(meta.id)
}
