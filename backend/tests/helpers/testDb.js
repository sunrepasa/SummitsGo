import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

// MongoDB sungguhan yang berjalan di memori selama uji, lalu dibuang.
// Pertama kali dijalankan, paket ini mengunduh program MongoDB (sekitar 100 MB) sekali saja.
let server

export async function startDb() {
  server = await MongoMemoryServer.create()
  await mongoose.connect(server.getUri())
  // membangun indeks (termasuk unik) agar perilakunya sama dengan Atlas
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()))
}

export async function clearDb() {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})))
}

export async function stopDb() {
  await mongoose.disconnect()
  await server?.stop()
}
