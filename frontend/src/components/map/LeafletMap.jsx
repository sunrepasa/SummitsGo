import { useEffect, useImperativeHandle, useRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { facilityIcon } from '../mountain/detail/facilityMeta'
import { createCachedTileLayer } from '../../utils/cachedTileLayer'
import { MAP_MAX_ZOOM, MAP_MIN_ZOOM, TILE_ATTRIBUTION, TILE_URL } from '../../utils/offlineMaps'
import { facilityLabel } from '../../utils/mountainDetail'

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const isDesktop = () => window.matchMedia('(min-width: 768px)').matches

// ruang yang tertutup panel: kiri di desktop, bawah (kartu) dan atas (bar) di mobile
const fitOptions = () =>
  isDesktop()
    ? { paddingTopLeft: [380, 40], paddingBottomRight: [60, 40] }
    : { paddingTopLeft: [28, 96], paddingBottomRight: [28, 250] }

function facilityMarkup(type) {
  const Icon = facilityIcon[type]
  const warn = type === 'blankspot' || type === 'danger'
  return `<span class="sg-fac${warn ? ' warn' : ''}">${renderToStaticMarkup(<Icon size={11} />)}</span>`
}

function checkpointIcon(c) {
  const icons = (c.facilities ?? []).map(facilityMarkup).join('')
  return L.divIcon({
    className: 'sg-marker',
    iconSize: [0, 0],
    html: `<div class="sg-pin ${c.type}"></div><div class="sg-label">${escapeHtml(c.name)}${icons}</div>`,
  })
}

function popupHtml(c) {
  const facilities = (c.facilities ?? []).map((f) => facilityLabel[f]).join(', ')
  const lines = [
    `<b>${escapeHtml(c.name)}</b>`,
    c.distance ? `${escapeHtml(c.distance)} dari basecamp · ${escapeHtml(c.duration ?? '')}` : null,
    facilities ? escapeHtml(facilities) : null,
    c.dangerNote ? `Waspada: ${escapeHtml(c.dangerNote)}` : null,
  ]
  return lines.filter(Boolean).join('<br>')
}

// Peta Leaflet: lapisan tile (cache dulu), garis jalur, titik pos, dan titik biru posisi pengguna.
// Dikendalikan lewat ref: fitRoute(), flyToUser(), focusPoint(lat, lng). Mengembalikan false bila belum ada posisi.
export default function LeafletMap({ routeMap, user, className = '', ref }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const routeLayerRef = useRef(null)
  const userLayerRef = useRef(null)

  useImperativeHandle(ref, () => ({
    fitRoute() {
      const map = mapRef.current
      if (map) map.fitBounds(L.latLngBounds(routeMap.path), fitOptions())
    },
    flyToUser() {
      const layer = userLayerRef.current
      if (!mapRef.current || !layer) return false
      mapRef.current.flyTo(layer.marker.getLatLng(), Math.max(mapRef.current.getZoom(), 15))
      return true
    },
    focusPoint(lat, lng) {
      mapRef.current?.flyTo([lat, lng], Math.max(mapRef.current.getZoom(), 15))
    },
  }))

  // peta dibuat sekali
  useEffect(() => {
    const map = L.map(containerRef.current, {
      zoomControl: false,
      minZoom: MAP_MIN_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
    })
    map.attributionControl.setPrefix(false)
    createCachedTileLayer(TILE_URL, {
      minZoom: MAP_MIN_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
      attribution: TILE_ATTRIBUTION,
    }).addTo(map)
    L.control.zoom({ position: 'bottomright', zoomInTitle: 'Perbesar', zoomOutTitle: 'Perkecil' }).addTo(map)

    mapRef.current = map
    routeLayerRef.current = L.layerGroup().addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
      routeLayerRef.current = null
      userLayerRef.current = null
    }
  }, [])

  // garis jalur dan titik-titiknya digambar ulang saat data jalur berganti
  useEffect(() => {
    const map = mapRef.current
    const group = routeLayerRef.current
    if (!map || !group) return
    group.clearLayers()

    // garis putih tipis di bawah garis jalur supaya tetap terbaca di atas peta yang ramai
    L.polyline(routeMap.path, { color: '#fff', weight: 8, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }).addTo(group)
    L.polyline(routeMap.path, { color: '#1F3A2E', weight: 4, opacity: 0.9, dashArray: '2 8', lineCap: 'round', lineJoin: 'round' }).addTo(group)

    routeMap.checkpoints.forEach((c) => {
      L.marker([c.lat, c.lng], { icon: checkpointIcon(c), title: c.name, keyboard: false })
        .bindPopup(popupHtml(c))
        .addTo(group)
    })

    map.fitBounds(L.latLngBounds(routeMap.path), fitOptions())
  }, [routeMap])

  // titik biru posisi pengguna
  const lat = user?.lat
  const lng = user?.lng
  const accuracy = user?.accuracy
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const layer = userLayerRef.current

    if (lat === undefined) {
      layer?.group.remove()
      userLayerRef.current = null
      return
    }
    if (layer) {
      layer.marker.setLatLng([lat, lng])
      layer.circle.setLatLng([lat, lng])
      layer.circle.setRadius(accuracy ?? 0)
      return
    }
    const group = L.layerGroup().addTo(map)
    const circle = L.circle([lat, lng], {
      radius: accuracy ?? 0,
      color: '#2E6FE0',
      weight: 1,
      fillColor: '#2E6FE0',
      fillOpacity: 0.12,
      interactive: false,
    }).addTo(group)
    const marker = L.marker([lat, lng], {
      icon: L.divIcon({ className: 'sg-marker', iconSize: [0, 0], html: '<div class="sg-me"></div>' }),
      interactive: false,
      keyboard: false,
      zIndexOffset: 1000,
    }).addTo(group)
    userLayerRef.current = { group, circle, marker }
  }, [lat, lng, accuracy])

  return <div ref={containerRef} className={`isolate ${className}`} aria-label="Peta jalur pendakian" />
}
