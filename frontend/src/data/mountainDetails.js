// Data detail per gunung (mock). Gunung yang belum punya entri di sini tetap bisa dibuka:
// halaman otomatis menyembunyikan bagian yang datanya kosong.
//
// facilities pada pos: 'water' | 'camp' | 'blankspot' | 'danger'
// (dangerNote dipakai untuk keterangan titik bahaya)

export const mountainDetails = {
  rinjani: {
    description:
      'Gunung berapi aktif tertinggi kedua di Indonesia dengan danau Segara Anak di kalderanya. Menawarkan sabana luas, kawah, dan pemandangan sunrise yang menjadi daya tarik utama pendakian.',
    updatedAt: '2026-10-06',
    activeClimbers: 9,
    estimate: '8-11 jam',
    volcano: {
      level: 2,
      label: 'Waspada',
      verifiedAt: '5 Okt 2026, 08.00',
      source: { label: 'magma.esdm.go.id', url: 'https://magma.esdm.go.id' },
    },
    hikingInfo: {
      registration: 'Daftar online lewat situs resmi, lalu tunjukkan bukti pendaftaran di basecamp',
      officialLink: { label: 'contoh-resmi.id/rinjani', url: 'https://contoh-resmi.id/rinjani' },
      guide: 'Tidak wajib',
      rules: 'Usia minimal 12 tahun, membawa surat sehat, dan wajib membawa turun sampah',
      bestTime: 'April sampai Oktober. Jalur ditutup sementara pada musim hujan',
    },
    emergency: [
      { type: 'sar', title: 'SAR setempat', name: 'Pos SAR Mataram', phone: '115' },
      { type: 'clinic', title: 'Klinik terdekat', name: 'Puskesmas Sembalun', phone: '0370000000' },
    ],
    routes: [
      {
        name: 'Sembalun',
        difficulty: 'medium',
        duration: '8-10 jam naik',
        description: 'Sabana luas dan sunrise dari Pelawangan.',
        mapAvailable: true,
        basecamp: {
          name: 'Basecamp Sembalun Lawang',
          price: 150000,
          address: 'Desa Sembalun Lawang, sekitar 3 jam dari Mataram dengan kendaraan.',
          mapsUrl: 'https://maps.google.com/?q=Sembalun+Lawang',
          whatsapp: '628123456780',
          phone: '0370111111',
        },
        posts: [
          { name: 'Pos 1', distance: '2,5 km', duration: '1 jam', facilities: [] },
          { name: 'Pos 2', distance: '4 km', duration: '2 jam', facilities: ['camp'] },
          {
            name: 'Pos 3',
            distance: '6 km',
            duration: '3 jam',
            facilities: ['water', 'blankspot', 'danger'],
            dangerNote: 'rawan longsor',
          },
        ],
      },
      {
        name: 'Torean',
        difficulty: 'hard',
        duration: '9-11 jam naik',
        description: 'Jalur lebih sepi dengan hutan lebat.',
        mapAvailable: false,
        basecamp: {
          name: 'Basecamp Torean',
          price: 150000,
          address: 'Desa Senaru, sekitar 2,5 jam dari Mataram dengan kendaraan.',
          mapsUrl: 'https://maps.google.com/?q=Senaru',
          whatsapp: '628123456781',
          phone: null,
        },
        posts: [{ name: 'Pos 1', distance: '3 km', duration: '1,5 jam', facilities: ['water'] }],
      },
    ],
  },

  merbabu: {
    description:
      'Gunung Merbabu menawarkan pemandangan sabana luas yang jarang ditemui di gunung lain di Jawa. Cocok untuk pendaki menengah yang ingin merasakan trek panjang dengan variasi vegetasi hutan pinus hingga savana terbuka menjelang puncak.',
    updatedAt: '2026-10-03',
    activeClimbers: 14,
    estimate: '10-12 jam',
    volcano: null,
    hikingInfo: {
      registration: 'Daftar online lewat situs resmi, lalu tunjukkan bukti pendaftaran di basecamp',
      officialLink: { label: 'simaksmerbabu.id', url: 'https://simaksmerbabu.id' },
      guide: 'Tidak wajib',
      rules: 'Wajib membawa turun sampah dan tidak membuat api unggun di area sabana',
      bestTime: 'Mei sampai September',
    },
    emergency: [
      { type: 'sar', title: 'SAR setempat', name: 'Pos SAR Boyolali', phone: '115' },
    ],
    routes: [
      {
        name: 'Selo',
        difficulty: 'medium',
        duration: '5-7 jam naik',
        description: 'Jalur paling ramai dengan sabana luas menjelang puncak.',
        mapAvailable: true,
        basecamp: {
          name: 'Basecamp Selo',
          price: 25000,
          address: 'Desa Selo, Boyolali, sekitar 1,5 jam dari Solo dengan kendaraan.',
          mapsUrl: 'https://maps.google.com/?q=Basecamp+Selo+Merbabu',
          whatsapp: '628123456782',
          phone: '0271222222',
        },
        posts: [
          { name: 'Pos 1', distance: '1,8 km', duration: '45 menit', facilities: [] },
          { name: 'Pos 2', distance: '3,2 km', duration: '1 jam', facilities: ['water', 'camp'] },
          {
            name: 'Sabana 1',
            distance: '5 km',
            duration: '1,5 jam',
            facilities: ['camp', 'blankspot'],
          },
          {
            name: 'Sabana 2',
            distance: '6,5 km',
            duration: '2 jam',
            facilities: ['danger'],
            dangerNote: 'kabut tebal mendadak',
          },
        ],
      },
      {
        name: 'Wekas',
        difficulty: 'medium',
        duration: '6-8 jam naik',
        description: 'Jalur lebih sepi melewati ladang warga dan hutan pinus.',
        mapAvailable: true,
        basecamp: {
          name: 'Basecamp Wekas',
          price: 25000,
          address: 'Desa Wekas, Magelang, sekitar 1 jam dari Magelang kota.',
          mapsUrl: 'https://maps.google.com/?q=Basecamp+Wekas+Merbabu',
          whatsapp: '628123456783',
          phone: null,
        },
        posts: [
          { name: 'Pos 1', distance: '2 km', duration: '1 jam', facilities: ['water'] },
          { name: 'Pos 2', distance: '4 km', duration: '2 jam', facilities: ['camp'] },
          { name: 'Pos 3', distance: '5,5 km', duration: '2,5 jam', facilities: ['blankspot'] },
        ],
      },
      {
        name: 'Suwanting',
        difficulty: 'hard',
        duration: '7-9 jam naik',
        description: 'Jalur menanjak dengan pemandangan Merapi di sisi timur.',
        mapAvailable: false,
        basecamp: null,
        posts: [],
      },
      {
        name: 'Thekelan',
        difficulty: 'medium',
        duration: '6-8 jam naik',
        description: '',
        mapAvailable: false,
        basecamp: null,
        posts: [],
      },
    ],
  },

  semeru: {
    description:
      'Puncak tertinggi di Pulau Jawa dengan Mahameru sebagai tujuan akhir. Jalur melewati Ranu Kumbolo, Oro-Oro Ombo, hingga Kalimati sebelum tanjakan pasir menuju puncak.',
    updatedAt: '2026-10-04',
    activeClimbers: 21,
    estimate: '2 hari 1 malam',
    volcano: {
      level: 2,
      label: 'Waspada',
      verifiedAt: '4 Okt 2026, 08.00',
      source: { label: 'magma.esdm.go.id', url: 'https://magma.esdm.go.id' },
    },
    hikingInfo: {
      registration: 'Daftar online lewat situs resmi TNBTS dan wajib membawa bukti pendaftaran',
      officialLink: { label: 'contoh-resmi.id/semeru', url: 'https://contoh-resmi.id/semeru' },
      guide: 'Tidak wajib',
      rules: 'Surat sehat wajib, pendakian puncak dibatasi jam tertentu',
      bestTime: 'April sampai Oktober',
    },
    emergency: [
      { type: 'sar', title: 'SAR setempat', name: 'Pos SAR Malang', phone: '115' },
      { type: 'clinic', title: 'Klinik terdekat', name: 'Puskesmas Ranu Pani', phone: '0341000000' },
    ],
    routes: [
      {
        name: 'Ranu Pani',
        difficulty: 'hard',
        duration: '2 hari 1 malam',
        description: 'Satu-satunya jalur resmi menuju Mahameru.',
        mapAvailable: true,
        basecamp: {
          name: 'Basecamp Ranu Pani',
          price: 30000,
          address: 'Desa Ranu Pani, Lumajang, sekitar 3 jam dari Malang dengan kendaraan.',
          mapsUrl: 'https://maps.google.com/?q=Ranu+Pani',
          whatsapp: '628123456784',
          phone: '0341333333',
        },
        posts: [
          { name: 'Pos 1', distance: '3 km', duration: '1,5 jam', facilities: ['water'] },
          { name: 'Ranu Kumbolo', distance: '10 km', duration: '4 jam', facilities: ['water', 'camp'] },
          { name: 'Kalimati', distance: '15 km', duration: '3 jam', facilities: ['water', 'camp', 'blankspot'] },
          {
            name: 'Arcopodo',
            distance: '17 km',
            duration: '1,5 jam',
            facilities: ['danger'],
            dangerNote: 'gas beracun dan lontaran material',
          },
        ],
      },
    ],
  },
}
