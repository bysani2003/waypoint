import { useState } from 'react'
import { motion } from 'motion/react'
import { api, setToken } from '../api'
import { CompassIcon } from './icons'

export default function Auth({ mode: initialMode = 'signup', onAuthed, onBack, pendingSubject }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await api(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setToken(data.token)
      onAuthed(data.user)
    } catch (err) {
      try {
        const parsed = JSON.parse(err.message)
        setError(parsed.detail || 'Something went wrong')
      } catch {
        setError('Something went wrong — try again')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <button className="back" onClick={onBack}>← back</button>
        <div className="auth-brand">
          <div className="brand-mark"><CompassIcon /></div>
          <span>Waypoint</span>
        </div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'signup' ? 12 : -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h1>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
          <p className="muted">
            {mode === 'signup'
              ? pendingSubject
                ? `Free — we'll set up "${pendingSubject}" as soon as you sign up.`
                : 'Free — your own subjects, roadmaps, and progress.'
              : 'Log in to pick up where you left off.'}
          </p>
        </motion.div>

        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email"
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <label>Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
          />
          {error && <p className="form-error">{error}</p>}
          <button className="btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'signup' ? (
            <>Already have an account? <button className="link-btn" onClick={() => setMode('login')}>Log in</button></>
          ) : (
            <>New here? <button className="link-btn" onClick={() => setMode('signup')}>Create an account</button></>
          )}
        </p>
      </motion.div>
    </div>
  )
}
