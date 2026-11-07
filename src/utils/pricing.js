import rawCameras from '../data/cameras.json'
import rawAccessories from '../data/accessories.json'

export const CAMERAS = rawCameras
export const ACCESSORIES = rawAccessories

export const getCamera = (id) => CAMERAS.find((c) => c.id === id) ?? null
export const getAccessory = (id) => ACCESSORIES.find((a) => a.id === id) ?? null

export const discountPercent = (camera) => camera?.discountPercent ?? 0
export const discountAmount = (camera) =>
  camera ? Math.round(camera.price * (camera.discountPercent / 100) * 100) / 100 : 0
export const discountedPrice = (camera) =>
  camera ? camera.price - discountAmount(camera) : 0

export const accessoriesTotal = (accessories, quantities = {}) =>
  (accessories ?? []).reduce(
    (sum, a) => sum + (a?.price ?? 0) * getQuantity(quantities, a.id),
    0
  )

export const MAX_QUANTITY = 12
export const qtyMinFor = () => 0
export const getQuantity = (quantities = {}, id, min = 0) =>
  Math.min(MAX_QUANTITY, Math.max(min, Math.round(quantities?.[id] ?? min)))

export const unitPrice = (camera, accessories = []) =>
  discountedPrice(camera) + accessoriesTotal(accessories)

export const totalPrice = (camera, accessories = [], qty = 1) =>
  unitPrice(camera, accessories) * qty

export const money = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })