// teks pesan dan tautan WhatsApp untuk membagikan entri logbook
export function entryShareText({ mountainName, route, url }) {
  const base = `Aku baru mendaki ${mountainName} via ${route} 🏔️`
  return url ? `${base}\nLihat catatan pendakianku di SummitsGo: ${url}` : `${base}\nDicatat lewat SummitsGo.`
}

// wa.me membuka aplikasi WhatsApp di HP, atau WhatsApp Web di desktop, tanpa nomor tujuan
export const whatsappShareUrl = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`

// tampilan tautan tanpa skema supaya muat di kolom sempit
export const displayUrl = (url) => url.replace(/^https?:\/\//, '')
