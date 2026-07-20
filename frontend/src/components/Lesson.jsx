import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import ReactMarkdown from 'react-markdown'
import { api } from '../api'

export default function Lesson({ module, onPractice, onBack }) {
  const [lesson, setLesson] = useState(null)
  const [deepening, setDeepening] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    setLesson(null)
    setShowVideo(false)
    api(`/modules/${module.id}/lesson`, { method: 'POST' }).then(setLesson)
  }, [module.id])

  const goDeeper = async () => {
    setDeepening(true)
    const updated = await api(`/modules/${module.id}/lesson/deepen`, { method: 'POST' })
    setLesson(updated)
    setDeepening(false)
  }

  const videoQuery = encodeURIComponent(`${module.subjectName ?? ''} ${module.name} explained`.trim())

  return (
    <div className="lesson-shell">
      <button className="back" onClick={onBack}>← roadmap</button>
      <div className="lesson-intro">
        {module.tag && <span className="tag-chip">{module.tag}</span>}
        <h1>{module.name}</h1>
      </div>

      {!lesson && <p className="muted">Writing your lesson…</p>}

      {lesson && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="lesson-page">
            <article className="lesson-content">
              <ReactMarkdown>{lesson.content}</ReactMarkdown>
            </article>
          </div>

          <div className="video-block">
            {!showVideo ? (
              <button className="ghost video-trigger" onClick={() => setShowVideo(true)}>
                ▶ Watch a video on this
              </button>
            ) : (
              <motion.div
                className="video-frame"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.35 }}
              >
                <iframe
                  src={`https://www.youtube.com/embed?listType=search&list=${videoQuery}`}
                  title="Related video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </motion.div>
            )}
          </div>

          <div className="lesson-actions">
            <button className="ghost" onClick={goDeeper} disabled={deepening}>
              {deepening ? 'Going deeper…' : 'Go deeper'}
            </button>
            <button onClick={() => onPractice(module)}>Practice this →</button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
