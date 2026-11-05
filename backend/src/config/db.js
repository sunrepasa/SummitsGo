import dns from 'node:dns'
import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB() {
  // di sebagian komputer Windows, Node gagal membaca DNS sistem dan jatuh ke 127.0.0.1,
  // sehingga string mongodb+srv:// ditolak (querySrv ECONNREFUSED); DNS_SERVERS menimpanya
  if (env.dnsServers.length) dns.setServers(env.dnsServers)

  // dbName dipaksa lewat opsi: string dari Atlas biasanya tidak memuat nama database,
  // sehingga data akan masuk ke database bernama "test"
  await mongoose.connect(env.mongodbUri, {
    dbName: env.dbName,
    serverSelectionTimeoutMS: 10000,
  })
  console.log(`MongoDB terhubung (database: ${mongoose.connection.name})`)
}
