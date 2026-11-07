import { motion } from 'motion/react'

/** Soft radial glow that fades in just after the stage content loads. */
export function CardHalo() {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="pointer-events-none absolute inset-0"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(38% 44% at 5% 30%, rgba(226,184,119,0.10), transparent 70%)',
        }}
      />
    </motion.div>
  )
}

/** Diagonal sweep that glides across the cards from the left edge, once per trigger. */
export function CardSweep({ trigger }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 z-10"
      style={{
        background:
          'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.06) 60%, transparent 100%)',
      }}
      initial={{ x: '-70vw', left: 0, right: 0 }}
      animate={{ x: '130vw' }}
      transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity, delay: 0.6 }}
      key={trigger}
    />
  )
}