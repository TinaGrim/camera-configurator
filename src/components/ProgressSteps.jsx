import { motion } from 'motion/react'
import { stepSpring, stepSpringBack, popupSpring } from '../utils/motion'
import { useConfiguratorStore, STEPS } from '../store/useConfiguratorStore'

const LABELS = ['Stage', 'Camera', 'Kit', 'Review', 'Sent']
const ROW = 44

// The Back control lives in the step content (below the product card) on
// choose/customize; only review keeps one in the header.
const BACK_STEPS = ['review']

export default function ProgressSteps() {
  const step = useConfiguratorStore((s) => s.step)
  const direction = useConfiguratorStore((s) => s.direction)
  const back = useConfiguratorStore((s) => s.back)
  const index = STEPS.indexOf(step)

  // Offset the stacked items so the 3-slot window always shows
  // previous / current / next; continue pushes the list up by one row,
  // back pulls it down.
  const listY = -(index - 1) * ROW

  return (
    <>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-start gap-4 px-5 py-5 sm:px-8">
        <span className="text-sm font-semibold uppercase tracking-[0.35em] text-ink">
          Mirage<span className="text-accent">.</span>
        </span>

        {BACK_STEPS.includes(step) && (
          <motion.button
            type="button"
            onClick={back}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="pointer-events-auto mb-2 mt-1 flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-panel/60 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted backdrop-blur-md transition-colors hover:border-accent/50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </motion.button>
        )}
      </header>

      <div className="pointer-events-none absolute right-3 top-24 z-20 flex flex-col items-end sm:right-5 sm:top-28">
        <nav aria-label="Progress" className="pointer-events-auto">
          <div className="relative flex h-[132px] w-24 flex-col overflow-hidden sm:w-40">
            {/* Connecting track through the three visible slot centres. */}
            <div
              className="absolute bottom-[22px] right-[10px] top-[22px] w-px bg-white/15"
              aria-hidden="true"
            />

            <motion.div
              className="absolute inset-x-0 top-0"
              initial={false}
              animate={{ y: listY }}
              transition={direction >= 0 ? stepSpring : stepSpringBack}
            >
              {LABELS.map((label, i) => {
                const done = i < index
                const current = i === index
                return (
                  <div
                    key={label}
                    className="flex h-11 items-center justify-end gap-3"
                    aria-current={current ? 'step' : undefined}
                  >
                    <span
                      className={
                        current
                          ? 'font-display text-base font-medium tracking-tight text-ink sm:text-2xl'
                          : 'text-[9px] font-medium uppercase tracking-[0.14em] text-ink-muted opacity-45 sm:text-xs'
                      }
                    >
                      {label}
                    </span>

                    <span className="relative flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center">
                      {current ? (
                        <motion.span
                          key="current"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={popupSpring}
                          className="flex h-3 w-3 items-center justify-center rounded-full bg-accent shadow-[0_0_16px_3px_rgba(226,184,119,0.55)]"
                        />
                      ) : done ? (
                        <motion.span
                          key="done"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.85 }}
                          transition={popupSpring}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 ring-1 ring-inset ring-accent/50"
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M20 6L9 17l-5-5"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </motion.span>
                      ) : (
                        <motion.span
                          key="next"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={popupSpring}
                          className="h-2 w-2 rounded-full bg-white/20"
                        />
                      )}
                    </span>
                  </div>
                )
              })}
            </motion.div>
          </div>
        </nav>
      </div>
    </>
  )
}