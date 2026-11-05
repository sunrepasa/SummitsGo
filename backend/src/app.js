import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors({ origin: env.corsOrigins, allowedHeaders: ['Authorization', 'Content-Type'] }))
app.use(express.json({ limit: '1mb' }))

app.use('/api/v1', routes)

// urutan penting: 404 dan error handler harus paling bawah
app.use(notFoundHandler)
app.use(errorHandler)

export default app
