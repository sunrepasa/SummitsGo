import User from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { checkPassword, DUMMY_HASH, hashPassword } from '../utils/password.js'
import { RESERVED_USERNAMES } from '../utils/schemas.js'
import { toSessionUser } from '../utils/serializer.js'
import { signToken } from '../utils/token.js'

const usernameTaken = () => new AppError('Username sudah dipakai', 'USERNAME_TAKEN', 409)
const emailTaken = () => new AppError('Email sudah terdaftar', 'EMAIL_TAKEN', 409)

const session = (user) => ({ token: signToken(user), user: toSessionUser(user) })

export async function register(req, res) {
  const { name, username, email, password } = req.valid.body

  if (RESERVED_USERNAMES.has(username) || (await User.exists({ username }))) throw usernameTaken()
  if (await User.exists({ email })) throw emailTaken()

  const hash = await hashPassword(password)

  let user
  try {
    // role tidak diambil dari body: akun hasil pendaftaran selalu "user"
    user = await User.create({ name, username, email, password: hash })
  } catch (err) {
    // dua pendaftaran bersamaan bisa lolos pemeriksaan di atas; indeks unik di database yang menolak yang kedua
    if (err.code === 11000) throw err.keyPattern?.email ? emailTaken() : usernameTaken()
    throw err
  }

  res.status(201).json(session(user))
}

export async function login(req, res) {
  const { identifier, password } = req.valid.body

  const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] }).select('+password')
  const valid = await checkPassword(password, user?.password ?? DUMMY_HASH)

  // pesan yang sama untuk akun tidak ada dan password salah
  if (!user || !valid) {
    throw new AppError('Username/email atau kata sandi salah', 'INVALID_CREDENTIALS', 401)
  }

  res.json(session(user))
}
