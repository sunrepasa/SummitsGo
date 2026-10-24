import { VETERAN_MIN, WANDERER_MIN } from '../utils/elevationCategory'

const fmt = (n) => n.toLocaleString('id-ID')

// Untuk menambah lencana, tambahkan satu objek di bawah.
// tiers harus urut dari terendah ke tertinggi, karena tingkat berikutnya dibaca dari urutan ini.
// metric membaca statistik dari getLogbookStats; hanya pendakian terverifikasi yang dihitung.
// image: file gambar tingkat itu di public/badges. Lencana yang tingkatnya belum punya gambar belum ditampilkan
// (tidak muncul di profil maupun galeri pilihan) walau syaratnya sudah terpenuhi.
// Untuk memasang gambar baru: taruh file di public/badges lalu isi IMAGES di bawah.

// satu kategori ketinggian: tingkat I = 1 gunung, II = total 5, III = total 10 gunung berbeda (di kategori itu)
const categoryTiers = (slug) =>
  [
    { min: 1, tierName: 'I' },
    { min: 5, tierName: 'II' },
    { min: 10, tierName: 'III' },
  ].map((t, i) => ({ ...t, image: IMAGES[`${slug}-${i + 1}`] }))

// gambar yang sudah tersedia
const IMAGES = {
  rookie: '/badges/rookie.webp',
  'beginner-1': '/badges/beginner-1.webp',
  'beginner-2': '/badges/beginner-2.webp',
  'beginner-3': '/badges/beginner-3.webp',
}

const describeCategory = (range) => (min) =>
  min === 1
    ? `mendaki 1 gunung ${range} (terverifikasi)`
    : `mendaki total ${min} gunung berbeda ${range} (terverifikasi)`

const trips = (value) => `${value} pendakian`
const mountainsCount = (value) => `${value} gunung`

export const badgeCatalog = [
  {
    id: 'rookie',
    name: 'Rookie',
    metric: (stats) => stats.verifiedTrips,
    describe: () => 'menyelesaikan pendakian pertamamu yang terverifikasi, di gunung mana pun',
    format: trips,
    tiers: [{ min: 1, tierName: '', image: IMAGES.rookie }],
  },
  {
    id: 'beginner',
    name: 'Beginner',
    metric: (stats) => stats.verifiedByCategory.beginner,
    describe: describeCategory(`di bawah ${fmt(WANDERER_MIN)} mdpl`),
    format: mountainsCount,
    tiers: categoryTiers('beginner'),
  },
  {
    id: 'wanderer',
    name: 'Wanderer',
    metric: (stats) => stats.verifiedByCategory.wanderer,
    describe: describeCategory(`setinggi ${fmt(WANDERER_MIN)} sampai ${fmt(VETERAN_MIN - 1)} mdpl`),
    format: mountainsCount,
    tiers: categoryTiers('wanderer'),
  },
  {
    id: 'veteran',
    name: 'Veteran',
    metric: (stats) => stats.verifiedByCategory.veteran,
    describe: describeCategory(`setinggi ${fmt(VETERAN_MIN)} mdpl ke atas`),
    format: mountainsCount,
    tiers: categoryTiers('veteran'),
  },
]
