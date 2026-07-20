import { useEffect, useRef } from 'react'
import { animate } from 'motion/react'

export default function AnimatedNumber({ value, suffix = '', duration = 1 }) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent = Math.round(v) + suffix
      },
    })
    return () => controls.stop()
  }, [value, suffix, duration])

  return <span ref={ref}>0{suffix}</span>
}
