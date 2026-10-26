import { distanceMeters } from '../utils/geo'

// Data peta jalur (mock). Koordinat di bawah hanya PERKIRAAN KASAR untuk keperluan demo, bukan survei
// jalur sungguhan. Di backend sungguhan, path dan koordinat pos diisi admin/tim SummitsGo.
// Nama pos harus sama dengan nama di mountainDetails agar fasilitas dan jarak ikut tergabung.

const STEP_METERS = 45

// Membuat jalur rapat (titik tiap ±45 m) dari titik-titik penting, dengan sedikit kelokan supaya
// terlihat seperti jalur setapak. Mengembalikan jalur dan indeks tiap titik penting di dalamnya.
function buildPath(points, wobble = 0.00018) {
  const path = []
  const indexes = []
  points.forEach((a, i) => {
    indexes.push(path.length)
    const b = points[i + 1]
    if (!b) {
      path.push([a.lat, a.lng])
      return
    }
    const steps = Math.max(2, Math.ceil(distanceMeters(a.lat, a.lng, b.lat, b.lng) / STEP_METERS))
    // arah tegak lurus segmen, dipakai untuk menggeser titik ke samping
    const dLat = b.lat - a.lat
    const dLng = b.lng - a.lng
    const len = Math.hypot(dLat, dLng)
    const nLat = -dLng / len
    const nLng = dLat / len
    for (let k = 0; k < steps; k++) {
      const t = k / steps
      const bend = wobble * Math.sin(Math.PI * t) * Math.sin(k * 0.55 + i * 1.7)
      path.push([a.lat + dLat * t + nLat * bend, a.lng + dLng * t + nLng * bend])
    }
  })
  return { path, indexes }
}

const routes = {
  'merbabu:Selo': {
    summitName: 'Puncak Kenteng Songo',
    points: [
      { type: 'basecamp', lat: -7.499, lng: 110.448 },
      { type: 'post', name: 'Pos 1', lat: -7.4935, lng: 110.446 },
      { type: 'post', name: 'Pos 2', lat: -7.487, lng: 110.444 },
      { type: 'post', name: 'Sabana 1', lat: -7.477, lng: 110.4425 },
      { type: 'post', name: 'Sabana 2', lat: -7.4665, lng: 110.4412 },
      { type: 'summit', lat: -7.4553, lng: 110.4402 },
    ],
  },
  'rinjani:Sembalun': {
    summitName: 'Puncak Rinjani',
    points: [
      { type: 'basecamp', lat: -8.368, lng: 116.52 },
      { type: 'post', name: 'Pos 1', lat: -8.38, lng: 116.509 },
      { type: 'post', name: 'Pos 2', lat: -8.393, lng: 116.493 },
      { type: 'post', name: 'Pos 3', lat: -8.402, lng: 116.478 },
      { type: 'summit', lat: -8.4113, lng: 116.4573 },
    ],
  },
  'semeru:Ranu Pani': {
    summitName: 'Puncak Mahameru',
    points: [
      { type: 'basecamp', lat: -8.0143, lng: 112.919 },
      { type: 'post', name: 'Pos 1', lat: -8.023, lng: 112.914 },
      { type: 'post', name: 'Ranu Kumbolo', lat: -8.0458, lng: 112.922 },
      { type: 'post', name: 'Kalimati', lat: -8.078, lng: 112.925 },
      { type: 'post', name: 'Arcopodo', lat: -8.095, lng: 112.927 },
      { type: 'summit', lat: -8.1078, lng: 112.9225 },
    ],
  },
}

// Hasil: { path, checkpoints: [{ type, name?, lat, lng, pathIndex }] } atau undefined bila jalur belum dipetakan
export function getRouteGeometry(mountainId, routeName) {
  const def = routes[`${mountainId}:${routeName}`]
  if (!def) return undefined
  const { path, indexes } = buildPath(def.points)
  return {
    summitName: def.summitName,
    path,
    checkpoints: def.points.map((p, i) => ({ ...p, pathIndex: indexes[i] })),
  }
}
