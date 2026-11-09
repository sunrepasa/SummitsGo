import multer from 'multer'

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MB

// multer membaca body multipart/form-data. Berkas ditahan di memori dulu (bukan langsung ke disk)
// supaya isinya bisa diperiksa sebelum disimpan; berkas yang ditolak tidak pernah menyentuh disk.
const multipart = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_PHOTO_BYTES,
    files: 1, // satu foto per request
    fields: 10, // field teks lain (mountainId, route, ...); mencegah body berisi ribuan field
    fieldSize: 4 * 1024, // tiap field teks maksimal 4 KB (catatan 1000 karakter masih muat)
  },
})

// field foto bernama "photo" (sesuai frontend api/logbook.js)
export const uploadPhoto = multipart.single('photo')

// Express tidak tahu pesan multer dalam bahasa Indonesia; dipetakan di errorHandler
export const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: 'Ukuran foto maksimal 5 MB',
  LIMIT_FILE_COUNT: 'Unggah satu foto per permintaan',
  LIMIT_UNEXPECTED_FILE: 'Foto harus dikirim pada field "photo"',
  LIMIT_FIELD_COUNT: 'Terlalu banyak field',
  LIMIT_FIELD_VALUE: 'Isian terlalu panjang',
  LIMIT_PART_COUNT: 'Terlalu banyak bagian data',
}
