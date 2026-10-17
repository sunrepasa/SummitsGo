// Pengguna lain di mode mock, untuk halaman publik (/u/:username dan /e/:slug).
// Entri milik akun yang sedang login ada di data/logbooks.js; di sini hanya milik orang lain.
// Array ini sengaja bisa diubah: api/publicProfile.js memperbarui jumlah suka entrinya.
const shot = (id, from, to) => ({ id, gradient: [from, to] })

export const publicUsers = [
  {
    id: 'u-rani',
    name: 'Rani Novita',
    username: 'rani.n',
    bio: 'Pendaki akhir pekan. Suka sabana, sunrise, dan teh hangat di tenda.',
    socials: { instagram: 'rani.novita' },
    joinedAt: '2025-06-03',
    isProfilePublic: true,
    entries: [
      {
        id: 'pe-1', slug: 'semeru-ranu-pani-d4n7w1', mountainId: 'semeru', route: 'Ranu Pani',
        startDate: '2026-08-16', endDate: '2026-08-18', nights: 2, verified: true, likes: 18, likedByMe: false,
        photos: [shot('pp-1', '#5A7A8C', '#1F343E'), shot('pp-2', '#6B8F6F', '#233B26')],
        crew: [],
      },
    ],
  },
  // profil privat: tidak bisa dibuka lewat /u/:username
  {
    id: 'u-dimas',
    name: 'Dimas Mahendra',
    username: 'dimas.m',
    bio: '',
    socials: {},
    joinedAt: '2025-03-20',
    isProfilePublic: false,
    entries: [],
  },
  // profil publik tetapi belum membagikan entri apa pun
  {
    id: 'u-kartika',
    name: 'Kartika Tri',
    username: 'kartika.t',
    bio: '',
    socials: {},
    joinedAt: '2026-01-10',
    isProfilePublic: true,
    entries: [],
  },
]
