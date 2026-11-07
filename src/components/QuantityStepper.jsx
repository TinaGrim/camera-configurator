import { motion } from 'motion/react'
import { press } from '../utils/motion'
import { getQuantity } from '../utils/pricing'
import { useConfiguratorStore } from '../store/useConfiguratorStore'

export default function QuantityStepper({ itemId, min = 1, onAdded }) {
  const quantity = useConfiguratorStore((s) => getQuantity(s.quantities, itemId, min))
  const setItemQuantity = useConfiguratorStore((s) => s.setItemQuantity)

  const dec = () => setItemQuantity(itemId, quantity - 1)
  const inc = () => {
    const next = quantity + 1
    setItemQuantity(itemId, next)
    onAdded?.(itemId, next)
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-11 w-[120px] items-center justify-center gap-1 rounded-full border border-hairline bg-panel/60 px-1.5 backdrop-blur-md sm:h-auto sm:w-auto sm:py-1.5">
      <motion.button
        type="button"
        aria-label="Decrease quantity"
        onClick={dec}
        disabled={quantity <= min}
        whileTap={quantity > min ? { scale: 0.9 } : undefined}
        transition={press}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:text-ink-faint/60 sm:h-9 sm:w-9"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </motion.button>
      <span
        aria-live="polite"
        className="flex h-8 min-w-[2.5ch] items-center justify-center text-sm font-semibold tabular-nums text-ink sm:h-9"
      >
        {quantity}
      </span>
      <motion.button
        type="button"
        aria-label="Increase quantity"
        onClick={inc}
        disabled={quantity >= 12}
        whileTap={quantity < 12 ? { scale: 0.9 } : undefined}
        transition={press}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:text-ink-faint/60 sm:h-9 sm:w-9"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </motion.button>
      </div>
    </div>
  )
}