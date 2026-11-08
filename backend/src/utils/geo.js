// Utilitas jarak dan jalur

const EARTH_RADIUS = 6371000
const rad = (deg) => (deg * Math.PI) / 180

// Jarak dua koordinat dalam meter (rumus haversine)
export function distanceMeters(lat1, lng1, lat2, lng2) {
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(a))
}

// Indeks titik jalur yang paling dekat dengan koordinat (membandingkan titik, bukan ruas)
export function nearestIndex(path, lat, lng) {
  let index = 0
  let best = Infinity
  path.forEach(([pLat, pLng], i) => {
    const d = distanceMeters(lat, lng, pLat, pLng)
    if (d < best) {
      best = d
      index = i
    }
  })
  return index
}
