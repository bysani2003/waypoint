import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { api } from '../api'
import { useCachedFetch } from '../useCachedFetch'
import ProgressRing from './ProgressRing'
import TiltCard from './TiltCard'
import { CardSkeletonGrid } from './Skeleton'
import { colorForTag } from '../colorTags'
import { PlusIcon, ArrowUpRightIcon } from './icons'

const gridVariants = { show: { transition: { staggerChildren: 0.06 } } }
const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

export default function SubjectDashboard({ onOpenSubject }) {
  const subjects = useCachedFetch('/subjects')
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const createSubject = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    setError(null)
    try {
      const subject = await api('/subjects', { method: 'POST', body: JSON.stringify({ name: name.trim() }) })
      setName('')
      setAdding(false)
      onOpenSubject(subject.id)
    } catch (err) {
      setError('Could not build a roadmap for that — try rephrasing it, or try again.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <p className="eyebrow">what do you want to learn</p>
        <h1>Pick a subject, or chart a new one.</h1>
      </div>

      {subjects === null && <CardSkeletonGrid />}

      {subjects !== null && (
      <motion.div className="card-grid" variants={gridVariants} initial="hidden" animate="show">
        {subjects.map(({ subject, module_count, mastered_count, due_count }) => {
          const accent = colorForTag(subject.name)
          return (
            <TiltCard
              key={subject.id}
              variants={cardVariants}
              className="card-tile"
              style={{ '--accent': accent.bar }}
              onClick={() => onOpenSubject(subject.id)}
            >
              <div className="card-tile-head">
                <ProgressRing value={module_count ? mastered_count / module_count : 0} size={44} stroke={4} />
                <ArrowUpRightIcon className="card-tile-arrow" />
              </div>
              <h3>{subject.name}</h3>
              <p>{subject.description}</p>
              <div className="card-tile-foot">
                <span>{mastered_count}/{module_count} mastered</span>
                {due_count > 0 && <span className="due-pill">{due_count} due today</span>}
              </div>
            </TiltCard>
          )
        })}

        <AnimatePresence mode="wait">
          {!adding ? (
            <motion.button
              key="new"
              variants={cardVariants}
              className="card-tile card-tile-new"
              onClick={() => setAdding(true)}
            >
              <PlusIcon />
              <span>Learn something new</span>
            </motion.button>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="card-tile card-tile-form"
              onSubmit={createSubject}
            >
              <label>What do you want to learn?</label>
              <input
                autoFocus
                placeholder="e.g. Linear Algebra, Spanish subjunctive, React hooks…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={creating}
              />
              {error && <p className="form-error">{error}</p>}
              <div className="card-tile-form-actions">
                <button type="button" className="ghost" onClick={() => { setAdding(false); setError(null) }} disabled={creating}>
                  Cancel
                </button>
                <button type="submit" disabled={creating || !name.trim()}>
                  {creating ? 'Building your roadmap…' : 'Build roadmap'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
      )}
    </div>
  )
}
