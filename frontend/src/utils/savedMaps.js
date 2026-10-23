const SAVED_MAPS_KEY = 'summitsgo_saved_maps'

// Catatan peta yang sudah diunduh. Gambar tile-nya ada di Cache API (lihat offlineMaps.js);
// di sini hanya metadata kecil agar daftar "Peta Tersimpan" bisa tampil tanpa membuka cache.
// Satu catatan per jalur: { id: 'merbabu:Selo', mountainId, mountainName, route, bounds, zMin, zMax, tileCount, bytes, savedAt }
export function getSavedMaps() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVED_MAPS_KEY))
    return Array.isArray(raw) ? raw.filter((m) => m && typeof m === 'object' && m.id) : []
  } catch {
    return []
  }
}

const write = (list) => {
  try {
    localStorage.setItem(SAVED_MAPS_KEY, JSON.stringify(list))
  } catch {
    // penyimpanan penuh atau diblokir: peta tetap ada di cache, hanya catatannya yang tidak tersimpan
  }
}

export const mapIdOf = (mountainId, route) => `${mountainId}:${route}`

export const getSavedMap = (id) => getSavedMaps().find((m) => m.id === id) ?? null

export function putSavedMap(meta) {
  write([...getSavedMaps().filter((m) => m.id !== meta.id), meta])
}

export function deleteSavedMap(id) {
  write(getSavedMaps().filter((m) => m.id !== id))
}

// id gunung yang punya minimal satu peta tersimpan (dipakai filter "Peta diunduh" di Cari)
export const getSavedMapIds = () => [...new Set(getSavedMaps().map((m) => m.mountainId))]
