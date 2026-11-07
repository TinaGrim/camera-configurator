import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useConfiguratorStore } from '../store/useConfiguratorStore'
import { CAMERAS, getCamera, getAccessory, discountedPrice, discountAmount, accessoriesTotal, getQuantity, money } from '../utils/pricing'
import BottomCTA from './BottomCTA'
import PriceRoll from './PriceRoll'
import ModelSwitcher from './ModelSwitcher'
import AccessoryPicker from './AccessoryPicker'
import QuantityStepper from './QuantityStepper'
import CartIcon from './CartIcon'

export default function ProductBar({ onContinue }) {
  const step = useConfiguratorStore((s) => s.step)
  const cameraId = useConfiguratorStore((s) => s.selectedCameraId)
  const accessoryIds = useConfiguratorStore((s) => s.selectedAccessoryIds)
  const quantities = useConfiguratorStore((s) => s.quantities)

  const [flights, setFlights] = useState([])
  const [bump, setBump] = useState(0)
  const [wideCart, setWideCart] = useState(() => window.matchMedia('(min-width: 410px)').matches)
  const flightId = useRef(0)
  const stepperRef = useRef(null)
  const cartRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 410px)')
    const onChange = (e) => setWideCart(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const camera = getCamera(cameraId)
  if (!camera) return null

  const accessories = accessoryIds
    .map((id) => getAccessory(id))
    .filter(Boolean)
    .filter((a) => getQuantity(quantities, a.id, 0) > 0)
  const hasDiscount = camera.discountPercent > 0
  const isKitStep = step === 'customize'
  const kitTotal = accessoriesTotal(accessories, quantities)
  const cameraTotal = CAMERAS.reduce(
    (sum, c) => sum + discountedPrice(c) * getQuantity(quantities, c.id, 0),
    0
  )
  const displayTotal = cameraTotal
  const cartCount =
    CAMERAS.reduce((s, c) => s + getQuantity(quantities, c.id, 0), 0) +
    accessories.reduce((sum, a) => sum + getQuantity(quantities, a.id, 0), 0)

  // On the Kit step the bar stepper edits the most recently tapped accessory;
  // the camera qty is set on the choose step.
  const activeAcc = isKitStep && accessoryIds.length ? getAccessory(accessoryIds[accessoryIds.length - 1]) : null
  const stepperTarget = activeAcc ? activeAcc.id : isKitStep ? null : camera.id
  const flyThumb = (activeAcc ?? camera).thumbnail

  const onAdded = (_itemId, qty) => {
    const cart = cartRef.current
    if (!cart) return
    // The chip jumps from the item's own card (accessory card on the Kit step,
    // the camera card on the choose step), falling back to the + button.
    const card =
      document.querySelector(
        isKitStep
          ? `button[aria-label="${activeAcc?.name ?? ''}"]`
          : `button[aria-label="${camera.name} ${camera.color}"]`
      ) ?? stepperRef.current?.querySelector('[aria-label="Increase quantity"]')
    if (!card) return
    const from = card.getBoundingClientRect()
    const to = cart.getBoundingClientRect()
    const key = ++flightId.current
    setFlights((f) => [
      ...f,
      {
        key,
        from: { x: from.left + from.width / 2, y: from.top + from.height / 2 },
        to: { x: to.left + to.width / 2, y: to.top + to.height / 2 },
        thumb: flyThumb,
        qty,
      },
    ])
  }

  const land = (key) => {
    setFlights((f) => f.filter((x) => x.key !== key))
    setBump((b) => b + 1)
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4 sm:bottom-0 sm:px-8 sm:pb-6">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-end gap-x-3 gap-y-3 md:max-w-none sm:gap-x-6">
<div className="pointer-events-auto flex flex-none items-center justify-start gap-3">
  <div className="flex min-w-0 flex-col gap-1 rounded-2xl border border-hairline bg-panel/60 px-3 py-3 backdrop-blur-md min-h-[100px] justify-center sm:min-h-0 sm:justify-start sm:px-5">
<div className={`flex min-w-0 items-center gap-3${!wideCart ? ' justify-between' : ''}`}>
      <div className="w-[8ch] shrink-0 text-2xl sm:text-3xl">
        <PriceRoll
          value={displayTotal}
          className="block w-full text-right text-2xl font-semibold leading-none tabular-nums text-ink sm:text-3xl"
        />
      </div>
      {!wideCart && <CartIcon count={cartCount} bump={bump} ref={cartRef} />}
    </div>
        {(hasDiscount ? (
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm text-ink-muted line-through decoration-2 decoration-ink-faint/70">
                {money(
                CAMERAS.reduce((s, c) => s + c.price * getQuantity(quantities, c.id, 0), 0) +
                  accessoriesTotal(accessories, quantities)
              )}
              </span>
              <span className="text-xs font-medium text-accent">You save {money(CAMERAS.reduce((s, c) => s + discountAmount(c) * getQuantity(quantities, c.id, 0), 0))}</span>
            </div>
          ) : (
            <span className="text-xs text-ink-muted">Studio-grade · everyday price</span>
          ))}
        {kitTotal > 0 && (
          <span className="text-xs font-semibold tabular-nums text-accent">Kit {money(kitTotal)}</span>
        )}
        </div>
        </div>

          {wideCart && (
            <div className="pointer-events-auto order-2 flex shrink-0 items-center lg:order-1">
              <CartIcon count={cartCount} bump={bump} ref={cartRef} />
            </div>
          )}

        <div className="pointer-events-auto order-first w-full lg:order-2 lg:w-auto lg:flex-none">
          {step === 'customize' ? (
            <AccessoryPicker />
          ) : (
            <ModelSwitcher />
          )}
        </div>

        <div className="pointer-events-auto order-3 flex flex-1 flex-col items-end justify-end gap-3 sm:flex-row sm:items-center lg:order-3">
          <div ref={stepperRef}>
            {stepperTarget && (
              <QuantityStepper itemId={stepperTarget} min={0} onAdded={onAdded} />
            )}
          </div>
          <BottomCTA onClick={onContinue}>Continue</BottomCTA>
        </div>
      </div>

      <AnimatePresence>
        {flights.map((f) => (
          <motion.div
            key={f.key}
            className="pointer-events-none fixed z-[70]"
            style={{ left: 0, top: 0 }}
            initial={{ x: f.from.x - 16, y: f.from.y - 16, scale: 1, opacity: 1 }}
            animate={{
              x: f.to.x - 16,
              y: [f.from.y - 16, f.from.y - 116, f.to.y - 16],
              scale: [1, 1.3, 0.28],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 0.9,
              times: [0, 0.42, 1],
              ease: [0.22, 0.61, 0.36, 1],
            }}
            onAnimationComplete={() => land(f.key)}
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/25 bg-panel shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7)]">
              <img src={f.thumb} alt="" className="h-full w-full object-cover" />
              <span className="absolute -bottom-1 -right-1 rounded-full bg-black/70 px-1 text-[8px] font-bold leading-4 text-white/90">
                ×{f.qty}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}