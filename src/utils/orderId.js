const pad = (n) => String(n).padStart(2, '0')

export function generateOrderId() {
  const now = new Date()
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}`
  const suffix = Math.floor(Math.random() * 90 + 10)
  return `#CC-${date}-${time}-${suffix}`
}