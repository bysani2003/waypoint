import { useState } from 'react'
import { motion } from 'motion/react'
import TiltCard from './TiltCard'
import {
  CompassIcon, SparkleIcon, SearchIcon, ArrowRightIcon, ArrowUpRightIcon,
  SignpostIcon, LayersIcon, BrainIcon, RefreshIcon, CheckIcon, LockIcon,
} from './icons'

const FEATURES = [
  {
    icon: SignpostIcon,
    title: 'A roadmap for anything',
    body: "Whether it's Abstract Algebra or System Design, Waypoint structures the chaos into a clear, step-by-step path.",
  },
  {
    icon: LayersIcon,
    title: 'Lessons with real depth',
    body: 'No superficial summaries. We include the derivations, the proofs, and the "why" behind every concept.',
  },
  {
    icon: BrainIcon,
    title: 'Hints then full walkthrough',
    body: 'Productive struggle is how we learn. Waypoint gives you progressive hints before revealing the full solution.',
  },
  {
    icon: RefreshIcon,
    title: 'Spaced repetition that remembers',
    body: 'An intelligent algorithm schedules your reviews exactly when your brain is about to forget, maximizing retention.',
  },
]

const STEPS = [
  {
    n: '1',
    title: 'Name what you want to learn',
    body: "Tell Waypoint your goal. We'll generate a comprehensive, logically ordered roadmap from fundamentals to advanced topics.",
    mock: (
      <div className="step-mock">
        <p className="step-mock-label">CREATE NEW GOAL</p>
        <div className="step-mock-input">
          <SearchIcon />
          <span>Algorithm Design</span>
          <span className="step-mock-go"><ArrowRightIcon /></span>
        </div>
        <div className="step-mock-bar" /><div className="step-mock-bar short" />
      </div>
    ),
  },
  {
    n: '2',
    title: 'Learn it, then practice it',
    body: "Engage with deep lessons that don't skip the hard parts. Try hints when stuck, then review the full walkthrough.",
    mock: (
      <div className="step-mock">
        <div className="step-mock-row">
          <span className="step-mock-title">1.2 Shannon Entropy</span>
          <span className="tag-chip small">DERIVATION</span>
        </div>
        <div className="step-mock-bar" /><div className="step-mock-bar" /><div className="step-mock-bar short" />
        <div className="step-mock-foot">
          <div className="step-mock-bar tiny" />
          <span className="step-mock-hint">⚡ Hint</span>
        </div>
      </div>
    ),
  },
  {
    n: '3',
    title: 'Let spaced repetition do the rest',
    body: 'Waypoint schedules reviews optimally, ensuring what you learn today stays with you permanently.',
    mock: (
      <div className="step-mock">
        <p className="step-mock-label">MEMORY STRENGTH</p>
        <div className="step-mock-stat-row">
          <span className="step-mock-stat">94%</span>
          <span className="tag-chip small mint">OPTIMAL</span>
        </div>
        <div className="step-mock-foot" style={{ marginTop: 40 }}>
          <span className="muted" style={{ fontSize: 11 }}>LAST WEEK</span>
          <span className="muted" style={{ fontSize: 11 }}>TODAY</span>
        </div>
      </div>
    ),
  },
]

export default function Landing({ onGetStarted, onLogin }) {
  const [query, setQuery] = useState('')

  const go = (e) => {
    e.preventDefault()
    onGetStarted(query.trim() || undefined)
  }

  const scrollTo = (id) => (e) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="auth-brand">
          <div className="brand-mark"><CompassIcon /></div>
          <span>Waypoint</span>
        </div>
        <nav className="landing-nav-links">
          <a href="#philosophy" onClick={scrollTo('philosophy')}>Philosophy</a>
          <a href="#method" onClick={scrollTo('method')}>Method</a>
          <a href="#pricing" onClick={scrollTo('pricing')}>Pricing</a>
        </nav>
        <div className="landing-nav-actions">
          <button className="nav-link-btn" onClick={onLogin}>Log in</button>
          <button className="nav-cta" onClick={() => onGetStarted()}>Get started</button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <motion.span
            className="landing-badge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SparkleIcon /> A smarter way to learn
          </motion.span>
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
          <motion.form
            className="landing-search"
            onSubmit={go}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <SearchIcon />
            <input
              placeholder="e.g. Information Theory"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Go <ArrowRightIcon /></button>
          </motion.form>
        </div>

        <motion.div
          className="hero-mock-frame"
          initial={{ opacity: 0, y: 30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero-mock-header">
            <div className="brand-mark small"><CompassIcon /></div>
            <div>
              <div className="hero-mock-title">Algorithm Design</div>
              <div className="hero-mock-sub">Current Roadmap</div>
            </div>
            <span className="hero-mock-pct">25%</span>
          </div>

          <div className="hero-mock-timeline">
            <div className="hero-mock-node done">
              <span className="hero-mock-dot done"><CheckIcon /></span>
              <div>
                <div className="hero-mock-node-title">Arrays &amp; Hashing</div>
                <div className="hero-mock-node-body">Master memory contiguity and constant-time lookups.</div>
              </div>
            </div>

            <div className="hero-mock-node current">
              <span className="hero-mock-dot current" />
              <div className="hero-mock-current-card">
                <div className="hero-mock-node-title">Two Pointers</div>
                <div className="hero-mock-node-body">Optimize space to O(1) in linear sequences.</div>
                <div className="hero-mock-progress"><div className="hero-mock-progress-fill" /></div>
              </div>
            </div>

            <div className="hero-mock-node locked">
              <span className="hero-mock-dot locked"><LockIcon /></span>
              <div>
                <div className="hero-mock-node-title muted">Dynamic Programming</div>
                <div className="hero-mock-node-body">Overlapping subproblems &amp; memoization.</div>
              </div>
            </div>

            <div className="hero-mock-node locked">
              <span className="hero-mock-dot locked"><LockIcon /></span>
              <div>
                <div className="hero-mock-node-title muted">Interval DP</div>
                <div className="hero-mock-node-body">Advanced tabular methods.</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="landing-steps" id="method">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            className="step"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            {s.mock}
            <span className="step-n">{s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </motion.div>
        ))}
      </section>

      <section className="landing-features-dark" id="philosophy">
        <div className="card-grid">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="dark-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <f.icon />
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="landing-footer-cta" id="pricing">
        <div className="footer-cta-blob" />
        <h2>Ready to actually learn it?</h2>
        <div className="landing-cta">
          <motion.button className="btn-primary" onClick={() => onGetStarted()} whileTap={{ scale: 0.96 }}>
            Get started free <ArrowRightIcon />
          </motion.button>
          <span className="hero-stat">free — no card required</span>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="auth-brand small">
          <div className="brand-mark small"><CompassIcon /></div>
          <span>Waypoint</span>
        </div>
        <p className="muted">© 2026 Waypoint. Designed for curious minds.</p>
      </footer>
    </div>
  )
}
