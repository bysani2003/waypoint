import { useState } from 'react'
import { useCachedFetch } from '../useCachedFetch'
import { motion } from 'motion/react'
import { colorForTag } from '../colorTags'
import TiltCard from './TiltCard'
import ModuleGraph from './ModuleGraph'
import { RowSkeletonList } from './Skeleton'
import { LockIcon, CheckIcon, FlameIcon, ArrowUpRightIcon, CompassIcon, LayersIcon } from './icons'

const STATUS_LABEL = {
  locked: 'Locked',
  available: 'Not started',
  in_progress: 'In progress',
  mastered: 'Mastered',
}

const listVariants = { show: { transition: { staggerChildren: 0.05 } } }
const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

export default function Roadmap({ subjectId, onOpenModule, onBack }) {
  const data = useCachedFetch(`/subjects/${subjectId}/roadmap`, { deps: [subjectId] })
  const [view, setView] = useState('map')
  const today = new Date().toISOString().slice(0, 10)

  if (!data) {
    return (
      <div className="roadmap">
        <button className="back" onClick={onBack}>← all subjects</button>
        <RowSkeletonList />
      </div>
    )
  }

  const total = data.modules.length
  const mastered = data.modules.filter((m) => m.status === 'mastered').length

  return (
    <div className="roadmap">
      <button className="back" onClick={onBack}>← all subjects</button>
      <div className="roadmap-header">
        <div className="roadmap-header-top">
          <div>
            <p className="eyebrow">{total} modules · fundamentals to advanced</p>
            <h1>{data.subject.name}</h1>
          </div>
          <div className="view-toggle">
            <button className={`toggle-btn ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')}>
              <CompassIcon /> Map
            </button>
            <button className={`toggle-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
              <LayersIcon /> List
            </button>
          </div>
        </div>
        <p className="muted">{data.subject.description}</p>
        <div className="trail-progress">
          <motion.div
            className="trail-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(mastered / total) * 100}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <p className="trail-progress-label">{mastered} of {total} mastered</p>
      </div>

      {view === 'map' ? (
        <ModuleGraph modules={data.modules} subjectName={data.subject.name} onOpenModule={onOpenModule} />
      ) : (
        <motion.div className="trail" variants={listVariants} initial="hidden" animate="show">
          {data.modules.map(({ module, status, mastery }, i) => {
            const due = mastery && (status === 'in_progress' || status === 'mastered') && mastery.next_review_date <= today
            const accent = colorForTag(module.tag)
            return (
              <TiltCard
                key={module.id}
                variants={itemVariants}
                className={`card-tile waypoint waypoint-${status}`}
                style={{ '--accent': accent.bar }}
                disabled={status === 'locked'}
                onClick={() => onOpenModule({ ...module, subjectName: data.subject.name })}
              >
                <span className="waypoint-node">
                  {status === 'mastered' ? <CheckIcon /> : status === 'locked' ? <LockIcon /> : i + 1}
                </span>
                <span className="waypoint-body">
                  <span className="waypoint-top">
                    {module.tag && <span className="tag-chip small" style={{ background: accent.tint, color: accent.text }}>{module.tag}</span>}
                    {due && <span className="due-pill">due today</span>}
                    <span className="waypoint-status">{STATUS_LABEL[status]}</span>
                  </span>
                  <span className="waypoint-name">{module.name}</span>
                  <span className="waypoint-summary">{module.summary}</span>
                  {mastery?.streak > 0 && (
                    <span className="streak-badge"><FlameIcon /> {mastery.streak}</span>
                  )}
                </span>
                {status !== 'locked' && <ArrowUpRightIcon className="waypoint-go" />}
              </TiltCard>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
