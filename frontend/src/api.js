// In dev, Vite proxies /api -> localhost:8000 (see vite.config.js).
// In production (Vercel), set VITE_API_URL to the deployed backend's URL (e.g. Render).
const API = import.meta.env.VITE_API_URL || '/api'

export class AuthError extends Error {}

export function getToken() {
  return localStorage.getItem('token')
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

export async function api(path, opts = {}) {
  const token = getToken()
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
  })
  if (res.status === 401) {
    setToken(null)
    throw new AuthError('Session expired, please log in again')
  }
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
