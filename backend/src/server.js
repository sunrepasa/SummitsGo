import app from './app.js'
import { env } from './config/env.js'
import { connectDB } from './config/db.js'

async function start() {
  try {
    await connectDB()
  } catch (err) {
    console.error('Gagal terhubung ke MongoDB:', err.message)
    process.exit(1)
  }

  app.listen(env.port, () => {
    console.log(`Server berjalan di http://localhost:${env.port}/api/v1`)
  })
}

start()
