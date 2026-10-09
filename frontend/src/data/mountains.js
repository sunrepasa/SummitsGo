// cover sementara berupa gradien; diganti URL foto saat backend sudah menyimpan gambar
const covers = {
  forest: ['#3E6B54', '#16281F'],
  sky: ['#5A7A8C', '#1F343E'],
  earth: ['#7A5A3E', '#2A1E14'],
  moss: ['#4A5A3E', '#1A2314'],
  dusk: ['#6B4E6B', '#241A26'],
}

export const mountains = [
  { id: 'rinjani', name: 'Gunung Rinjani', location: 'Lombok', elevation: 3726, difficulty: 'medium', status: 'quota_full', rating: 4.8, reviewCount: 340, popularity: 1200, addedAt: '2026-06-10', cover: covers.sky },
  { id: 'semeru', name: 'Gunung Semeru', location: 'Jawa Timur', elevation: 3676, difficulty: 'hard', status: 'open', rating: 4.7, reviewCount: 210, popularity: 980, addedAt: '2026-06-12', cover: covers.forest },
  { id: 'prau', name: 'Gunung Prau', location: 'Wonosobo', elevation: 2565, difficulty: 'beginner', status: 'open', rating: 4.7, reviewCount: 312, popularity: 730, addedAt: '2026-06-20', cover: covers.earth },
  { id: 'merbabu', name: 'Gunung Merbabu', location: 'Jawa Tengah', elevation: 3145, difficulty: 'medium', status: 'open', rating: 4.6, reviewCount: 128, popularity: 575, addedAt: '2026-07-01', cover: covers.forest },
  { id: 'andong', name: 'Gunung Andong', location: 'Magelang', elevation: 1653, difficulty: 'beginner', status: 'open', rating: 4.5, reviewCount: 98, popularity: 430, addedAt: '2026-07-20', cover: covers.moss },
  { id: 'bromo', name: 'Gunung Bromo', location: 'Jawa Timur', elevation: 2329, difficulty: 'beginner', status: 'open', rating: 4.9, reviewCount: 455, popularity: 410, addedAt: '2026-08-30', cover: covers.moss },
  { id: 'ijen', name: 'Gunung Ijen', location: 'Banyuwangi', elevation: 2443, difficulty: 'medium', status: 'open', rating: 4.8, reviewCount: 289, popularity: 380, addedAt: '2026-09-20', cover: covers.earth },
  { id: 'papandayan', name: 'Gunung Papandayan', location: 'Garut', elevation: 2665, difficulty: 'beginner', status: 'open', rating: 4.6, reviewCount: 156, popularity: 350, addedAt: '2026-08-12', cover: covers.sky },
  { id: 'lawu', name: 'Gunung Lawu', location: 'Jawa Tengah', elevation: 3265, difficulty: 'medium', status: 'open', rating: 4.6, reviewCount: 167, popularity: 300, addedAt: '2026-09-28', cover: covers.earth },
  { id: 'gede', name: 'Gunung Gede', location: 'Jawa Barat', elevation: 2958, difficulty: 'medium', status: 'quota_full', rating: 4.5, reviewCount: 201, popularity: 280, addedAt: '2026-09-10', cover: covers.sky },
  { id: 'sindoro', name: 'Gunung Sindoro', location: 'Temanggung', elevation: 3153, difficulty: 'medium', status: 'open', rating: 4.4, reviewCount: 77, popularity: 200, addedAt: '2026-10-02', cover: covers.dusk },
  { id: 'telomoyo', name: 'Gunung Telomoyo', location: 'Magelang', elevation: 2211, difficulty: 'beginner', status: 'open', rating: 4.3, reviewCount: 54, popularity: 90, addedAt: '2026-09-15', cover: covers.moss },
]

export const heroSlides = [
  { id: 'slide-1', eyebrow: 'Rencanakan pendakianmu', title: 'Temukan info gunung yang lengkap & terpercaya', cta: 'Mulai Jelajah', to: '/search', bg: ['#24473A', '#142822'] },
  { id: 'slide-2', eyebrow: 'Kabar terbaru', title: 'Jalur Semeru dibuka kembali per bulan ini', cta: 'Lihat Detail', to: '/mountain/semeru', bg: ['#2E5A44', '#12271D'] },
  { id: 'slide-3', eyebrow: 'Fitur baru', title: 'Peta offline kini bisa diunduh untuk 12 gunung baru', cta: 'Cek Daftarnya', to: '/search', bg: ['#3B6350', '#16281F'] },
]