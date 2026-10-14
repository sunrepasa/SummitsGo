import { ME_ID } from './people'

// Data checklist mock yang bisa diubah (klaim, centang, tambah barang, dst.).
// Angka progres tidak disimpan: selalu dihitung dari items.
// member: { id, name, role: 'leader' | 'member' }
// item:   { id, name, category, ownerId | null, done, addedBy }

const me = { id: ME_ID, name: 'Sayz' }
const rani = { id: 'u-rani', name: 'Rani Novita' }
const dimas = { id: 'u-dimas', name: 'Dimas Mahendra' }

const leader = (m) => ({ ...m, role: 'leader' })
const member = (m) => ({ ...m, role: 'member' })

const pool = [
  ['Tenda', 'Perlengkapan Tidur'],
  ['Sleeping bag', 'Perlengkapan Tidur'],
  ['Matras', 'Perlengkapan Tidur'],
  ['Kompor portable', 'Memasak & Logistik'],
  ['Gas kaleng', 'Memasak & Logistik'],
  ['Nesting / peralatan masak', 'Memasak & Logistik'],
  ['Air minum 3L/orang', 'Memasak & Logistik'],
  ['Logistik makan', 'Memasak & Logistik'],
  ['Korek api', 'Memasak & Logistik'],
  ['Kotak P3K', 'P3K & Darurat'],
  ['Obat pribadi', 'P3K & Darurat'],
  ['Peluit', 'P3K & Darurat'],
  ['Jaket gunung', 'Pakaian'],
  ['Jas hujan / ponco', 'Pakaian'],
  ['Kaos kaki cadangan', 'Pakaian'],
  ['Sarung tangan', 'Pakaian'],
  ['Headlamp', 'Elektronik'],
  ['Power bank', 'Elektronik'],
  ['Trekking pole', 'Perlengkapan Lain'],
  ['Trash bag', 'Perlengkapan Lain'],
]

// isi daftar barang secara deterministik supaya angka done/total sama dengan data contoh sebelumnya
function seedItems(prefix, total, done, members, leaderId) {
  return Array.from({ length: total }, (_, i) => {
    const [name, category] = pool[i % pool.length]
    const isDone = i < done
    const unclaimed = !isDone && i % 3 === 0
    return {
      id: `${prefix}-i${i + 1}`,
      name: i < pool.length ? name : `${name} (cadangan)`,
      category,
      ownerId: unclaimed ? null : members[i % members.length].id,
      done: isDone,
      addedBy: leaderId,
    }
  })
}

const items = (prefix, rows) =>
  rows.map(([name, category, ownerId, done, addedBy], i) => ({
    id: `${prefix}-i${i + 1}`,
    name,
    category,
    ownerId,
    done,
    addedBy: addedBy ?? ME_ID,
  }))

const tidur = 'Perlengkapan Tidur'
const masak = 'Memasak & Logistik'
const p3k = 'P3K & Darurat'
const pakaian = 'Pakaian'
const elektronik = 'Elektronik'
const lain = 'Perlengkapan Lain'

