import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { api } from '../api'
import { colorForTag } from '../colorTags'
import AnimatedNumber from './AnimatedNumber'
import TiltCard from './TiltCard'
import { CardSkeletonGrid } from './Skeleton'
import { ArrowUpRightIcon, FlameIcon, LayersIcon, ChartIcon } from './icons'

const HEADLINES = [
  ['Small reps.', 'Big compound.'],
  ['Show up today.', 'Thank yourself later.'],
  ['A little, often.', 'Beats a lot, rarely.'],
  ['Keep the streak.', 'Keep the skill.'],
]

function pickHeadline() {
  const dayIndex = Math.floor(Date.now() / 86400000)
  return HEADLINES[dayIndex % HEADLINES.length]
}

const gridVariants = { show: { transition: { staggerChildren: 0.06 } } }
const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

export default function DueToday({ onOpenModule, onGoToTopics, refreshKey }) {
  const [due, setDue] = useState(null)
  const [subjects, setSubjects] = useState(null)
  const [summary, setSummary] = useState(null)
  const [line1, line2] = pickHeadline()

  useEffect(() => {
    api('/due').then(setDue)
    api('/summary').then(setSummary)
    api('/subjects').then(setSubjects)
  }, [refreshKey])

  const today = new Date()
  const dateLabel = today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()

  const start = () => {
    if (due && due.length > 0) {
      const first = due[0]
      onOpenModule({ ...first.module, subjectName: first.subject.name }, first.subject.id)
    } else {
      onGoToTopics()
    }
  }

  const dueCount = due?.length ?? 0

  return (
    <div className="due-today">
      <motion.div
        className="hero"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="hero-blob"
          animate={{ x: [0, 18, -10, 0], y: [0, -12, 8, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <p className="eyebrow hero-date">{dateLabel}</p>
        <h1>
          {line1.split(' ').map((w, i) => (
            <motion.span
              key={`a${i}`}
              style={{ display: 'inline-block' }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {w}&nbsp;
            </motion.span>
          ))}
          <br />
          <em>
            {line2.split(' ').map((w, i) => (
              <motion.span
                key={`b${i}`}
                style={{ display: 'inline-block' }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + 0.05 * i, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                {w}&nbsp;
              </motion.span>
            ))}
          </em>
        </h1>
        <p className="hero-sub">
          {dueCount > 0 ? (
            <>You have <b>{dueCount} topic{dueCount === 1 ? '' : 's'}</b> ready for review. One focused session — about {dueCount * 8} minutes — keeps the whole tree green.</>
          ) : (
            <>Nothing due right now — nice work. Explore <b>All topics</b> to get ahead instead.</>
          )}
        </p>
        <div className="hero-actions">
          <motion.button className="btn-primary" onClick={start} whileTap={{ scale: 0.96 }}>
            {dueCount > 0 ? "Start today's session" : 'Explore all topics'} <ArrowUpRightIcon />
          </motion.button>
        </div>

        {summary && (
          <motion.div
            className="hero-stats"
            variants={gridVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div className="hero-stat-card" variants={cardVariants}>
              <span className="hero-stat-dot" />
              <div>
                <div className="hero-stat-value"><AnimatedNumber value={summary.mastery_pct} suffix="%" /></div>
                <div className="hero-stat-label">overall mastery</div>
              </div>
            </motion.div>
            <motion.div className="hero-stat-card" variants={cardVariants}>
              <FlameIcon />
              <div>
                <div className="hero-stat-value"><AnimatedNumber value={summary.day_streak} /></div>
                <div className="hero-stat-label">day streak</div>
              </div>
            </motion.div>
            <motion.div className="hero-stat-card" variants={cardVariants}>
              <ChartIcon />
              <div>
                <div className="hero-stat-value"><AnimatedNumber value={summary.mastered_count} /> / <AnimatedNumber value={summary.total_modules} /></div>
                <div className="hero-stat-label">modules mastered</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {due === null && <CardSkeletonGrid />}

      {dueCount > 0 && (
        <motion.div className="card-grid" variants={gridVariants} initial="hidden" animate="show">
          {due.map(({ subject, module, mastery }) => {
            const accent = colorForTag(module.tag)
            return (
              <TiltCard
                key={module.id}
                variants={cardVariants}
                className="card-tile"
                style={{ '--accent': accent.bar }}
                onClick={() => onOpenModule({ ...module, subjectName: subject.name }, subject.id)}
              >
                <div className="card-tile-head">
                  <span className="tag-chip small" style={{ background: accent.tint, color: accent.text }}>{module.tag || subject.name}</span>
                  <ArrowUpRightIcon className="card-tile-arrow" />
                </div>
                <h3>{module.name}</h3>
                <p>{module.summary}</p>
                <div className="card-tile-foot">
                  {mastery?.streak > 0 && <span className="streak-badge small"><FlameIcon /> streak {mastery.streak}</span>}
                  {mastery?.last_score != null && <span>· last {Math.round(mastery.last_score * 100)}%</span>}
                </div>
              </TiltCard>
            )
          })}
        </motion.div>
      )}

      {dueCount === 0 && subjects?.length > 0 && (
        <div className="jump-back-in">
          <p className="eyebrow">jump back in</p>
          <motion.div className="card-grid" variants={gridVariants} initial="hidden" animate="show">
            {subjects.map(({ subject, module_count, mastered_count }) => {
              const accent = colorForTag(subject.name)
              return (
                <TiltCard
                  key={subject.id}
                  variants={cardVariants}
                  className="card-tile"
                  style={{ '--accent': accent.bar }}
                  onClick={onGoToTopics}
                >
                  <div className="card-tile-head">
                    <LayersIcon />
                    <ArrowUpRightIcon className="card-tile-arrow" />
                  </div>
                  <h3>{subject.name}</h3>
                  <p>{subject.description}</p>
                  <div className="card-tile-foot">
                    <span>{mastered_count}/{module_count} mastered</span>
                  </div>
                </TiltCard>
              )
            })}
          </motion.div>
        </div>
      )}
    </div>
  )
}
