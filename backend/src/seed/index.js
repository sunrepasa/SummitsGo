import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import { env } from '../config/env.js'
import Mountain from '../models/Mountain.js'
import Route from '../models/Route.js'
import User from '../models/User.js'
import { mountains } from './data/mountains.js'

// Aman dijalankan berulang: semua langkah memakai upsert. Data yang sudah diubah lewat aplikasi
// (password, rating, popularitas) tidak ditimpa.

async function seedUsers() {
  const accounts = [
    { name: 'Sayz', username: 'sayz', email: 'sayz@email.com', role: 'user', password: 'rahasia123' },
  ]
  if (env.adminPassword) {
    accounts.push({ name: 'Admin SummitsGo', username: 'admin', email: 'admin@summitsgo.id', role: 'admin', password: env.adminPassword })
  } else {
    console.warn('ADMIN_PASSWORD belum diisi di .env (minimal 12 karakter): akun admin dilewati.')
  }

  for (const { password, ...profile } of accounts) {
    const hash = await bcrypt.hash(password, 10)
    // password hanya ditulis saat akun pertama kali dibuat
    await User.updateOne({ username: profile.username }, { $set: profile, $setOnInsert: { password: hash } }, { upsert: true })
  }
  console.log(`Pengguna: ${accounts.length} akun siap`)
}

async function seedMountains() {
  for (const { routes, ...data } of mountains) {
    const mountain = await Mountain.findOneAndUpdate(
      { slug: data.slug },
      { $set: data, $setOnInsert: { rating: 0, reviewCount: 0, popularity: 0, activeClimbers: 0 } },
      { upsert: true, returnDocument: 'after' },
    )
    for (const route of routes) {
      await Route.updateOne({ mountain_id: mountain._id, name: route.name }, { $set: { ...route, mountain_id: mountain._id } }, { upsert: true })
    }
  }
  console.log(`Gunung: ${mountains.length}, jalur: ${mountains.reduce((n, m) => n + m.routes.length, 0)}`)
}

try {
  await connectDB()
  await seedUsers()
  await seedMountains()
  // Fase berikutnya menambah langkah di sini (template checklist, review, data demo)
  console.log('Seed selesai')
} catch (err) {
  console.error('Seed gagal:', err.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
