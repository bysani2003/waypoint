import { motion } from 'motion/react'
import TiltCard from './TiltCard'
import { CompassIcon, TargetIcon, LayersIcon, ChartIcon, ArrowUpRightIcon, FlameIcon, CheckIcon } from './icons'

const FEATURES = [
  {
    icon: LayersIcon,
    accent: '#4c9a6a',
    tint: '#e3f1e7',
    title: 'A roadmap for anything',
    body: 'Type in any subject — Linear Algebra, Spanish, Sliding Window — and get an ordered curriculum from fundamentals to advanced.',
  },
  {
    icon: CompassIcon,
    accent: '#5b7fbd',
    tint: '#e7ecf7',
    title: 'Lessons with real depth',
    body: 'Not a summary. Worked examples, and derivations where the subject calls for them — plus a video and a "go deeper" button.',
  },
  {
    icon: TargetIcon,
    accent: '#e0714a',
    tint: '#fbeae1',
    title: 'Hints, then the full walkthrough',
    body: 'Get stuck, ask for a hint. Submit anyway, and see the full reference solution regardless of how you did.',
  },
  {
    icon: ChartIcon,
    accent: '#9370b8',
    tint: '#f0e9f6',
    title: 'Spaced repetition that remembers',
    body: 'Nail a topic and it resurfaces further out. Struggle, and it comes back tomorrow. Weak spots never get to hide.',
  },
]

const STEPS = [
  { n: '01', title: 'Name what you want to learn', body: 'Any subject, any level of obscurity. The roadmap is built for you.' },
  { n: '02', title: 'Learn it, then practice it', body: 'Read the lesson, attempt an exercise, get hints if you need them.' },
  { n: '03', title: 'Let spaced repetition do the rest', body: 'Review lands right when you\'re about to forget — not before, not after.' },
]

export default function Landing({ onGetStarted, onLogin }) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="auth-brand">
          <div className="brand-mark"><CompassIcon /></div>
          <span>Waypoint</span>
        </div>
        <button className="ghost" onClick={onLogin}>Log in</button>
      </header>

      <motion.div
        className="hero-frame landing-hero-frame"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
      <section className="landing-hero">
        <motion.div
          className="hero-blob"
          animate={{ x: [0, 20, -12, 0], y: [0, -14, 10, 0], scale: [1, 1.06, 0.97, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          learn anything, in depth
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Pick a subject.<br /><em>Actually learn it.</em>
        </motion.h1>
        <motion.p
          className="landing-sub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Waypoint builds you a real roadmap for whatever you want to learn, teaches it in depth —
          derivations included — and uses spaced repetition so it actually sticks.
        </motion.p>
        <motion.div
          className="landing-cta"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.button className="btn-primary" onClick={onGetStarted} whileTap={{ scale: 0.96 }}>
            Get started free <ArrowUpRightIcon />
          </motion.button>
          <span className="hero-stat">
            <FlameIcon /> free — no card required
          </span>
        </motion.div>

        <motion.div
          className="preview-mock"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="preview-mock-card">
            <div className="preview-mock-row">
              <span className="tag-chip small" style={{ background: '#e3f1e7', color: '#2f6b4b' }}>Arrays</span>
              <ArrowUpRightIcon className="card-tile-arrow" />
            </div>
            <div className="preview-mock-title">Two Pointers</div>
            <div className="preview-mock-bar" />
            <div className="preview-mock-bar short" />
            <div className="preview-mock-foot">
              <span className="streak-badge small"><FlameIcon /> streak 4</span>
              <span className="due-pill">due today</span>
            </div>
          </div>
          <div className="preview-mock-card offset">
            <div className="preview-mock-row">
              <span className="tag-chip small" style={{ background: '#e7ecf7', color: '#3d5c94' }}>DP</span>
              <CheckIcon className="preview-mock-check" />
            </div>
            <div className="preview-mock-title">Interval DP</div>
            <div className="preview-mock-bar" />
            <div className="preview-mock-bar short" />
            <div className="preview-mock-foot">
              <span className="muted" style={{ fontSize: 12.5 }}>mastered · 96%</span>
            </div>
          </div>
        </motion.div>
      </section>
      </motion.div>

      <section className="landing-steps">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            className="step"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <span className="step-n">{s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </motion.div>
        ))}
      </section>

      <section className="landing-features">
        <div className="card-grid">
          {FEATURES.map((f, i) => (
            <TiltCard
              key={f.title}
              as="div"
              className="card-tile"
              style={{ '--accent': f.accent }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="feature-icon" style={{ background: f.tint, color: f.accent }}>
                <f.icon />
              </div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      <section className="landing-footer-cta">
        <h2>Ready to actually learn something?</h2>
        <button className="btn-primary" onClick={onGetStarted}>
          Create your free account <ArrowUpRightIcon />
        </button>
      </section>
    </div>
  )
}
