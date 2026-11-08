import mongoose from 'mongoose'
import Mountain from '../models/Mountain.js'
import Review from '../models/Review.js'

// rating dan reviewCount gunung hanya dihitung dari ulasan yang sudah disetujui.
// Dipanggil saat seed dan saat admin menyetujui/menolak ulasan (Fase 8).
export async function recalcMountainRating(mountainId) {
  const id = new mongoose.Types.ObjectId(String(mountainId))
  const [stats] = await Review.aggregate([
    { $match: { mountain_id: id, status: 'approved' } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])

  const rating = stats ? Math.round(stats.avg * 10) / 10 : 0 // satu angka di belakang koma, misal 4.7
  await Mountain.updateOne({ _id: id }, { $set: { rating, reviewCount: stats?.count ?? 0 } })
}
