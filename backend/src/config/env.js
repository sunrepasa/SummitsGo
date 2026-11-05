import 'dotenv/config'

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

export const env = {
  port: Number(process.env.PORT) || 3000,
  mongodbUri: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME || 'summitsgo',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  dnsServers: (process.env.DNS_SERVERS || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
}
