import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { press, stepSpring } from '../utils/motion'
import { telegramChatOrderUrl } from '../config/telegram'
import { useConfiguratorStore } from '../store/useConfiguratorStore'

export default function TelegramHandoff() {
  const completedOrder = useConfiguratorStore((s) => s.completedOrder)
  const restart = useConfiguratorStore((s) => s.restart)

  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const showToast = (msg) => {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
  }, [])

  if (!completedOrder) return null

  return (
    <div className="w-full max-w-md text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={stepSpring}
        className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-accent/40 bg-accent-soft"
      >
        <span className="absolute inset-0 rounded-full bg-accent/20 blur-xl" aria-hidden="true" />
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="relative"
        >
          <path
            d="M20 6L9 17l-5-5"
            stroke="#e2b877"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <h2 className="font-display mt-7 text-4xl font-medium tracking-tight text-ink">
        Order <span className="gold-text italic">ready</span>
      </h2>
      <p className="mt-3 text-sm text-ink-muted">
        Thank for your order. We&apos;ll shipping your order soon.
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <motion.button
          type="button"
          onClick={() => {
            window.open(telegramChatOrderUrl(completedOrder.orderText), '_blank')
            showToast('Chat opened with your order pre-filled')
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={press}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f0d9a8] via-accent to-accent-deep px-6 py-3 text-sm font-semibold text-bg transition-shadow hover:shadow-[0_16px_40px_-14px_rgba(226,184,119,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Open the shop chat
        </motion.button>
      </div>

      <motion.button
        type="button"
        onClick={restart}
        whileTap={{ scale: 0.97 }}
        transition={press}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-hairline px-6 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-ink-muted transition-colors hover:border-white/20 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        Back to home
      </motion.button>

      <div className="mt-8 flex items-center justify-center gap-3">
        <span className="gold-hairline w-16" />
        <span className="eyebrow text-ink-faint">MIRAGE</span>
        <span className="gold-hairline w-16" />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-hairline bg-panel-soft px-5 py-2.5 text-sm text-ink"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}