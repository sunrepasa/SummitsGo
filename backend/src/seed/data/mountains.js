// Data awal gunung Pulau Bali (keputusan #16). Isian yang belum terverifikasi sengaja null/kosong,
// bukan ditebak. Pemeriksaan ulang oleh admin dilakukan lewat dashboard (Fase 8).
// Catatan sumber ada di Project Knowledge (claude/keputusan-desain.md).

const PROVINCE = 'Bali'

export const mountains = [
  {
    slug: 'batur',
    name: 'Gunung Batur',
    location: 'Bangli',
    province: PROVINCE,
    elevation: 1717,
    difficulty: 'beginner',
    status: 'open',
    description:
      'Gunung api di Kintamani, Kabupaten Bangli, dengan kaldera dan danau di kakinya. Salah satu pendakian paling populer di Bali, terutama untuk menikmati matahari terbit.',
    estimate: null,
    volcano: null, // level aktivitas belum diverifikasi: cek magma.esdm.go.id
    hikingInfo: null,
    emergency: [],
    routes: [
      // nama jalur umum dikenal, belum diverifikasi ke pengelola
      { name: 'Pura Jati', difficulty: 'beginner' },
      { name: 'Toya Bungkah', difficulty: 'beginner' },
    ],
  },
  {
    slug: 'agung',
    name: 'Gunung Agung',
    location: 'Karangasem',
    province: PROVINCE,
    elevation: 3031, // sumber lain menulis 3.142; belum disepakati
    difficulty: 'hard',
    status: 'open',
    description:
      'Gunung tertinggi di Bali dan gunung paling suci bagi umat Hindu Bali, dengan Pura Besakih di lerengnya. Jalur pendakian panjang dan menanjak.',
    estimate: null,
    volcano: null,
    hikingInfo: {
      registration: null,
      officialLink: null,
      guide: null,
      rules:
        'Jalur sering ditutup saat upacara adat (misalnya 21 Oktober sampai 5 November 2026 untuk Pujawali). Periksa pengumuman resmi pengelola sebelum berangkat.',
      bestTime: null,
    },
    emergency: [],
    routes: [
      // nama jalur umum dikenal, belum diverifikasi ke pengelola
      { name: 'Pasar Agung', difficulty: 'hard' },
      { name: 'Besakih', difficulty: 'hard' },
    ],
  },
  {
    slug: 'abang',
    name: 'Gunung Abang',
    location: 'Bangli',
    province: PROVINCE,
    elevation: 2152, // sebagian sumber menulis 2.151
    difficulty: 'medium',
    status: 'open',
    description:
      'Gunung tidak aktif di tepi kaldera Batur, Kintamani, Kabupaten Bangli. Pendakian dimulai dari Desa Suter dan relatif lebih sepi dibanding Batur.',
    estimate: '3-4 jam naik',
    volcano: null,
    hikingInfo: {
      registration: null,
      officialLink: null,
      guide: null,
      rules: 'Dilarang mendirikan tenda di area pura puncak. Berkemah memakai kuota.',
      bestTime: null,
    },
    emergency: [],
    routes: [
      {
        name: 'Suter',
        difficulty: 'medium',
        duration: '3-4 jam naik',
        description: 'Berangkat dari Desa Suter lewat Museum Geopark Batur sampai titik akhir kendaraan.',
        basecamp: {
          name: 'Desa Suter',
          price: 24000, // tarif per 7 Januari 2024 (Rp15.000 + Rp6.000 + Rp3.000); cek ulang berkala
          address: 'Desa Suter, Kintamani, Bangli. Tarif tercatat per 7 Januari 2024.',
          mapsUrl: null,
          whatsapp: null,
          phone: null,
        },
      },
    ],
  },
  {
    slug: 'batukaru',
    name: 'Gunung Batukaru',
    location: 'Tabanan',
    province: PROVINCE,
    elevation: 2276,
    difficulty: 'medium',
    status: 'closed',
    description:
      'Gunung tertinggi kedua di Bali, berhutan lebat dan dianggap suci, di Kabupaten Tabanan.',
    estimate: null,
    volcano: null,
    hikingInfo: {
      registration: null,
      officialLink: null,
      guide: null,
      rules:
        'Menurut pemberitaan Agustus 2025, pendakian tidak dibuka untuk umum karena aturan adat, kecuali untuk keperluan nazar. Periksa ke pengelola adat setempat.',
      bestTime: null,
    },
    emergency: [],
    routes: [
      { name: 'Wongaya Gede', difficulty: 'medium' },
      { name: 'Pujungan', difficulty: 'medium' },
    ],
  },
  {
    slug: 'catur',
    name: 'Gunung Catur',
    location: 'Badung',
    province: PROVINCE,
    elevation: 2096,
    difficulty: 'medium',
    status: 'open',
    description:
      'Dikenal juga sebagai Pucak Mangu, gunung suci di Kecamatan Petang, Kabupaten Badung, dengan pura di puncaknya.',
    estimate: null,
    volcano: null,
    hikingInfo: {
      registration: null,
      officialLink: null,
      guide: 'Disarankan memakai pemandu bagi pemula karena jalur tidak bertanda',
      rules: 'Gunung suci: patuhi aturan adat dan jaga kesopanan. Per Februari 2023 tidak ada tiket masuk.',
      bestTime: null,
    },
    emergency: [],
    routes: [
      {
        name: 'Tinggan',
        difficulty: 'medium',
        description: 'Berangkat dari Banjar Tinggan, Desa Pelaga.',
        basecamp: {
          name: 'Banjar Tinggan',
          price: null,
          address: 'Banjar Tinggan, Desa Pelaga, Kecamatan Petang, Badung.',
          mapsUrl: null,
          whatsapp: null,
          phone: null,
        },
      },
    ],
  },
]
