export const POPOVER_WIDTH = 260

const EDGE = 12
const HEIGHT_ESTIMATE = 250

// tinggi popup belum diketahui saat dihitung, jadi dipakai perkiraan; saat ditaruh di atas
// ia ditambatkan lewat "bottom" supaya tidak perlu tahu tinggi aslinya
export function popoverPosition(rect) {
  const left = Math.min(
    Math.max(rect.left + rect.width / 2 - POPOVER_WIDTH / 2, EDGE),
    window.innerWidth - POPOVER_WIDTH - EDGE,
  )
  const fitsBelow = window.innerHeight - rect.bottom > HEIGHT_ESTIMATE + EDGE
  return fitsBelow
    ? { left, top: rect.bottom + 8 }
    : { left, bottom: window.innerHeight - rect.top + 8 }
}