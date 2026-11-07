import { motion } from 'motion/react'
import { press } from '../utils/motion'
export default function BottomCTA({ onClick, children, hint }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
      className="flex flex-col items-center gap-2"
    >
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        transition={press}
        className="pointer-events-auto inline-flex h-11 w-[120px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f0d9a8] via-accent to-accent-deep text-sm font-semibold text-bg transition-shadow hover:shadow-[0_18px_44px_-16px_rgba(226,184,119,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:h-auto sm:w-auto sm:px-8 sm:py-3.5"
      >
        {children}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>
      {hint && <p className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">{hint}</p>}
    </motion.div>
  )
}