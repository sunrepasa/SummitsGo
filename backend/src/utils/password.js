import bcrypt from 'bcryptjs'

// 10 putaran: cukup lambat untuk menyulitkan penebakan, cukup cepat untuk login (sekitar 100 ms)
const BCRYPT_ROUNDS = 10

export const hashPassword = (plain) => bcrypt.hash(plain, BCRYPT_ROUNDS)
export const checkPassword = (plain, hash) => bcrypt.compare(plain, hash)

// hash palsu untuk dibandingkan saat akun tidak ditemukan: waktu responsnya jadi sama dengan
// password salah, sehingga penyerang tidak bisa menebak email mana yang terdaftar dari kecepatan jawaban
export const DUMMY_HASH = bcrypt.hashSync('bukan-password-sungguhan', BCRYPT_ROUNDS)
