import { motion } from 'motion/react'
import { useTilt } from '../useTilt'

// motion.button with a 3D tilt-toward-cursor hover effect. Pass `as="a"` for a link.
export default function TiltCard({ as = 'button', variants, style, className, children, ...rest }) {
  const tilt = useTilt()
  const Component = motion[as] ?? motion.button

  return (
    <Component
      ref={tilt.ref}
      variants={variants}
      className={className}
      style={{ ...tilt.style, ...style }}
      onMouseMove={tilt.onMouseMove}
      onMouseEnter={tilt.onMouseEnter}
      onMouseLeave={tilt.onMouseLeave}
      {...rest}
    >
      {children}
    </Component>
  )
}
