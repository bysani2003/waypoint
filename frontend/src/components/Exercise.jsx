import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import ReactMarkdown from 'react-markdown'
import { api } from '../api'
import Confetti from './Confetti'
import { FlameIcon } from './icons'

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
]

export default function Exercise({ module, onDone, onBack }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('preferredLanguage') || 'python')
  const [exercise, setExercise] = useState(null)
  const [answer, setAnswer] = useState('')
  const [explanation, setExplanation] = useState('')
  const [hints, setHints] = useState([])
  const [hintLoading, setHintLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setExercise(null)
    setAnswer('')
    setHints([])
    api('/exercises/generate', {
      method: 'POST',
      body: JSON.stringify({ module_id: module.id, language }),
    }).then(setExercise)
  }, [module.id, language])

  const changeLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem('preferredLanguage', lang)
  }

  const requestHint = async () => {
    setHintLoading(true)
    const { hint } = await api(`/exercises/${exercise.id}/hint`, {
      method: 'POST',
      body: JSON.stringify({ hint_level: hints.length + 1, previous_hints: hints }),
    })
    setHints((h) => [...h, hint])
    setHintLoading(false)
  }

  const submit = async () => {
    setSubmitting(true)
    const r = await api('/exercises/submit', {
      method: 'POST',
      body: JSON.stringify({ exercise_id: exercise.id, answer, explanation, hints_used: hints.length }),
    })
    setResult(r)
    setSubmitting(false)
  }

  if (result) {
    return (
      <motion.div
        className="exercise-shell"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="result-banner"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {result.combined_score >= 0.85 && (
            <motion.div
              className="result-glow"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
          {result.combined_score >= 0.9 && (
            <div style={{ position: 'absolute', top: '20%', left: '18%', width: 0, height: 0 }}>
              <Confetti />
            </div>
          )}
          <div>
            <p className="eyebrow">score</p>
            <motion.h1
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 14 }}
            >
              {Math.round(result.combined_score * 100)}%
            </motion.h1>
          </div>
          <div className="result-meta">
            <span className="streak-badge"><FlameIcon /> {result.streak}</span>
            <span className="muted">next review {result.next_review_date}</span>
          </div>
        </motion.div>

        <motion.section
          className="result-block"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          <h3>Review</h3>
          <p>{result.review.feedback}</p>
          {result.review.time_complexity && (
            <p className="muted">
              <b>Time:</b> {result.review.time_complexity} &nbsp; <b>Space:</b> {result.review.space_complexity}
            </p>
          )}
        </motion.section>

        {result.explanation_feedback && (
          <motion.section
            className="result-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
          >
            <h3>Understanding check</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{result.explanation_feedback}</p>
          </motion.section>
        )}

        <motion.section
          className="result-block walkthrough"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
        >
          <h3>Full walkthrough</h3>
          <ReactMarkdown>{result.walkthrough}</ReactMarkdown>
        </motion.section>

        <button onClick={onDone}>Back to roadmap</button>
      </motion.div>
    )
  }

  return (
    <div className="exercise-shell">
      <button className="back" onClick={onBack}>← roadmap</button>

      <div className="language-picker">
        {LANGUAGES.map((l) => (
          <button
            key={l.value}
            className={`lang-pill ${language === l.value ? 'active' : ''}`}
            onClick={() => changeLanguage(l.value)}
          >
            {l.label}
          </button>
        ))}
      </div>

      {!exercise ? (
        <p className="muted">Writing a practice exercise…</p>
      ) : (
        <motion.div key={exercise.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <h2>{exercise.title}</h2>
          <p className="exercise-prompt">{exercise.prompt}</p>

          <label>Explain the idea in your own words (this is checked separately)</label>
          <textarea rows={3} value={explanation} onChange={(e) => setExplanation(e.target.value)} />

          <label>Your answer</label>
          <textarea
            rows={exercise.kind === 'code' ? 12 : 6}
            className={exercise.kind === 'code' ? 'code' : ''}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          <AnimatePresence>
            {hints.length > 0 && (
              <div className="hints">
                {hints.map((h, i) => (
                  <motion.p
                    key={i}
                    className="hint"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.25 }}
                  >
                    <b>Hint {i + 1}:</b> {h}
                  </motion.p>
                ))}
              </div>
            )}
          </AnimatePresence>

          <div className="exercise-actions">
            <button className="ghost" onClick={requestHint} disabled={hintLoading || hints.length >= 3}>
              {hintLoading ? 'Thinking…' : hints.length >= 3 ? 'No more hints' : `Get a hint (${hints.length}/3 used)`}
            </button>
            <button disabled={submitting || !answer} onClick={submit}>
              {submitting ? 'Reviewing…' : 'Submit'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
