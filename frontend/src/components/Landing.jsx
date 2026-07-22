import { motion } from 'motion/react'
import TiltCard from './TiltCard'
import { CompassIcon, TargetIcon, LayersIcon, ChartIcon, ArrowUpRightIcon, FlameIcon } from './icons'

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
              <div className="card-tile-head">
                <span className="tag-chip small" style={{ background: f.tint, color: f.accent }}>
                  <f.icon />
                </span>
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
