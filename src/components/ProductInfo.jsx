import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { getCamera, getAccessory, getQuantity, money } from '../utils/pricing'
import { useConfiguratorStore } from '../store/useConfiguratorStore'

const root = {
  hidden: {},
  visible: { transition: { delayChildren: 0.05, staggerChildren: 0.06 } },
}

const tag = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
}

/** Dropdown that reveals the camera's detail + spec right beside the spec pill. */
function SpecDropdown({ camera }) {
  const [open, setOpen] = useState(false)

  const rows = [
    { label: 'Model', value: camera.name },
    { label: 'Finish', value: camera.color },
    { label: 'Sensor', value: camera.spec },
    { label: 'Price', value: money(camera.price) },
    ...(camera.discountPercent > 0
      ? [{ label: 'Bundle', value: `−${camera.discountPercent}% off` }]
      : []),
  ]

  return (
    <div className="pointer-events-auto relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-hairline bg-panel/60 py-2.5 pl-4 pr-2.5 text-right backdrop-blur-md transition-colors hover:border-accent/50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span className="max-w-[64vw] truncate text-xs font-medium text-ink sm:text-sm">
          {camera.spec}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex h-4 w-4 flex-shrink-0 items-center justify-center text-ink-muted"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-full z-10 mt-2 w-52 overflow-hidden rounded-xl border border-hairline bg-panel/90 shadow-xl shadow-black/40 backdrop-blur-md"
          >
            <dl className="divide-y divide-hairline/60">
              {rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-3 px-3.5 py-2">
                  <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                    {row.label}
                  </dt>
                  <dd className="text-right text-xs tabular-nums text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ProductInfo() {
  const cameraId = useConfiguratorStore((s) => s.selectedCameraId)
  const step = useConfiguratorStore((s) => s.step)
  const selectedIds = useConfiguratorStore((s) => s.selectedAccessoryIds)
  const quantities = useConfiguratorStore((s) => s.quantities)
  const back = useConfiguratorStore((s) => s.back)

  const camera = getCamera(cameraId)
  if (!camera) return null

  const showName = step !== 'customize'
  const kitAccessories = selectedIds
    .map((id) => getAccessory(id))
    .filter(Boolean)
    .filter((a) => getQuantity(quantities, a.id, 0) > 0)
  const kitTitle = kitAccessories.length ? kitAccessories[kitAccessories.length - 1].name : ''
  const kitEyebrow = kitAccessories.length ? 'Your kit' : 'Stage'
  const kitSub = kitAccessories.length
    ? `${kitAccessories.length} ${kitAccessories.length === 1 ? 'item' : 'items'} in your kit`
    : 'Make it yours — pick your extras'

  return (
    <motion.div
      variants={root}
      initial="hidden"
      animate="visible"
      className="pointer-events-none absolute inset-0 z-20"
      aria-live="polite"
    >
      {/* Top-left column: the body name (or the selected kit on the customize
          step) with the Back control tucked below it. */}
      <div className="absolute left-4 top-14 flex flex-col items-start gap-3 sm:left-8 sm:top-20">
        <motion.div
          variants={tag}
          className="w-60 rounded-2xl border border-hairline bg-panel/60 px-5 py-4 backdrop-blur-md sm:max-w-xs"
        >
          <p className="eyebrow text-accent">
            {showName ? 'The body' : kitEyebrow}
          </p>
          {showName || kitTitle ? (
            <h2
              className={`font-display mt-1.5 font-medium leading-[1.02] tracking-tight text-ink ${
                showName ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-4xl'
              }`}
            >
              {showName ? camera.name : kitTitle}
            </h2>
          ) : null}
          <p className="mt-1.5 text-xs text-ink-muted sm:text-sm">
            {showName ? camera.color : kitSub}
          </p>
        </motion.div>

        <motion.button
          type="button"
          variants={tag}
          onClick={back}
          className="pointer-events-auto flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-panel/60 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted backdrop-blur-md transition-colors hover:border-accent/50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
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
      </div>

      {/* Top-right: spec */}
      <motion.div
        variants={tag}
        className="absolute right-4 top-4 sm:top-6 md:right-44 md:top-6 xl:right-52"
      >
        <SpecDropdown camera={camera} />
      </motion.div>
    </motion.div>
  )
}