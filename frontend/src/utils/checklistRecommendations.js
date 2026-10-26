// Saran barang berbasis aturan sederhana ("jika kondisi X maka sarankan Y"), bukan hasil AI.
// icon: kunci yang dipetakan ke ikon di komponen.

const normalize = (s) => s.trim().toLowerCase()

function maxHours(estimate) {
  const numbers = estimate?.match(/\d+/g)?.map(Number)
  return numbers?.length ? Math.max(...numbers) : null
}

export function buildRecommendations({ mountain, details, route, items }) {
  const suggestions = []

  if (mountain.elevation >= 2500) {
    suggestions.push({
      key: 'jacket',
      icon: 'jacket',
      text: 'Jaket tebal/thermal — suhu bisa di bawah 10°C',
      name: 'Jaket tebal / thermal',
      category: 'Pakaian',
    })
  }

  const posts = details?.routes?.find((r) => r.name === route)?.posts ?? []
  const lastWater = posts.filter((p) => p.facilities.includes('water')).at(-1)
  if (lastWater) {
    suggestions.push({
      key: 'water',
      icon: 'water',
      text: `Air ekstra, sumber air terakhir di ${lastWater.name}`,
      name: 'Air minum ekstra',
      category: 'Memasak & Logistik',
    })
  }

  const hours = maxHours(details?.estimate)
  if (hours && hours >= 8) {
    suggestions.push({
      key: 'battery',
      icon: 'battery',
      text: `Power bank tambahan — durasi tempuh ${details.estimate}`,
      name: 'Power bank tambahan',
      category: 'Elektronik',
    })
  }

  // saran yang sudah ada di daftar tidak ditampilkan lagi
  const existing = new Set(items.map((i) => normalize(i.name)))
  return suggestions.filter((s) => !existing.has(normalize(s.name)))
}
