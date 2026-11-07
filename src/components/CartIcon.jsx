import { forwardRef } from 'react'
import { motion } from 'motion/react'

const CartIcon = forwardRef(function CartIcon({ count = 0, bump = 0, className = '' }, ref) {
  return (
    <motion.span
      key={`bump-${bump}`}
      ref={ref}
      aria-hidden="true"
      animate={{ scale: [
        bump > 0 ? 1 : 1,
        bump > 0 ? 1.28 : 1,
        1,
      ] }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className={`relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-panel/60 text-ink-muted backdrop-blur-md ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M5.5 8h13l-1.1 11a1.5 1.5 0 0 1-1.5 1.3H8.1A1.5 1.5 0 0 1 6.6 19L5.5 8Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 520, damping: 20 }}
          className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold tabular-nums text-bg"
        >
          {count}
        </motion.span>
      )}
    </motion.span>
  )
})

export default CartIcon