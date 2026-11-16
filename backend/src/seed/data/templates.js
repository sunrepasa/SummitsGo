// Template checklist bawaan sistem (user_id: null). Isinya disalin dari mock frontend
// (frontend/src/data/templates.js, systemTemplates) supaya tampilan tidak berubah saat mock dimatikan.
const tidur = 'Perlengkapan Tidur'
const masak = 'Memasak & Logistik'
const p3k = 'P3K & Darurat'
const pakaian = 'Pakaian'
const elektronik = 'Elektronik'

const twoDaysOneNight = [
  { name: 'Tenda', category: tidur },
  { name: 'Sleeping bag', category: tidur },
  { name: 'Matras', category: tidur },
  { name: 'Bantal tiup', category: tidur },
  { name: 'Kompor portable', category: masak },
  { name: 'Gas kaleng', category: masak },
  { name: 'Nesting / peralatan masak', category: masak },
  { name: 'Air minum 3L/orang', category: masak },
  { name: 'Logistik makan 2 hari', category: masak },
  { name: 'Korek api', category: masak },
  { name: 'Sendok dan garpu', category: masak },
  { name: 'Kotak P3K', category: p3k },
  { name: 'Obat pribadi', category: p3k },
  { name: 'Peluit', category: p3k },
  { name: 'Headlamp + baterai cadangan', category: p3k },
  { name: 'Jaket gunung', category: pakaian },
  { name: 'Jas hujan / ponco', category: pakaian },
  { name: 'Kaos kaki cadangan', category: pakaian },
]

const short = [
  { name: 'Air minum 2L/orang', category: masak },
  { name: 'Snack dan logistik ringan', category: masak },
  { name: 'Korek api', category: masak },
  { name: 'Kotak P3K', category: p3k },
  { name: 'Obat pribadi', category: p3k },
  { name: 'Headlamp', category: p3k },
  { name: 'Jaket gunung', category: pakaian },
  { name: 'Jas hujan / ponco', category: pakaian },
  { name: 'Kaos kaki cadangan', category: pakaian },
  { name: 'Power bank', category: elektronik },
]

export const systemTemplates = [
  { name: 'Template 2 Hari 1 Malam', items: twoDaysOneNight },
  { name: 'Template Pendakian Singkat', items: short },
]

// Checklist DEMO akun "sayz" (Ketua) dari template pendakian singkat, untuk mendemokan klaim, centang,
// dan undangan. Kode undangan tetap supaya tautan /join/demo01 bisa langsung dicoba.
export const demoChecklist = {
  mountainSlug: 'abang',
  route: 'Suter',
  plannedDate: '2026-12-20',
  inviteCode: 'demo01',
  templateName: 'Template Pendakian Singkat',
}
