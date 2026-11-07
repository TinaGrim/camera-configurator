import { motion } from 'motion/react'
import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import { ACCESSORIES, money, getQuantity } from '../utils/pricing'
import { useConfiguratorStore } from '../store/useConfiguratorStore'


const grid = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const card = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function AccessoryPicker({ className = '' }) {
  const focus = useConfiguratorStore((s) => s.focusAccessory)
  const quantities = useConfiguratorStore((s) => s.quantities)
  const targetId = useConfiguratorStore(
    (s) => s.selectedAccessoryIds[s.selectedAccessoryIds.length - 1]
  )
  const outerRef = useRef(null)
  const rowRef = useRef(null)
  const [range, setRange] = useState(0)
  const dragRef = useRef(null)

  // Any press that moves more than a few pixels is a scrub, not a tap. When it
  // ends, the browser still fires a `click` — swallow that once so browsing the
  // row with a drag never re-targets a card.
  useEffect(() => {
    const move = (e) => {
      const s = dragRef.current
      if (s && s.active && !s.moved && Math.hypot(e.clientX - s.ax, e.clientY - s.ay) > 4) {
        s.moved = true
      }
    }
    const release = () => {
      if (dragRef.current) dragRef.current.active = false
    }
    const onDocClick = (e) => {
      const s = dragRef.current
      if (s?.moved) {
        e.preventDefault()
        e.stopPropagation()
        s.moved = false
      }
    }
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', release)
    document.addEventListener('click', onDocClick, true)
    return () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', release)
      document.removeEventListener('click', onDocClick, true)
    }
  }, [])

  useLayoutEffect(() => {
    const outer = outerRef.current
    const row = rowRef.current
    if (!outer || !row) return
    const measure = () => setRange(Math.max(0, row.scrollWidth - outer.clientWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(outer)
    ro.observe(row)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [targetId])

  return (
    <div ref={outerRef} className={`w-full overflow-hidden -mt-2 pt-2 pb-1 px-2 md:max-w-xl ${className}`}>
      <motion.div
        ref={rowRef}
        variants={grid}
        initial="hidden"
        animate="visible"
        drag={range > 0 ? 'x' : false}
        dragConstraints={{ left: -range, right: 0 }}
        dragElastic={0}
        dragTransition={{ power: 0.12, timeConstant: 220 }}
        onPointerDown={(e) => {
          dragRef.current = { active: true, moved: false, ax: e.clientX, ay: e.clientY }
        }}
        className={`flex w-full select-none items-stretch gap-2 touch-none ${
          range === 0 ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        {ACCESSORIES.map((a) => {
          const qty = getQuantity(quantities, a.id)
          const isTarget = a.id === targetId
          return (
            <motion.button
              key={a.id}
              type="button"
              variants={card}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 520, damping: 24 }}
              onClick={() => focus(a.id)}
              aria-label={a.name}
              aria-current={isTarget ? 'true' : undefined}
              className={`relative flex shrink-0 cursor-pointer flex-col items-start rounded-xl border p-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:rounded-2xl sm:p-3 ${
                isTarget
                  ? 'border-accent'
                  : 'border-hairline bg-panel/70 hover:border-white/20 hover:bg-white/[0.03]'
              }`}
            >
              {qty > 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-bold leading-none text-white/90 backdrop-blur-sm">
                  ×{qty}
                </span>
              )}

              <span className="flex h-9 w-10 items-center justify-center overflow-hidden rounded-md bg-panel-soft sm:h-12 sm:w-14 sm:rounded-lg">
                <img src={a.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
              </span>
              <span className="mt-auto flex-col gap-0.5">
                <span className="hidden text-xs font-medium leading-tight text-ink sm:block sm:text-sm">{a.name}</span>
                <span className="mt-0.5 block text-[11px] tabular-nums text-ink-muted sm:text-xs">{money(a.price)}</span>
              </span>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}