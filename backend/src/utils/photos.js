import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { env } from '../config/env.js'
import { AppError } from './AppError.js'

// Jenis gambar dikenali dari beberapa byte pertama isi berkas ("magic bytes"), bukan dari nama atau
// mimetype kiriman klien yang bisa dipalsukan. Berkas .exe yang diganti namanya menjadi foto.jpg ditolak.
const SIGNATURES = [
  { ext: 'jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: 'webp', test: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
]

const PUBLIC_PREFIX = '/uploads/'

// simpan foto ke folder uploads dengan nama acak; mengembalikan path relatif untuk disimpan di database
export async function savePhoto(file) {
  const kind = SIGNATURES.find((s) => file.buffer.length >= 12 && s.test(file.buffer))
  if (!kind) throw new AppError('Foto harus berupa gambar JPG, PNG, atau WEBP', 'VALIDATION_ERROR', 400)

  // nama acak: nama asli dari pengguna tidak dipakai (bisa berisi ../ atau karakter aneh)
  const name = `${crypto.randomUUID()}.${kind.ext}`
  await fs.mkdir(env.uploadDir, { recursive: true })
  await fs.writeFile(path.join(env.uploadDir, name), file.buffer)
  return `${PUBLIC_PREFIX}${name}`
}

// hapus berkas foto lokal; kegagalan diabaikan karena data di database sudah terhapus
export async function deletePhotoFiles(urls) {
  await Promise.all(
    urls
      .filter((url) => typeof url === 'string' && url.startsWith(PUBLIC_PREFIX))
      .map((url) => fs.unlink(path.join(env.uploadDir, path.basename(url))).catch(() => {})),
  )
}

// path lokal → URL lengkap yang bisa dibuka browser dari origin frontend
export const publicPhotoUrl = (url) => (url.startsWith('/') ? `${env.publicUrl}${url}` : url)

export const toPhoto = (photo) => ({ id: String(photo._id), url: publicPhotoUrl(photo.url) })
