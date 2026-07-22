import { motion } from 'motion/react'
import { colorForTag } from '../colorTags'
import { LockIcon, CheckIcon, FlameIcon } from './icons'

const ROW_HEIGHT = 128
const TOP_PAD = 50
const AMPLITUDE = 22 // how far nodes swing left/right, in % of container width

function nodeX(i) {
  return 50 + AMPLITUDE * Math.sin(i * 1.05)
}
function nodeY(i) {
  return TOP_PAD + i * ROW_HEIGHT
}

function smoothPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    const midY = (p0.y + p1.y) / 2
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`
  }
  return d
}

const STATUS_LABEL = {
  locked: 'Locked',
  available: 'Not started',
  in_progress: 'In progress',
  mastered: 'Mastered',
}

export default function ModuleGraph({ modules, subjectName, onOpenModule }) {
  const today = new Date().toISOString().slice(0, 10)
  const points = modules.map((_, i) => ({ x: nodeX(i), y: nodeY(i) }))
  const height = TOP_PAD + (modules.length - 1) * ROW_HEIGHT + 70
  const pathD = smoothPath(points)
  const traveled = modules.reduce((n, { status }) => n + (status !== 'locked' ? 1 : 0), 0)
  const travelD = smoothPath(points.slice(0, Math.max(traveled, 1)))

  return (
    <div className="module-graph" style={{ height }}>
      <svg className="module-graph-svg" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        <path d={pathD} className="graph-path-bg" />
        <motion.path
          d={travelD}
          className="graph-path-fg"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      {modules.map(({ module, status, mastery }, i) => {
        const accent = colorForTag(module.tag)
        const due = mastery && status !== 'locked' && mastery.next_review_date <= today
        const { x, y } = points[i]
        const labelSide = x < 50 ? 'right' : 'left'
        return (
          <motion.div
            key={module.id}
            className={`graph-node-wrap side-${labelSide}`}
            style={{ left: `${x}%`, top: y }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 18 }}
          >
            <button
              className={`graph-node status-${status}`}
              style={{ '--accent': accent.bar }}
              disabled={status === 'locked'}
              onClick={() => onOpenModule({ ...module, subjectName })}
              title={module.name}
            >
              {status === 'mastered' ? <CheckIcon /> : status === 'locked' ? <LockIcon /> : i + 1}
              {due && <span className="graph-node-due" />}
            </button>
            <div className="graph-label">
              {module.tag && <span className="tag-chip small" style={{ background: accent.tint, color: accent.text }}>{module.tag}</span>}
              <div className="graph-label-name">{module.name}</div>
              <div className="graph-label-status">
                {STATUS_LABEL[status]}
                {mastery?.streak > 0 && <span className="streak-badge small"><FlameIcon /> {mastery.streak}</span>}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
