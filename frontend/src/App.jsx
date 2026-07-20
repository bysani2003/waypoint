import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { api } from './api'
import DueToday from './components/DueToday'
import SubjectDashboard from './components/SubjectDashboard'
import Roadmap from './components/Roadmap'
import Lesson from './components/Lesson'
import Exercise from './components/Exercise'
import ProgressDashboard from './components/ProgressDashboard'
import Digest from './components/Digest'
import { CompassIcon, TargetIcon, LayersIcon, ChartIcon, NewspaperIcon, FlameIcon } from './components/icons'

const TABS = [
  { key: 'due', label: 'Due today', icon: TargetIcon },
  { key: 'topics', label: 'All topics', icon: LayersIcon },
  { key: 'progress', label: 'Progress', icon: ChartIcon },
  { key: 'digest', label: 'Digest', icon: NewspaperIcon },
]

export default function App() {
  const [tab, setTab] = useState('due')
  const [subjectId, setSubjectId] = useState(null)
  const [module, setModule] = useState(null)
  const [stage, setStage] = useState('roadmap') // 'roadmap' | 'lesson' | 'exercise'
  const [summary, setSummary] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => { api('/summary').then(setSummary) }, [refreshKey])

  const bump = () => setRefreshKey((k) => k + 1)

  const openSubject = (id) => { setSubjectId(id); setStage('roadmap'); setTab('topics') }
  const openModule = (m, sid) => { setModule(m); setSubjectId(sid ?? subjectId); setStage('lesson'); setTab('topics') }
  const backToRoadmap = () => { setStage('roadmap'); bump() }

  let view = 'due'
  let content = (
    <DueToday onOpenModule={openModule} refreshKey={refreshKey} onGoToTopics={() => switchTab('topics')} />
  )

  if (tab === 'topics') {
    if (!subjectId) {
      view = 'topics'
      content = <SubjectDashboard onOpenSubject={openSubject} />
    } else if (stage === 'roadmap') {
      view = 'roadmap'
      content = <Roadmap subjectId={subjectId} onOpenModule={openModule} onBack={() => setSubjectId(null)} />
    } else if (stage === 'lesson') {
      view = `lesson-${module?.id}`
      content = <Lesson module={module} onPractice={() => setStage('exercise')} onBack={backToRoadmap} />
    } else if (stage === 'exercise') {
      view = `exercise-${module?.id}`
      content = <Exercise module={module} onDone={backToRoadmap} onBack={backToRoadmap} />
    }
  } else if (tab === 'progress') {
    view = 'progress'
    content = <ProgressDashboard />
  } else if (tab === 'digest') {
    view = 'digest'
    content = <Digest />
  }

  const switchTab = (key) => {
    setTab(key)
    if (key !== 'topics') { setSubjectId(null); setStage('roadmap') }
  }

  const glowRef = useRef(null)
  const onMouseMove = (e) => {
    if (glowRef.current) {
      glowRef.current.style.setProperty('--mx', `${e.clientX}px`)
      glowRef.current.style.setProperty('--my', `${e.clientY}px`)
    }
  }

  return (
    <div onMouseMove={onMouseMove}>
      <div ref={glowRef} className="cursor-glow" />
      <div className="app">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><CompassIcon /></div>
          <div className="brand-text">
            <h1>Waypoint</h1>
            <p>Learn anything, in depth</p>
          </div>
        </div>
        <motion.div
          className="streak-pill"
          key={summary?.day_streak}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'flex' }}
          >
            <FlameIcon />
          </motion.span>
          {summary ? `${summary.day_streak} day streak` : '…'}
        </motion.div>
      </header>

      <nav className="tabbar">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => switchTab(key)}>
            {tab === key && (
              <motion.span
                className="tab-pill-bg"
                layoutId="tab-pill-bg"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="tab-content">
              <Icon />
              {label}
              {key === 'due' && summary?.due_count > 0 && <span className="tab-count">{summary.due_count}</span>}
            </span>
          </button>
        ))}
      </nav>

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </main>
      </div>
    </div>
  )
}
