import axios from 'axios'
import { API_URL, AUTH_STORAGE_KEY } from '../config'

const client = axios.create({ baseURL: API_URL, timeout: 15000 })

client.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))
    if (stored?.token) config.headers.Authorization = `Bearer ${stored.token}`
  } catch {
    // data auth rusak di localStorage: lanjut sebagai guest
  }
  return config
})

export default client