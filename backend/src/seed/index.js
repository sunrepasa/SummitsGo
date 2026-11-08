import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import { env } from '../config/env.js'
import Mountain from '../models/Mountain.js'
import Review from '../models/Review.js'
import Route from '../models/Route.js'
import User from '../models/User.js'
import { recalcMountainRating } from '../utils/mountainRating.js'
import { mountains } from './data/mountains.js'
import { demoReviews } from './data/reviews.js'

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

async function seedReviews() {
  const author = await User.findOne({ username: 'sayz' }).select('_id').lean()

  for (const { mountainSlug, ...review } of demoReviews) {
    const mountain = await Mountain.findOne({ slug: mountainSlug }).select('_id').lean()
    if (!mountain) continue
    // kunci upsert = penulis + gunung + teks, jadi seed ulang tidak membuat ulasan ganda
    const key = { user_id: author._id, mountain_id: mountain._id, text: review.text }
    await Review.updateOne(key, { $set: { ...review, status: 'approved', verified: false } }, { upsert: true })
  }

  // rating di kartu gunung dihitung ulang dari ulasan approved, termasuk gunung tanpa ulasan (jadi 0)
  for (const { _id } of await Mountain.find().select('_id').lean()) await recalcMountainRating(_id)
  console.log(`Ulasan demo: ${demoReviews.length}`)
}

try {
  await connectDB()
  await seedUsers()
  await seedMountains()
  await seedReviews()
  // Fase berikutnya menambah langkah di sini (template checklist, data demo logbook/checklist)
  console.log('Seed selesai')
} catch (err) {
  console.error('Seed gagal:', err.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
