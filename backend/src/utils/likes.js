import Logbook from '../models/Logbook.js'

// Suka/batal suka dalam SATU perintah ke database: syarat "belum ada di likedBy" dan penambahan
// likes dilakukan bersamaan, jadi dua klik cepat (atau dua tab) tidak bisa menambah suka dua kali
// dan angka likes selalu sama dengan jumlah isi likedBy.
// Mengembalikan true bila keadaan benar-benar berubah (dipakai untuk notifikasi di Fase 7).
export async function setLike(logbookId, userId, liked) {
  const result = liked
    ? await Logbook.updateOne({ _id: logbookId, likedBy: { $ne: userId } }, { $push: { likedBy: userId }, $inc: { likes: 1 } })
    : await Logbook.updateOne({ _id: logbookId, likedBy: userId }, { $pull: { likedBy: userId }, $inc: { likes: -1 } })
  return result.modifiedCount > 0
}
