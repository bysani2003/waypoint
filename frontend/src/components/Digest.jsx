import { useEffect, useState } from 'react'
import { api } from '../api'
import TiltCard from './TiltCard'

function readTime(summary) {
  const words = summary.split(/\s+/).length
  return `${Math.max(1, Math.round(words / 60))} min read`
}

export default function Digest() {
  const [items, setItems] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { api('/digest/today').then(setItems) }, [])

  const refresh = async () => {
    setRefreshing(true)
    setError(null)
    try {
      const fresh = await api('/digest/refresh', { method: 'POST' })
      setItems(fresh)
    } catch {
      setError('Could not reach the article sources just now — try again in a moment.')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="digest">
      <div className="digest-header">
        <h1>Digest</h1>
        <button className="ghost" onClick={refresh} disabled={refreshing}>
          {refreshing ? 'Curating…' : 'Refresh'}
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
      {items?.length === 0 && (
        <p className="muted">No digest yet today — hit refresh to pull today's AI/dev headlines, curated for you.</p>
      )}

      <div className="digest-grid">
        {items?.map((i, idx) => (
          <TiltCard
            as="a"
            key={i.id}
            href={i.source_url}
            target="_blank"
            rel="noreferrer"
            className="digest-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <span className="digest-meta">
              <span className="tag-chip mint small">{i.category}</span>
              <span className="read-time">{readTime(i.summary)}</span>
            </span>
            <h3>{i.headline}</h3>
            <p>{i.summary}</p>
          </TiltCard>
        ))}
      </div>
    </div>
  )
}
