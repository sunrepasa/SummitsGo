export const POSTER_WIDTH = 270
export const POSTER_HEIGHT = 480
// 270x480 x 4 = 1080x1920, ukuran story Instagram/WhatsApp
const PIXEL_RATIO = 4

// html-to-image dimuat saat dibutuhkan saja, supaya tidak menambah ukuran bundle awal
export async function posterToBlob(node) {
  const { toBlob } = await import('html-to-image')
  const blob = await toBlob(node, {
    pixelRatio: PIXEL_RATIO,
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    cacheBust: true,
  })
  if (!blob) throw new Error('POSTER_RENDER_FAILED')
  return blob
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // ditunda agar unduhan sempat dimulai sebelum URL dicabut
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const posterFilename = (mountainName, route) =>
  `summitsgo-${mountainName}-${route}`
    .toLowerCase()
    .replace(/^summitsgo-gunung-/, 'summitsgo-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '.png'
