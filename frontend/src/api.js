// axios-инстанс и генератор URL картинок
import axios from 'axios'

// VITE_API_BASE можно задать в .env (например, http://localhost:8080)
// по умолчанию берём http://localhost:8080
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL: API_BASE,
  // если нужно — добавь тут headers
})

// Генерация полного URL к файлу, чтобы не пытаться грузить с :5174
export const getImageUrl = (filename) => {
  if (!filename) return ''
  return `${API_BASE}/uploads/${filename}`
}
