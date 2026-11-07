import { forwardRef } from 'react'
import { motion } from 'motion/react'
import { stepSpring, stepSpringBack } from '../utils/motion'
const stepVariants = {
  enter: (dir) => ({
    opacity: 0,
    y: dir >= 0 ? 26 : -26,
    transition: stepSpring,
  }),
  center: {
    opacity: 1,
    y: 0,
    transition: { ...stepSpring, when: 'beforeChildren' },
  },
  exit: (dir) => ({
    opacity: 0,
    y: dir >= 0 ? -8 : 8,
    transition: stepSpringBack,
  }),
}

const StepShell = forwardRef(function StepShell({ step, direction, children, className = '' }, ref) {
  return (
    <motion.div
      ref={ref}
      key={step}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className={`pointer-events-none ${className}`}
    >
      {children}
    </motion.div>
  )
})

export default StepShell