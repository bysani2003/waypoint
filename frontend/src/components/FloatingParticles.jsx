const COLORS = ['#4c9a6a', '#e0714a', '#5b7fbd', '#9370b8', '#d9861f']

// Ambient particles drifting up the whole viewport, behind all content.
export default function FloatingParticles({ count = 18 }) {
  const particles = Array.from({ length: count }, (_, i) => {
    const size = 3 + Math.random() * 5
    return {
      id: i,
      size,
      left: `${Math.random() * 100}%`,
      color: COLORS[i % COLORS.length],
      duration: 14 + Math.random() * 14,
      delay: -(Math.random() * 20),
      drift: `${(Math.random() - 0.5) * 80}px`,
      opacity: 0.15 + Math.random() * 0.2,
    }
  })

  return (
    <div className="particle-field">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: p.opacity,
            '--drift': p.drift,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
