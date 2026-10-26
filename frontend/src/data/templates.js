// item template: { name, category }. Klaim dan status centang tidak ikut tersimpan di template.
const tidur = 'Perlengkapan Tidur'
const masak = 'Memasak & Logistik'
const p3k = 'P3K & Darurat'
const pakaian = 'Pakaian'
const elektronik = 'Elektronik'
const lain = 'Perlengkapan Lain'

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

export const myTemplates = [
  {
    id: 'tpl-me-1',
    name: 'Pendakian 2D1N Standar',
    items: [...twoDaysOneNight, { name: 'Power bank', category: elektronik }, { name: 'Trekking pole', category: lain }],
  },
  {
    id: 'tpl-me-2',
    name: 'Pendakian Singkat',
    items: [...short, { name: 'Topi / buff', category: pakaian }, { name: 'Trekking pole', category: lain }],
  },
]

export const systemTemplates = [
  { id: 'tpl-sys-1', name: 'Template 2 Hari 1 Malam', items: twoDaysOneNight },
  { id: 'tpl-sys-2', name: 'Template Pendakian Singkat', items: short },
]

export const withItemCount = (t) => ({ id: t.id, name: t.name, itemCount: t.items.length })
