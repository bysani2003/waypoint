import { useCachedFetch } from '../useCachedFetch'
import { motion } from 'motion/react'
import { RowSkeletonList } from './Skeleton'
import { FlameIcon } from './icons'

export default function ProgressDashboard() {
  const data = useCachedFetch('/progress')

  if (!data) {
    return (
      <div className="progress-dashboard">
        <h1>Progress</h1>
        <RowSkeletonList />
      </div>
    )
  }

  return (
    <div className="progress-dashboard">
      <h1>Progress</h1>
      {data.map((s, si) => (
        <motion.div
          key={s.subject_id}
          className="progress-subject"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.08, duration: 0.35 }}
        >
          <h3>{s.subject}</h3>
          <div className="progress-rows">
            {s.modules.map((m, mi) => (
              <motion.div
                key={m.module}
                className="progress-row"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: si * 0.08 + mi * 0.03, duration: 0.25 }}
              >
                <div className="progress-row-label">
                  <span>{m.module}</span>
                  {m.tag && <span className="tag-chip small">{m.tag}</span>}
                </div>
                <div className="progress-row-bar-track">
                  <motion.div
                    className={`progress-row-bar-fill status-${m.status}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((m.last_score ?? 0) * 100)}%` }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="progress-row-meta">
                  {m.streak > 0 && <span className="streak-badge small"><FlameIcon /> {m.streak}</span>}
                  <span className="muted">{m.last_score != null ? `${Math.round(m.last_score * 100)}%` : '—'}</span>
                  <span className="muted">{m.next_review_date ?? '—'}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
