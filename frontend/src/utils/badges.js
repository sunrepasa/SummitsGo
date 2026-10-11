import { Compass, Flag, Mountain } from 'lucide-react'

const explorerTiers = [
  { min: 10, label: 'Penjelajah 10 Gunung' },
  { min: 5, label: 'Penjelajah 5 Gunung' },
  { min: 3, label: 'Penjelajah 3 Gunung' },
]

const elevationTiers = [
  { min: 3000, label: 'Pendaki 3.000+ mdpl' },
  { min: 2000, label: 'Pendaki 2.000+ mdpl' },
]

// tier diurutkan dari yang tertinggi, jadi find() otomatis mengambil yang paling tinggi dicapai
export function getBadges(stats) {
  const badges = []
  if (stats.trips >= 1) badges.push({ id: 'first', label: 'Pendakian Pertama', icon: Flag })

  const explorer = explorerTiers.find((t) => stats.climbed >= t.min)
  if (explorer) badges.push({ id: 'explorer', label: explorer.label, icon: Compass })

  const elevation = elevationTiers.find((t) => stats.highest >= t.min)
  if (elevation) badges.push({ id: 'elevation', label: elevation.label, icon: Mountain })

  return badges
}