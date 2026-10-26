// Notifikasi mock untuk akun yang login. Bisa diubah (tandai dibaca) selama sesi.
// type: checklist_invite | member_joined | badge_earned | trip_verified | entry_liked | plan_reminder
// to: tujuan saat notifikasi diketuk. createdAt: milidetik epoch.
const ago = (minutes) => Date.now() - minutes * 60 * 1000

export const notifications = [
  {
    id: 'n-1', type: 'checklist_invite', read: false, createdAt: ago(12), to: '/checklist',
    text: 'Kartika Tri mengundangmu ke checklist Gunung Gede via Cibodas.',
  },
  {
    id: 'n-2', type: 'trip_verified', read: false, createdAt: ago(60 * 3), to: '/logbook/lb-5',
    text: 'Pendakian Gunung Api Purba Nglanggeran terverifikasi dan masuk ke logbook-mu.',
  },
  {
    id: 'n-3', type: 'badge_earned', read: false, createdAt: ago(60 * 3 + 1), to: '/profile',
    text: 'Kamu mendapat lencana Beginner I. Selamat!',
  },
  {
    id: 'n-4', type: 'member_joined', read: true, createdAt: ago(60 * 26), to: '/checklist/cl-1',
    text: 'Dimas Mahendra bergabung ke checklist Gunung Merbabu via Selo.',
  },
  {
    id: 'n-5', type: 'entry_liked', read: true, createdAt: ago(60 * 24 * 2), to: '/logbook/lb-1',
    text: 'Rani Novita dan 2 lainnya menyukai logbook Gunung Merbabu-mu.',
  },
  {
    id: 'n-6', type: 'plan_reminder', read: true, createdAt: ago(60 * 24 * 5), to: '/checklist/cl-3',
    text: 'Rencana pendakian Gunung Rinjani via Sembalun tinggal beberapa hari lagi. Cek lagi barang bawaanmu.',
  },
  {
    id: 'n-7', type: 'member_joined', read: true, createdAt: ago(60 * 24 * 6), to: '/checklist/cl-3',
    text: 'Dewi Anjani bergabung ke checklist Gunung Rinjani via Sembalun.',
  },
  {
    id: 'n-8', type: 'entry_liked', read: true, createdAt: ago(60 * 24 * 8), to: '/logbook/lb-2',
    text: 'Budi Darmawan menyukai logbook Gunung Rinjani-mu.',
  },
  {
    id: 'n-9', type: 'member_joined', read: true, createdAt: ago(60 * 24 * 9), to: '/checklist/cl-1',
    text: 'Rani Novita bergabung ke checklist Gunung Merbabu via Selo.',
  },
  {
    id: 'n-10', type: 'badge_earned', read: true, createdAt: ago(60 * 24 * 11), to: '/profile',
    text: 'Kamu mendapat lencana Rookie. Selamat atas pendakian pertamamu!',
  },
  {
    id: 'n-11', type: 'trip_verified', read: true, createdAt: ago(60 * 24 * 12), to: '/logbook/lb-1',
    text: 'Pendakian Gunung Merbabu terverifikasi dan masuk ke logbook-mu.',
  },
  {
    id: 'n-12', type: 'entry_liked', read: true, createdAt: ago(60 * 24 * 14), to: '/logbook/lb-1',
    text: 'Dimas Mahendra dan 4 lainnya menyukai logbook Gunung Merbabu-mu.',
  },
  {
    id: 'n-13', type: 'plan_reminder', read: true, createdAt: ago(60 * 24 * 16), to: '/checklist/cl-1',
    text: 'Rencana pendakian Gunung Merbabu via Selo tinggal beberapa hari lagi. Cek lagi barang bawaanmu.',
  },
  {
    id: 'n-14', type: 'checklist_invite', read: true, createdAt: ago(60 * 24 * 20), to: '/checklist',
    text: 'Agus Fauzi mengundangmu ke checklist Gunung Semeru via Ranu Pani.',
  },
]
