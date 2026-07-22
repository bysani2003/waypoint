// In-memory, session-lifetime cache keyed by request path. Lets a revisited
// view render its last-known data instantly while a fresh copy loads behind
// it (stale-while-revalidate), instead of flashing a skeleton every time.
const cache = new Map()

export function getCached(key) {
  return cache.has(key) ? cache.get(key) : undefined
}

export function setCached(key, value) {
  cache.set(key, value)
}

export function clearCache() {
  cache.clear()
}
