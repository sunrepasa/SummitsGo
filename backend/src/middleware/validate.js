import { AppError } from '../utils/AppError.js'

// Hasil yang sudah bersih (trim, huruf kecil) disimpan di req.valid.<sumber>.
// Express 5 membuat req.query hanya-baca, jadi hasilnya tidak ditimpakan ke req.
export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    // request tanpa body membuat req.body undefined (Express 5); dianggap objek kosong supaya
    // pesan error yang keluar tetap pesan bahasa Indonesia milik field yang wajib
    const result = schema.safeParse(req[source] ?? {})
    if (!result.success) {
      throw new AppError(result.error.issues[0].message, 'VALIDATION_ERROR', 400)
    }
    req.valid = { ...req.valid, [source]: result.data }
    next()
  }
