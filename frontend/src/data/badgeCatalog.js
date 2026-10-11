import { Compass, Flag, Mountain } from 'lucide-react'

export const TIER_NAMES = { bronze: 'Perunggu', silver: 'Perak', gold: 'Emas', leaf: '' }

const fmt = (n) => n.toLocaleString('id-ID')

// Untuk menambah lencana, tambahkan satu objek di bawah.
// tiers harus urut dari terendah ke tertinggi, karena tingkat berikutnya dibaca dari urutan ini.
// metric membaca statistik dari getLogbookStats; hanya pendakian terverifikasi yang dihitung.
export const badgeCatalog = [
  {
    id: 'first',
    name: 'Pendakian Pertama',
    icon: Flag,
    metric: (stats) => stats.verifiedTrips,
    describe: () => 'menyelesaikan satu pendakian yang terverifikasi',
    format: (value) => `${value} pendakian`,
    tiers: [{ tier: 'leaf', min: 1, label: '' }],
  },
  {
    id: 'explorer',
    name: 'Penjelajah Gunung',
    icon: Compass,
    metric: (stats) => stats.verifiedClimbed,
    describe: (min) => `mendaki ${min} gunung berbeda yang terverifikasi`,
    format: (value) => `${value} gunung`,
    tiers: [
      { tier: 'bronze', min: 3, label: '3' },
      { tier: 'silver', min: 5, label: '5' },
      { tier: 'gold', min: 10, label: '10' },
    ],
  },
  {
    id: 'elevation',
    name: 'Pendaki Ketinggian',
    icon: Mountain,
    metric: (stats) => stats.verifiedHighest,
    describe: (min) => `mendaki gunung setinggi ${fmt(min)} mdpl atau lebih yang terverifikasi`,
    format: (value) => `${fmt(value)} mdpl`,
    tiers: [
      { tier: 'bronze', min: 1000, label: '1000+' },
      { tier: 'silver', min: 2000, label: '2000+' },
      { tier: 'gold', min: 3000, label: '3000+' },
    ],
  },
]