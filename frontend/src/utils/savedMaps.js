const SAVED_MAPS_KEY = 'summitsgo_saved_maps'

// sementara: daftar id di localStorage; diganti catatan peta unduhan sungguhan saat fitur Cache API dibuat
export function getSavedMapIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVED_MAPS_KEY))
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}