import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { press, stepSpring } from '../utils/motion'

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 18 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...stepSpring, when: 'beforeChildren' },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 10,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

export default function ReminderPopup({ open, onDone, onCancel }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onCancel?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
        >
          <motion.div
            aria-hidden="true"
            data-testid="reminder-backdrop"
            onClick={onCancel}
            className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reminder-title"
            data-testid="reminder-dialog"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="pointer-events-auto relative w-full max-w-sm rounded-3xl border border-hairline bg-panel/95 p-7 text-center shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...press, delay: 0.12 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent/40 bg-accent-soft"
            >
              <span
                className="absolute inset-0 rounded-full bg-accent/20 blur-xl"
                aria-hidden="true"
              />
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="relative"
              >
                <path
                  d="M9 12l2 2 4-4"
                  stroke="#e2b877"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            <h3
              id="reminder-title"
              className="font-display mt-5 text-2xl font-medium tracking-tight text-ink"
            >
              Check your order
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Please review all your items and make sure everything is exactly to your needs.
            </p>
            <motion.button
              type="button"
              data-cta-primary
              autoFocus
              onClick={onDone}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={press}
              className="relative mt-6 w-full rounded-full bg-gradient-to-r from-[#f0d9a8] via-accent to-accent-deep px-6 py-3 text-sm font-semibold text-bg transition-shadow hover:shadow-[0_16px_40px_-14px_rgba(226,184,119,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Got it
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}