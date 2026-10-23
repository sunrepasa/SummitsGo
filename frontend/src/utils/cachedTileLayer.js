import L from 'leaflet'
import { readCachedTile } from './offlineMaps'

// Lapisan tile Leaflet yang memeriksa Cache API lebih dulu, baru jaringan. Dengan begitu peta yang
// sudah diunduh tetap tampil saat offline, juga di mode dev tanpa Service Worker.
const CachedTileLayer = L.TileLayer.extend({
  createTile(coords, done) {
    const tile = document.createElement('img')
    tile.alt = ''
    tile.setAttribute('role', 'presentation')
    const url = this.getTileUrl(coords)
    let objectUrl = null

    tile.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      done(null, tile)
    }
    tile.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      done(new Error('Tile gagal dimuat'), tile)
    }

    readCachedTile(url).then((blob) => {
      if (blob) objectUrl = URL.createObjectURL(blob)
      tile.src = objectUrl ?? url
    })
    return tile
  },
})

export const createCachedTileLayer = (urlTemplate, options) => new CachedTileLayer(urlTemplate, options)
