import { useRef } from 'react'
import { useMotionValue, useSpring, useTransform } from 'motion/react'

// 3D tilt-on-hover for cards: rotates toward the cursor position within the element.
export function useTilt(strength = 8) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springConfig = { stiffness: 300, damping: 22 }
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [strength, -strength]), springConfig)
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-strength, strength]), springConfig)
  const scale = useSpring(1, springConfig)
  const lift = useSpring(0, springConfig)

  const onMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const onMouseEnter = () => { scale.set(1.025); lift.set(-6) }
  const onMouseLeave = () => { x.set(0); y.set(0); scale.set(1); lift.set(0) }

  return {
    ref,
    style: { rotateX, rotateY, scale, y: lift, transformPerspective: 700 },
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
  }
}
