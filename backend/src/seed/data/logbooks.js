// Logbook DEMO akun "sayz" (keputusan #29), hanya untuk menguji dan mendemokan fitur logbook:
// satu entri terverifikasi yang publik, satu entri manual, dan satu draf yang menunggu konfirmasi.
// Gunung dan jalur diambil dari data seed; catatan menyebut diri sebagai data demo.
// Draf hanya bisa berasal dari seed karena server tidak menyimpan posisi pengguna (batasan wajib #6).
export const demoLogbooks = [
  {
    mountainSlug: 'batur',
    route: 'Pura Jati',
    startDate: '2026-09-12',
    nights: 0,
    verified: true,
    isDraft: false,
    isPublic: true,
    slug: 'batur-pura-jati-demo01',
    note: '[Data demo] Entri contoh terverifikasi untuk menguji halaman logbook. Bukan catatan pendakian sungguhan.',
  },
  {
    mountainSlug: 'abang',
    route: 'Suter',
    startDate: '2026-07-15',
    nights: null,
    verified: false,
    isDraft: false,
    isPublic: false,
    note: '[Data demo] Entri contoh yang ditambahkan manual.',
  },
  {
    mountainSlug: 'catur',
    route: 'Tinggan',
    startDate: '2026-10-18',
    nights: 0,
    verified: false,
    isDraft: true,
    isPublic: false,
    note: '',
  },
]
