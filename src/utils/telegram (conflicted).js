import { telegramShareUrl, telegramProfileUrl, telegramChatOrderUrl } from '../config/telegram'
import { accessoriesTotal, discountAmount, getQuantity, money } from './pricing'

const DIVIDER = '━━━━━━━━━━━━━━'

export function buildOrderText({ camera, accessories = [], total, quantity = 1, orderId, quantities = {} }) {
  const accessoriesSum = accessoriesTotal(accessories, quantities)
  const discount = discountAmount(camera)
  const cameraLine = `📷 ${camera.name} · ${camera.color}  ${money(camera.price)}${
    camera.discountPercent > 0 ? `  (−${camera.discountPercent}%)` : ''
  }`
  const accessoryLines = accessories.map((a) => {
    const n = getQuantity(quantities, a.id)
    return n > 1 ? `🎒 ${a.name} ×${n}  ${money(a.price * n)}` : `🎒 ${a.name}  ${money(a.price)}`
  })
  const qtyLine = `Quantity  ×${quantity}`
  const subtotalLine = `Subtotal  ${money(camera.price * quantity + accessoriesSum)}`
  const discountLine = discount > 0 ? `Discount  −${money(discount * quantity)}` : null
  const totalLine = `Total  ${money(total)}`

  return [
    `MIRAGE`,
    DIVIDER,
    cameraLine,
    ...accessoryLines,
    DIVIDER,
    qtyLine,
    subtotalLine,
    ...(discountLine ? [discountLine] : []),
    totalLine,
    `Order: ${orderId}`,
    `— Please check your order and make sure it is to your needs.`,
  ].join('\n')
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      /* clipboard permission denied — fall through to legacy path */
    }
  }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

/**
 * Primary hand-off: open the shop chat (@PanMengLy) with the order text in the
 * URL (`t.me/<user>?text=...`), which Telegram uses to pre-fill the message
 * box. The clipboard write is kept as a fallback for clients that ignore
 * `?text=` — the user can still paste. The share-picker stays available as a
 * secondary option on the handoff screen.
 */
export async function sendToTelegram({ camera, accessories, total, quantity, orderId, quantities }) {
  const orderText = buildOrderText({ camera, accessories, total, quantity, orderId, quantities })
  const copied = await copyToClipboard(orderText)
  window.open(telegramChatOrderUrl(orderText), '_blank')
  return { mode: 'chat', orderText, copied, orderUrl: telegramChatOrderUrl(orderText) }
}

export { telegramProfileUrl as profileUrl, telegramShareUrl, telegramChatOrderUrl }