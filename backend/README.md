# SummitsGo Backend

REST API untuk SummitsGo Web, sistem informasi pendakian gunung. Dibangun dengan **Express.js + MongoDB (Mongoose)**,
autentikasi **JWT**. Frontend (`../frontend`) adalah proyek terpisah yang hanya berkomunikasi lewat API ini.

- Prefiks semua endpoint: `/api/v1` (contoh: `http://localhost:3000/api/v1/mountains`)
- Format data: JSON, nama field camelCase, `id` berupa string (gunung memakai slug, misalnya `batur`)
- Format error: `{ "message": "...", "code": "..." }`

## Menjalankan

Butuh Node.js 20 ke atas dan database MongoDB (Atlas gratis M0 cukup).

```bash
cd backend
npm install
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
# isi .env (lihat tabel di bawah)
npm run seed                # isi data awal, aman dijalankan berulang
npm run dev                 # server di http://localhost:3000/api/v1, restart otomatis saat file berubah
```

Cek server hidup: buka `http://localhost:3000/api/v1/health`, harus muncul `"database": "connected"`.

## Variabel lingkungan (`.env`)

| Variabel | Wajib | Contoh | Keterangan |
| --- | --- | --- | --- |
| `PORT` | tidak | `3000` | Port server |
| `MONGODB_URI` | ya | `mongodb+srv://user:sandi@cluster.mongodb.net/` | String koneksi dari Atlas, ganti `<db_password>` tanpa tanda `<>` |
| `DB_NAME` | tidak | `summitsgo` | Nama database |
| `DNS_SERVERS` | tidak | `8.8.8.8,1.1.1.1` | Isi hanya bila muncul error `querySrv ECONNREFUSED` |
| `JWT_SECRET` | ya | (acak, minimal 32 karakter) | Buat dengan `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | tidak | `30d` | Masa berlaku token; panjang agar pendaki tetap masuk saat offline |
| `CORS_ORIGIN` | tidak | `http://localhost:5173` | Alamat frontend yang diizinkan, pisahkan dengan koma |
| `ADMIN_PASSWORD` | tidak | (minimal 12 karakter) | Sandi akun admin saat seed; kosong = akun admin tidak dibuat |

`.env` tidak boleh masuk Git (sudah ada di `.gitignore`).

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan (nodemon) |
| `npm start` | Server tanpa restart otomatis |
| `npm run seed` | Isi data awal: 5 gunung Bali, 8 jalur, 2 ulasan demo, akun `sayz` dan admin |
| `npm test` | Uji otomatis (Jest + Supertest) |

### Akun hasil seed

| Peran | Username | Email | Sandi |
| --- | --- | --- | --- |
| user | `sayz` | `sayz@email.com` | `rahasia123` |
| admin | `admin` | `admin@summitsgo.id` | nilai `ADMIN_PASSWORD` di `.env` |

## Pengujian otomatis

```bash
npm test
```

- Memakai **MongoDB sungguhan di memori** (`mongodb-memory-server`), jadi **tidak menyentuh database Atlas**.
- Pertama kali dijalankan, program MongoDB (sekitar 100 MB) diunduh sekali; jalankan berikutnya cepat.
- File uji ada di `tests/`, satu file per fitur. Pembuat data uji di `tests/helpers/factory.js`.

## Struktur folder

```
backend/
├── src/
│   ├── server.js         Sambung database lalu buka port
│   ├── app.js            Rakit Express: CORS, JSON, route, penanganan error
│   ├── config/           Membaca .env dan koneksi MongoDB
│   ├── models/           Skema Mongoose, satu file per collection
│   ├── routes/           Peta URL → middleware → controller
│   ├── controllers/      Logika tiap endpoint
│   ├── middleware/       auth, optionalAuth, validate (zod), rateLimit, errorHandler
│   ├── utils/            serializer, AppError, token, password, schemas, date, geo, mountainRating
│   ├── data/             Konfigurasi tetap (slide promosi beranda)
│   └── seed/             Skrip data awal dan datanya
├── tests/                Uji otomatis
└── uploads/              Foto logbook (isinya tidak masuk Git)
```

## Endpoint

Spesifikasi lengkap ada di dokumen SRS/SDS Bagian 3.3. "Token" = wajib header `Authorization: Bearer <token>`.

| Method | Path | Token | Status |
| --- | --- | --- | --- |
| GET | `/health` | tidak | jadi |
| POST | `/auth/register` | tidak | jadi |
| POST | `/auth/login` | tidak | jadi |
| GET | `/users/username-available?username=` | tidak | jadi |
| PATCH | `/users/me` | ya | jadi |
| PUT | `/users/me/password` | ya | jadi |
| DELETE | `/users/me` | ya | jadi |
| GET / PUT / DELETE | `/users/me/saved-mountains/:mountainId` | ya | jadi |
| GET | `/users/search` | ya | Fase 6 |
| GET | `/mountains` | tidak | jadi |
| GET | `/mountains/provinces` | tidak | jadi |
| GET | `/mountains/recommended` | tidak | jadi |
| GET | `/mountains/:id` | tidak | jadi |
| GET | `/mountains/:id/routes` | tidak | jadi |
| GET | `/mountains/:id/weather` | tidak | jadi (data contoh) |
| GET | `/public/mountains/:id/routes/:routeName/map` | tidak | jadi |
| GET | `/promotions` | tidak | jadi |
| GET | `/mountains/:id/reviews` | tidak | jadi |
| POST | `/mountains/:id/reviews` | ya | jadi |
| Logbook (12), profil dan entri publik (4) | | | Fase 5 |
| Checklist dan undangan (20) | | | Fase 6 |
| Notifikasi (7) | | | Fase 7 |
| Admin (8) | | admin | Fase 8 |

### Kode error

| code | HTTP | Kapan |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | Input tidak valid |
| `INVALID_CREDENTIALS` | 401 / 400 | Login salah (401); sandi lama salah saat ganti sandi (400) |
| `UNAUTHORIZED` | 401 | Token hilang, salah, kedaluwarsa, atau akunnya sudah dihapus |
| `FORBIDDEN` | 403 | Tidak berhak melakukan aksi |
| `NOT_FOUND` | 404 | Data atau endpoint tidak ada |
| `USERNAME_TAKEN`, `EMAIL_TAKEN` | 409 | Sudah dipakai akun lain |
| `USERNAME_COOLDOWN` | 409 | Ganti username sebelum 7 hari |
| `ALREADY_REVIEWED` | 409 | Sudah menulis ulasan (pending/disetujui) untuk gunung itu |
| `RATE_LIMITED` | 429 | Terlalu banyak percobaan login, daftar, atau ganti sandi |
| `INTERNAL_ERROR` | 500 | Kesalahan di server |

## Aturan penting

- Endpoint tamu (gunung, peta, ulasan, profil publik) tidak pernah membalas 401, walau token yang dikirim rusak.
- `role` tidak bisa dikirim dari klien. Akun admin hanya dibuat lewat `npm run seed`.
- Ulasan baru berstatus `pending` dan baru tampil setelah disetujui admin. Rating gunung dihitung dari ulasan yang disetujui.
- Data yang belum terverifikasi (harga, kontak, koordinat jalur) sengaja dibiarkan `null`, bukan ditebak.
- Backend tidak menyimpan posisi pengguna. Live Location dihitung di browser.
