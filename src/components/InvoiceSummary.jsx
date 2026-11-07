import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { press } from '../utils/motion'
import { discountedPrice, discountAmount, accessoriesTotal, getCamera, getAccessory, getQuantity, money } from '../utils/pricing'
import { generateOrderId } from '../utils/orderId'
import { useConfiguratorStore } from '../store/useConfiguratorStore'
import { sendToTelegram } from '../utils/telegram'
import PriceRoll from './PriceRoll'
import ReminderPopup from './ReminderPopup'

const container = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.04,
      staggerDirection: 1,
    },
  },
}

const line = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: 'easeOut' } },
}

function DrawLine() {
  return (
    <motion.div
      aria-hidden="true"
      className="h-px bg-hairline"
      style={{ originX: 0 }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 22, delay: 0.15 }}
    />
  )
}

export default function InvoiceSummary() {
  const cameraId = useConfiguratorStore((s) => s.selectedCameraId)
  const accessoryIds = useConfiguratorStore((s) => s.selectedAccessoryIds)
  const quantities = useConfiguratorStore((s) => s.quantities)
  const completeOrder = useConfiguratorStore((s) => s.completeOrder)
  const setHandoffMode = useConfiguratorStore((s) => s.setHandoffMode)
  const goto = useConfiguratorStore((s) => s.goto)

  const [sending, setSending] = useState(false)
  const [pendingSend, setPendingSend] = useState(false)

  const camera = getCamera(cameraId)
  const accessories = accessoryIds
    .map((id) => getAccessory(id))
    .filter(Boolean)
    .filter((a) => getQuantity(quantities, a.id, 0) > 0)

  const base = camera ? discountedPrice(camera) : 0
  const discount = camera ? discountAmount(camera) : 0
  const quantity = camera ? getQuantity(quantities, camera.id, 0) : 1
  const addonsTotal = accessoriesTotal(accessories, quantities)
  const total = base * quantity + addonsTotal

  const orderId = useMemo(() => generateOrderId(), [])

  const doSend = async () => {
    setPendingSend(false)
    if (!camera || sending) return
    setSending(true)
    await new Promise((r) => setTimeout(r, 600))
    const { mode, orderText } = await sendToTelegram({ camera, accessories, total, quantity, orderId, quantities })
    completeOrder({ orderId, orderText, mode, total })
    setHandoffMode(mode)
    goto('handoff')
  }

  if (!camera) return null

  const rows = [
    {
      key: 'camera',
      label: 'Camera',
      value: `${camera.name} · ${camera.color}`,
      sub: camera.price,
      extra: camera.discountPercent ? `−${camera.discountPercent}%` : null,
    },
    ...accessories.map((a) => ({
      key: a.id,
      label: 'Accessory',
      value: a.name,
      sub: a.price,
      qty: getQuantity(quantities, a.id),
      extra: null,
    })),
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
      style={{ transformOrigin: 'center bottom' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 34, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.05 }}
        className="rounded-2xl border border-hairline bg-panel/80 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl"
      >
        <div className="flex items-end justify-between">
          <div>
            <motion.p
              variants={line}
              className="eyebrow text-accent"
            >
              The order
            </motion.p>
            <motion.h2
              variants={line}
              className="font-display mt-1.5 text-3xl font-medium tracking-tight text-ink"
            >
              Invoice
            </motion.h2>
          </div>
          <motion.span
            variants={line}
            className="text-xs tabular-nums text-ink-muted"
          >
            {orderId}
          </motion.span>
        </div>

        <motion.dl
          variants={container}
          initial="hidden"
          animate="visible"
          className="mt-6 space-y-4"
        >
          {rows.map((row, i) => (
            <motion.div
              key={row.key}
              variants={line}
              layout
              whileHover={{ x: 3 }}
              transition={press}
              className="flex items-baseline justify-between gap-4 rounded-lg -mx-2 px-2 py-0.5"
            >
              <div>
                <dt className="text-sm text-ink-muted">{row.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink">{row.value}</dd>
              </div>
              <div className="flex items-baseline gap-2 text-right">
                {row.extra && <span className="text-xs font-medium tabular-nums text-accent">{row.extra}</span>}
                {row.qty > 1 && (
                  <span className="text-xs tabular-nums text-ink-muted">× {row.qty}</span>
                )}
                <PriceRoll value={row.sub} className="text-sm tabular-nums text-ink" />
              </div>
            </motion.div>
          ))}

          <motion.div
            variants={line}
            layout
            className="flex items-baseline justify-between gap-4"
          >
            <dt className="text-sm text-ink-muted">Subtotal</dt>
            <dd className="text-sm tabular-nums text-ink">
              <PriceRoll value={camera.price * quantity + addonsTotal} />
            </dd>
          </motion.div>

          {discount > 0 && (
            <motion.div
              variants={line}
              layout
              className="flex items-baseline justify-between gap-4"
            >
              <dt className="text-sm text-ink-muted">Discount</dt>
              <dd className="text-sm font-medium tabular-nums text-accent">−{money(discount * quantity)}</dd>
            </motion.div>
          )}

          <DrawLine />

          <motion.div
            variants={line}
            layout
            className="flex items-baseline justify-between"
          >
            <span className="text-sm font-medium text-ink">Total</span>
            <motion.span
              initial={false}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 0.6, ease: 'easeOut', times: [0, 0.55, 1] }}
              className="inline-flex"
              style={{ transformOrigin: 'right center' }}
            >
              <PriceRoll value={total} className="gold-text font-display text-3xl font-semibold tabular-nums" />
            </motion.span>
          </motion.div>
        </motion.dl>

        <motion.div variants={line} className="relative mt-8">
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full"
            animate={
              sending
                ? undefined
                : { boxShadow: ['0 0 0 0 rgba(226,184,119,0.35)', '0 0 0 16px rgba(226,184,119,0)'] }
            }
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.button
            type="button"
            data-cta-primary
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={press}
            onClick={() => setPendingSend(true)}
            disabled={sending}
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#f0d9a8] via-accent to-accent-deep px-6 py-3.5 text-sm font-semibold text-bg transition-shadow duration-300 hover:shadow-[0_16px_40px_-14px_rgba(226,184,119,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-80"
          >
            {sending ? (
              <>
                <motion.span
                  aria-hidden="true"
                  className="inline-block h-4 w-4 rounded-full border-2 border-bg/35 border-t-bg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                Opening Telegram…
              </>
            ) : (
              'Send to shop chat'
            )}
          </motion.button>
        </motion.div>
      </motion.div>

      <ReminderPopup open={pendingSend} onDone={doSend} onCancel={() => setPendingSend(false)} />
    </motion.div>
  )
}