// In dev, Vite proxies /api -> localhost:8000 (see vite.config.js).
// In production (Vercel), set VITE_API_URL to the deployed backend's URL (e.g. Render).
const API = import.meta.env.VITE_API_URL || '/api'

export async function api(path, opts) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