export const checklists = [
  {
    id: 'cl-1',
    mountainId: 'merbabu',
    route: 'Selo',
    plannedDate: '2026-10-12',
    inviteCode: 'mrb4x9',
    members: [leader(me), member(rani), member(dimas)],
    pendingInvites: [{ id: 'pi-1', userId: 'u-kartika', username: 'kartika.t', name: 'Kartika Tri' }],
    items: items('cl-1', [
      ['Tenda kapasitas 4 orang', tidur, ME_ID, true],
      ['Sleeping bag', tidur, rani.id, false],
      ['Matras', tidur, null, false],
      ['Kompor portable', masak, ME_ID, true],
      ['Gas kaleng', masak, ME_ID, false],
      ['Nesting/peralatan masak', masak, rani.id, true],
      ['Air minum 3L/orang', masak, dimas.id, false],
      ['Logistik makan 2 hari', masak, null, false],
      ['Trash bag', masak, null, false],
      ['Kotak P3K', p3k, rani.id, true],
      ['Obat pribadi', p3k, ME_ID, true],
      ['Jaket gunung', pakaian, dimas.id, true],
      ['Jas hujan', pakaian, ME_ID, true],
      ['Kaos kaki cadangan', pakaian, rani.id, true],
      ['Sarung tangan', pakaian, dimas.id, true],
      ['Buff / masker', pakaian, ME_ID, true],
      ['Headlamp', elektronik, rani.id, true],
      ['Power bank', elektronik, dimas.id, true],
      ['Charger dan kabel', elektronik, ME_ID, true],
      ['Trekking pole', lain, dimas.id, false, dimas.id],
    ]),
  },
  {
    id: 'cl-2',
    mountainId: 'prau',
    route: 'Patak Banteng',
    plannedDate: null,
    inviteCode: 'prau7k',
    members: [leader({ id: 'u-budi', name: 'Budi Darmawan' }), member(me)],
    pendingInvites: [],
    items: seedItems('cl-2', 14, 4, [{ id: 'u-budi' }, me], 'u-budi'),
  },
  {
    id: 'cl-3',
    mountainId: 'rinjani',
    route: 'Sembalun',
    plannedDate: '2026-11-03',
    inviteCode: 'rnj31q',
    members: [
      leader(me),
      member({ id: 'u-kartika', name: 'Kartika Tri' }),
      member({ id: 'u-lukman', name: 'Lukman Mahesa' }),
      member({ id: 'u-dewi', name: 'Dewi Anjani' }),
      member({ id: 'u-yoga', name: 'Yoga Pratama' }),
    ],
    pendingInvites: [],
    items: seedItems('cl-3', 22, 7, [me, { id: 'u-kartika' }, { id: 'u-lukman' }, { id: 'u-dewi' }, { id: 'u-yoga' }], ME_ID),
  },
  {
    id: 'cl-4',
    mountainId: 'andong',
    route: 'Sawit',
    plannedDate: '2026-10-25',
    inviteCode: 'and8m2',
    members: [leader(me)],
    pendingInvites: [],
    items: seedItems('cl-4', 10, 2, [me], ME_ID),
  },
  {
    id: 'cl-5',
    mountainId: 'semeru',
    route: 'Ranu Pani',
    plannedDate: '2026-12-14',
    inviteCode: 'smr5d0',
    members: [leader({ id: 'u-agus', name: 'Agus Fauzi' }), member(me), member({ id: 'u-yoga', name: 'Yoga Pratama' })],
    pendingInvites: [],
    items: seedItems('cl-5', 18, 8, [{ id: 'u-agus' }, me, { id: 'u-yoga' }], 'u-agus'),
  },
  {
    id: 'cl-6',
    mountainId: 'papandayan',
    route: 'Cisurupan',
    plannedDate: null,
    inviteCode: 'ppd2c6',
    members: [leader(me)],
    pendingInvites: [],
    items: seedItems('cl-6', 12, 0, [me], ME_ID),
  },
]

// undangan masuk untuk akun yang login; saat diterima, checklist-nya masuk ke daftar di atas
export const incomingInvitations = [
  {
    id: 'inv-1',
    from: { id: 'u-kartika', name: 'Kartika Tri' },
    checklist: {
      id: 'cl-inv-1',
      mountainId: 'gede',
      route: 'Cibodas',
      plannedDate: '2026-11-15',
      inviteCode: 'gde9a1',
      members: [leader({ id: 'u-kartika', name: 'Kartika Tri' }), member({ id: 'u-lukman', name: 'Lukman Mahesa' })],
      pendingInvites: [],
      items: seedItems('cl-inv-1', 12, 3, [{ id: 'u-kartika' }, { id: 'u-lukman' }], 'u-kartika'),
    },
  },
]
