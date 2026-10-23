const EARTH_RADIUS = 6371000
const rad = (deg) => (deg * Math.PI) / 180

export function distanceMeters(lat1, lng1, lat2, lng2) {
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(a))
}

// Titik jalur terdekat dari posisi. Hanya membandingkan titik (vertex), jadi jalur dari backend
// harus cukup rapat (puluhan meter antar titik) agar hasilnya akurat.
export function nearestOnPath(path, lat, lng) {
  let index = 0
  let distance = Infinity
  path.forEach(([pLat, pLng], i) => {
    const d = distanceMeters(lat, lng, pLat, pLng)
    if (d < distance) {
      distance = d
      index = i
    }
  })
  return { index, distance }
}

// lebih dari ini dianggap meninggalkan jalur / terlalu jauh dari gunung untuk dipandu
export const OFF_ROUTE_METERS = 150
export const FAR_AWAY_METERS = 5000

// Posisi pendaki relatif terhadap jalur: pos berikutnya dan jarak lurus ke sana.
export function computeNavigation(routeMap, position) {
  const { index, distance: offRoute } = nearestOnPath(routeMap.path, position.lat, position.lng)
  const next = routeMap.checkpoints.find((c) => c.pathIndex > index) ?? null
  return {
    offRoute,
    isFar: offRoute > FAR_AWAY_METERS,
    isOffRoute: offRoute > OFF_ROUTE_METERS,
    atSummit: next === null,
    next,
    nextDistance: next ? distanceMeters(position.lat, position.lng, next.lat, next.lng) : null,
  }
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} m`
  const km = meters / 1000
  return `${km.toLocaleString('id-ID', { maximumFractionDigits: km >= 100 ? 0 : 1 })} km`
}

export function formatAgo(timestamp, now) {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000))
  if (seconds < 15) return 'baru saja'
  if (seconds < 60) return `${seconds} detik lalu`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} menit lalu`
  return `${Math.round(minutes / 60)} jam lalu`
}

export function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1048576).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`
}

export function boundsOf(path) {
  const lats = path.map((p) => p[0])
  const lngs = path.map((p) => p[1])
  return { south: Math.min(...lats), north: Math.max(...lats), west: Math.min(...lngs), east: Math.max(...lngs) }
}

export function padBounds(b, ratio) {
  const dLat = (b.north - b.south) * ratio
  const dLng = (b.east - b.west) * ratio
  return { south: b.south - dLat, north: b.north + dLat, west: b.west - dLng, east: b.east + dLng }
}

// --- tile peta (skema XYZ / Web Mercator) ---
const MAX_LAT = 85.0511
const tileX = (lng, z) => Math.floor(((lng + 180) / 360) * 2 ** z)
function tileY(lat, z) {
  const r = rad(Math.max(-MAX_LAT, Math.min(MAX_LAT, lat)))
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z)
}

function tileRange(b, z) {
  return { x0: tileX(b.west, z), x1: tileX(b.east, z), y0: tileY(b.north, z), y1: tileY(b.south, z) }
}

export function countTiles(b, zMin, zMax) {
  let total = 0
  for (let z = zMin; z <= zMax; z++) {
    const r = tileRange(b, z)
    total += (r.x1 - r.x0 + 1) * (r.y1 - r.y0 + 1)
  }
  return total
}

export function tilesForBounds(b, zMin, zMax) {
  const tiles = []
  for (let z = zMin; z <= zMax; z++) {
    const r = tileRange(b, z)
    for (let x = r.x0; x <= r.x1; x++) {
      for (let y = r.y0; y <= r.y1; y++) tiles.push({ z, x, y })
    }
  }
  return tiles
}
