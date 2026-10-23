import { Compass, Flag, Mountain, Sprout } from 'lucide-react'
import { VETERAN_MIN, WANDERER_MIN } from '../utils/elevationCategory'

// nama tingkat untuk lencana yang tingkatnya hanya dibedakan warna; lencana bertingkat I/II/III mengisi tierName sendiri
export const TIER_NAMES = { bronze: 'Perunggu', silver: 'Perak', gold: 'Emas', leaf: '' }

const fmt = (n) => n.toLocaleString('id-ID')

// Untuk menambah lencana, tambahkan satu objek di bawah.
// tiers harus urut dari terendah ke tertinggi, karena tingkat berikutnya dibaca dari urutan ini.
// metric membaca statistik dari getLogbookStats; hanya pendakian terverifikasi yang dihitung.
// image (opsional, per tingkat): file di public/badges. Tanpa image, lencana digambar otomatis dari icon + warna tier.
// Untuk memasang gambar lencana baru: taruh file di public/badges lalu isi image pada tingkatnya.

// satu kategori ketinggian: tingkat I = 1 pendakian, II = total 5, III = total 10 (di kategori itu)
const categoryTiers = (tier, slug) =>
  [
    { min: 1, tierName: 'I' },
    { min: 5, tierName: 'II' },
    { min: 10, tierName: 'III' },
  ].map((t, i) => ({ tier, ...t, label: t.tierName, image: IMAGES[`${slug}-${i + 1}`] }))

// gambar yang sudah tersedia; tingkat tanpa gambar memakai lencana gambar-otomatis
const IMAGES = {
  rookie: '/badges/rookie.webp',
  'beginner-1': '/badges/beginner-1.webp',
  'beginner-2': '/badges/beginner-2.webp',
  'beginner-3': '/badges/beginner-3.webp',
}

const describeCategory = (range) => (min) =>
  min === 1
    ? `menyelesaikan 1 pendakian terverifikasi di gunung ${range}`
    : `mengumpulkan total ${min} pendakian terverifikasi di gunung ${range}`

const trips = (value) => `${value} pendakian`

export const badgeCatalog = [
  {
    id: 'rookie',
    name: 'Rookie',
    icon: Flag,
    metric: (stats) => stats.verifiedTrips,
    describe: () => 'menyelesaikan pendakian pertamamu yang terverifikasi, di gunung mana pun',
    format: trips,
    tiers: [{ tier: 'leaf', min: 1, label: '', image: IMAGES.rookie }],
  },
  {
    id: 'beginner',
    name: 'Beginner',
    icon: Sprout,
    metric: (stats) => stats.verifiedByCategory.beginner,
    describe: describeCategory(`di bawah ${fmt(WANDERER_MIN)} mdpl`),
    format: trips,
    tiers: categoryTiers('bronze', 'beginner'),
  },
  {
    id: 'wanderer',
    name: 'Wanderer',
    icon: Compass,
    metric: (stats) => stats.verifiedByCategory.wanderer,
    describe: describeCategory(`setinggi ${fmt(WANDERER_MIN)} sampai ${fmt(VETERAN_MIN - 1)} mdpl`),
    format: trips,
    tiers: categoryTiers('silver', 'wanderer'),
  },
  {
    id: 'veteran',
    name: 'Veteran',
    icon: Mountain,
    metric: (stats) => stats.verifiedByCategory.veteran,
    describe: describeCategory(`setinggi ${fmt(VETERAN_MIN)} mdpl ke atas`),
    format: trips,
    tiers: categoryTiers('gold', 'veteran'),
  },
]
