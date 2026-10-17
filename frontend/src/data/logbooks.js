import { ME_ID } from './people'

const me = { id: ME_ID, name: 'Sayz' }
const rani = { id: 'u-rani', name: 'Rani Novita' }
const dimas = { id: 'u-dimas', name: 'Dimas Mahendra' }
const kartika = { id: 'u-kartika', name: 'Kartika Tri' }
const lukman = { id: 'u-lukman', name: 'Lukman Mahesa' }

// foto mock berupa gradasi; foto yang diunggah di sesi ini berisi url (object URL)
const shot = (id, from, to) => ({ id, gradient: [from, to] })

// Array ini sengaja bisa diubah: api/logbook.js menambah, mengubah, dan menghapus isinya.
// slug dibuat saat entri pertama kali dipublikkan dan dipakai pada tautan publik /e/:slug.
// crew hanya ada di entri terverifikasi (diambil dari checklist saat pendakian terdeteksi).
export const logbooks = [
  {
    id: 'lb-1', mountainId: 'merbabu', route: 'Selo', startDate: '2026-09-12', endDate: '2026-09-13', nights: 1,
    verified: true, likes: 24, likedByMe: false, isPublic: true, slug: 'merbabu-selo-k3x9a2',
    note: 'Sabananya luas banget pas cuaca cerah, worth capeknya. Sempat kabut tebal pas turun jadi harus hati-hati di dekat percabangan sebelum Pos 2.',
    photos: [
      shot('ph-1', '#6B8F6F', '#233B26'),
      shot('ph-2', '#8C7A5A', '#2E2418'),
      shot('ph-3', '#5A7A8C', '#1F343E'),
      shot('ph-4', '#4A5A3E', '#1A2314'),
      shot('ph-5', '#7A5A3E', '#2A1E14'),
    ],
    crew: [me, rani, dimas],
    checklistName: 'Gunung Merbabu',
  },
  {
    id: 'lb-2', mountainId: 'rinjani', route: 'Sembalun', startDate: '2026-09-02', endDate: '2026-09-04', nights: 2,
    verified: true, likes: 41, likedByMe: true, isPublic: true, slug: 'rinjani-sembalun-p7m4q8',
    note: 'Tanjakan Penyesalan beneran menguji mental. Segara Anak dan sunrise di puncak bayar semuanya.',
    photos: [shot('ph-6', '#5A7A8C', '#1F343E'), shot('ph-7', '#6B8F6F', '#233B26')],
    crew: [me, kartika, lukman],
    checklistName: 'Gunung Rinjani',
  },
  {
    id: 'lb-3', mountainId: 'andong', route: 'Sawit', startDate: '2026-07-15', endDate: '2026-07-15', nights: null,
    verified: false, likes: 9, likedByMe: false, isPublic: false, slug: null,
    note: 'Tektok santai pagi hari, jalurnya pendek dan cocok buat pemanasan.',
    photos: [],
    crew: [],
    checklistName: null,
  },
  {
    id: 'lb-4', mountainId: 'merbabu', route: 'Wekas', startDate: '2025-03-03', endDate: '2025-03-03', nights: 1,
    verified: false, likes: 5, likedByMe: false, isPublic: false, slug: null,
    note: '',
    photos: [],
    crew: [],
    checklistName: null,
  },
]

export const drafts = [
  { id: 'dr-1', mountainId: 'sindoro', route: 'Kledung', startDate: '2026-09-24', endDate: '2026-09-25', nights: 1 },
]
