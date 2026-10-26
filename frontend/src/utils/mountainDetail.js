export const facilityLabel = {
  water: 'Sumber Air',
  camp: 'Area Camp',
  blankspot: 'Blank Spot',
  danger: 'Titik Bahaya',
}

// urutan tampil di bagian Fasilitas & Peringatan
export const facilityOrder = ['water', 'camp', 'blankspot', 'danger']
export const warningFacilities = ['blankspot', 'danger']

// "Jawa Tengah, Jawa Tengah" terlihat janggal, jadi nama yang sama ditampilkan sekali
export function formatLocation(m) {
  if (!m.province || m.province === m.location) return m.location
  return `${m.location}, ${m.province}`
}

export const formatPrice = (value) => `Rp ${value.toLocaleString('id-ID')}`

export const whatsappUrl = (number) => `https://wa.me/${number}`
export const telUrl = (number) => `tel:${number}`

// Mengelompokkan pos dari semua jalur per jenis fasilitas.
// Hasil: [{ type, items: ['Pos 3 (Sembalun)', ...] }], jenis tanpa pos tidak ikut.
export function groupFacilities(routes = []) {
  return facilityOrder
    .map((type) => {
      const items = routes.flatMap((route) =>
        route.posts
          .filter((p) => p.facilities.includes(type))
          .map((p) => {
            const base = `${p.name} (${route.name})`
            return type === 'danger' && p.dangerNote ? `${base}: ${p.dangerNote}` : base
          }),
      )
      return { type, items }
    })
    .filter((group) => group.items.length > 0)
}
