// Dijalankan Jest sebelum setiap file uji, SEBELUM kode aplikasi dimuat.
// Nilai ini mencegah config/env.js memakai MONGODB_URI dari .env, jadi uji tidak pernah
// menyentuh database Atlas sungguhan. Database uji dibuat di memori oleh tests/helpers/testDb.js.
process.env.MONGODB_URI = 'mongodb://database-uji-di-memori'
process.env.JWT_SECRET = 'rahasia-khusus-pengujian-yang-panjangnya-lebih-dari-32-karakter'
process.env.JWT_EXPIRES_IN = '1h'
process.env.NODE_ENV = 'test'
