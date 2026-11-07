import { motion } from 'motion/react'
import { press } from '../utils/motion'
import { CAMERAS, getQuantity, money } from '../utils/pricing'
import { useConfiguratorStore } from '../store/useConfiguratorStore'

export default function ModelSwitcher() {
  const selectedId = useConfiguratorStore((s) => s.selectedCameraId)
  const quantities = useConfiguratorStore((s) => s.quantities)
  const select = useConfiguratorStore((s) => s.selectCamera)

  return (
    <div className="flex items-center gap-2.5" role="tablist" aria-label="Camera models">
      {CAMERAS.map((camera, i) => {
        const active = camera.id === selectedId
        const qty = getQuantity(quantities, camera.id, 0)
        return (
          <motion.button
            key={camera.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${camera.name} ${camera.color}`}
            onClick={() => select(camera.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={press}
            className={`group relative h-20 w-24 cursor-pointer overflow-hidden rounded-2xl border transition-colors duration-200 sm:h-28 sm:w-32 ${
              active
                ? 'border-accent/60'
                : 'border-hairline hover:border-white/25'
            }`}
          >
            <img
              src={camera.thumbnail}
              alt=""
              className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
              loading="lazy"
            />
            <span className="absolute left-2 top-2 flex flex-col items-start gap-1">
              {camera.discountPercent > 0 && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold leading-none text-bg">
                  −{camera.discountPercent}%
                </span>
              )}
              {qty > 0 && (
                <span className="rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-bold leading-none text-white/90 backdrop-blur-sm">
                  ×{qty}
                </span>
              )}
            </span>
            <span className="absolute right-2 top-2 text-xs font-semibold tabular-nums text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              0{i + 1}
            </span>
            <span className="absolute inset-x-2 bottom-2 flex items-end justify-end gap-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
              <span className="shrink-0 text-[10px] font-bold tabular-nums text-white/80">
                {money(camera.price)}
              </span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}