import { useEffect, useState } from 'react'
import { api } from './api'
import { getCached, setCached } from './apiCache'

// Stale-while-revalidate: renders cached data instantly (if any) on mount,
// then silently refetches and updates. Pass onError for auth-expiry handling.
export function useCachedFetch(path, { deps = [], onError } = {}) {
  const [data, setData] = useState(() => getCached(path) ?? null)

  useEffect(() => {
    api(path)
      .then((fresh) => { setCached(path, fresh); setData(fresh) })
      .catch((e) => { if (onError) onError(e) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return data
}
