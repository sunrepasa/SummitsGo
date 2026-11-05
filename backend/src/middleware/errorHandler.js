import { AppError } from '../utils/AppError.js'

export function notFoundHandler(req, res, next) {
  next(new AppError('Endpoint tidak ditemukan', 'NOT_FOUND', 404))
}

// Semua error berakhir di sini dan dibalas dengan bentuk { message, code }
// eslint-disable-next-line no-unused-vars -- Express mengenali error handler dari jumlah parameternya (4)
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err)

  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message, code: err.code })
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Format JSON tidak valid', code: 'VALIDATION_ERROR' })
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Data yang dikirim terlalu besar', code: 'VALIDATION_ERROR' })
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Input tidak valid', code: 'VALIDATION_ERROR' })
  }

  // id di path bukan ObjectId yang sah, misalnya /checklists/abc
  if (err.name === 'CastError') {
    return res.status(404).json({ message: 'Data tidak ditemukan', code: 'NOT_FOUND' })
  }

  // jaring pengaman: controller seharusnya memeriksa duplikat sendiri dan memberi kode yang spesifik
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Data sudah ada', code: 'CONFLICT' })
  }

  console.error(err)
  return res.status(500).json({ message: 'Terjadi kesalahan pada server', code: 'INTERNAL_ERROR' })
}
