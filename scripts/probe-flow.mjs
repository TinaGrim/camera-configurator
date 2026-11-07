#!/usr/bin/env node
// Walks the whole flow and prints the visible text on each screen, so the
// footage beats can be checked against what the recording actually shows.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

const PORT = 5199
const GPU_ARGS = ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-gpu-rasterization']
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], { stdio: ['ignore', 'pipe', 'pipe'] })
await new Promise((res) => {
  const on = (b) => { if (b.toString().includes('Local:')) res() }
  server.stdout.on('data', on); server.stderr.on('data', on)
})

const browser = await chromium.launch({ headless: true, args: GPU_ARGS })
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })

const clickText = (t) =>
  page.evaluate((s) => { const el = [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(s)); if (!el) return false; el.click(); return true }, t)
const clickAria = (l) =>
  page.evaluate((s) => { const el = document.querySelector(`button[aria-label="${s}"]`); if (!el) return false; el.click(); return true }, l)
const qty = (n = 1) =>
  page.evaluate(async (k) => { for (let i = 0; i < k; i++) { document.querySelector('button[aria-label="Increase quantity"]').click(); await new Promise((r) => setTimeout(r, 450)) } }, n)
const waitStage = async () => { await page.waitForSelector('.shimmer', { state: 'detached', timeout: 120000 }); await page.waitForTimeout(1200) }

// Visible text only: skips aria-label-only content and the <canvas>.
const visible = () =>
  page.evaluate(() => {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const out = []
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const t = n.textContent.trim()
      if (!t) continue
      const el = n.parentElement
      if (!el || el.closest('canvas, script, style')) continue
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.05) continue
      const r = el.getBoundingClientRect()
      if (r.width < 1 || r.height < 1) continue
      out.push(t)
    }
    return out
  })

const show = async (label) => {
  const t = await visible()
  console.log(`\n=== ${label} ===`)
  console.log(t.join(' | '))
}

await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' })
await page.getByText('High afford.').waitFor()
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(1800)
await show('landing')

await page.locator('button[aria-label="Begin configuring — tap anywhere"]').click()
await waitStage()
await show('choose (Aurora X7)')

await qty()
await page.waitForTimeout(1400)
await show('choose (1 in cart)')

await clickText('Continue')
await waitStage()
await page.waitForTimeout(600)
await show('customize')

await clickAria('Woven Shoulder Strap')
await page.waitForTimeout(1000)
await qty()
await page.waitForTimeout(900)
await clickAria('Leather Wrist Keychain')
await page.waitForTimeout(800)
await qty(2)
await page.waitForTimeout(1400)
await show('customize (kit filled)')

await clickText('Continue')
await page.waitForFunction(() => document.body.innerText.includes('Invoice'), { timeout: 30000 })
await page.waitForTimeout(2200)
await show('review')

await clickText('Send to shop chat')
await page.waitForFunction(() => document.body.innerText.includes('Got it'), { timeout: 20000 })
await page.waitForTimeout(800)
await show('review + handoff modal')

await clickText('Got it')
await page.waitForFunction(() => document.body.innerText.includes('Order ready'), { timeout: 30000 })
await page.waitForTimeout(2400)
await show('sent')

for (const p of page.context().pages()) if (p !== page) console.log('extra page:', p.url())
await page.close()
await browser.close()
server.kill()
process.exit(0)
