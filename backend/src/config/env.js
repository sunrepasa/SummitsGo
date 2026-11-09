import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI belum diisi. Salin .env.example menjadi .env lalu isi nilainya.')
  process.exit(1)
}

const secret = process.env.JWT_SECRET ?? ''
if (secret.length < 32 || secret.startsWith('ganti-dengan')) {
  console.error(
    'JWT_SECRET belum aman. Isi dengan teks acak minimal 32 karakter. Buat dengan perintah:\n' +
      `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`,
  )
  process.exit(1)
}

// folder backend/ (dua tingkat di atas src/config), supaya path relatif tidak bergantung dari mana npm dijalankan
const BACKEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const port = Number(process.env.PORT) || 3000

export const env = {
  port,
  isTest: process.env.NODE_ENV === 'test',
  mongodbUri: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME || 'summitsgo',
  jwtSecret: process.env.JWT_SECRET,
  // hanya dipakai skrip seed untuk akun admin; kosong = akun admin tidak dibuat
  adminPassword: (process.env.ADMIN_PASSWORD ?? '').length >= 12 ? process.env.ADMIN_PASSWORD : '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  dnsServers: (process.env.DNS_SERVERS || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  // alamat backend yang dibuka browser; dipakai menyusun URL lengkap foto karena frontend ada di origin lain
  publicUrl: (process.env.PUBLIC_URL || `http://localhost:${port}`).replace(/\/+$/, ''),
  // folder foto unggahan (pengembangan); produksi bisa diganti layanan eksternal tanpa mengubah skema
  uploadDir: path.resolve(BACKEND_ROOT, process.env.UPLOAD_DIR || 'uploads'),
}
