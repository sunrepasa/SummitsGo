import User from '../models/User.js'
import { RESERVED_USERNAMES } from '../utils/schemas.js'

export async function usernameAvailable(req, res) {
  const { username } = req.valid.query
  const taken = RESERVED_USERNAMES.has(username) || (await User.exists({ username }))
  res.json({ available: !taken })
}
