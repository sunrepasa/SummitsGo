import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app = express()

const corsOptions = { origin: env.corsOrigins, allowedHeaders: ['Authorization', 'Content-Type'] }

// Foto logbook dilayani sebagai berkas statis. CORS ikut dipasang karena fitur poster di frontend
// (html-to-image) mengambil foto lewat fetch, yang diblokir browser bila origin-nya berbeda.
app.use(
  '/uploads',
  cors(corsOptions),
  express.static(env.uploadDir, {
    index: false, // tidak menampilkan daftar isi folder
    dotfiles: 'ignore',
    maxAge: '7d', // nama berkas acak dan tidak pernah ditimpa, jadi aman disimpan lama di cache browser
    setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff'),
  }),
)

app.use(cors(corsOptions))
app.use(express.json({ limit: '1mb' }))

app.use('/api/v1', routes)

// urutan penting: 404 dan error handler harus paling bawah
app.use(notFoundHandler)
app.use(errorHandler)

export default app
