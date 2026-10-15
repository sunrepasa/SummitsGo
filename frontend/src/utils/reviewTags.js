// tag cepat pada ulasan; id disimpan di data, label ditampilkan ke pengguna
export const REVIEW_TAGS = [
  { id: 'crowded', label: 'Ramai' },
  { id: 'slippery', label: 'Jalur Licin' },
  { id: 'scenic', label: 'Pemandangan Bagus' },
  { id: 'dry-water', label: 'Sumber Air Kering' },
  { id: 'beginner-friendly', label: 'Cocok Pemula' },
]

export const reviewTagLabel = (id) => REVIEW_TAGS.find((t) => t.id === id)?.label
