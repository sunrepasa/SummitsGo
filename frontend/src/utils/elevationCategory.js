// Kategori ketinggian untuk lencana. Batas atas Wanderer sengaja dibuat 2.999 (bukan 2.900) supaya tidak ada
// gunung di rentang 2.900-3.000 mdpl yang jatuh di antara dua kategori; 3.000 mdpl pas masuk Veteran.
export const WANDERER_MIN = 1500
export const VETERAN_MIN = 3000

export function elevationCategory(elevation) {
  if (elevation < WANDERER_MIN) return 'beginner'
  if (elevation < VETERAN_MIN) return 'wanderer'
  return 'veteran'
}
