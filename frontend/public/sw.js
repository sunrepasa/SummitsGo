// Service Worker SummitsGo: membuat aplikasi bisa dibuka tanpa internet.
// - Halaman (navigasi): jaringan dulu; bila gagal pakai salinan terakhir "/" (SPA, semua rute memakai index.html yang sama).
// - File statis satu domain (JS, CSS, gambar): pakai salinan cache sambil diperbarui di latar belakang.
// - Font Google: sama seperti file statis.
// Tile peta TIDAK diurus di sini; disimpan dan dibaca langsung oleh halaman lewat Cache API (utils/offlineMaps.js),
// dan cache tile ("summitsgo-tiles-*") jangan sampai terhapus oleh pembersihan versi di bawah.
const SHELL_CACHE = 'summitsgo-shell-v1'
const KEEP_PREFIXES = ['summitsgo-tiles-', 'summitsgo-routes-']
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add('/'))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && !KEEP_PREFIXES.some((prefix) => key.startsWith(prefix)))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

async function navigate(request) {
  const cache = await caches.open(SHELL_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put('/', response.clone())
    return response
  } catch {
    const cached = await cache.match('/')
    if (cached) return cached
    throw new Error('Offline dan belum ada salinan halaman')
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(SHELL_CACHE)
  const cached = await cache.match(request)
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok || response.type === 'opaque') cache.put(request, response.clone())
      return response
    })
    .catch(() => null)
  return cached ?? (await refresh) ?? Response.error()
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(navigate(request))
    return
  }
  const sameOrigin = url.origin === self.location.origin
  if (sameOrigin && !url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request))
  }
})
