// Frontend memecah tanggal 'YYYY-MM-DD' secara manual (split('-')), jadi ISO lengkap akan merusaknya.
// Zona waktu WIB agar tanggal tidak mundur sehari bagi pengguna di Indonesia.
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const toDateOnly = (date) => formatter.format(date)
