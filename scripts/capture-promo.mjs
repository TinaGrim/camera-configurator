#!/usr/bin/env node
// Records the promo footage for the Mirage promo video.
//
// Drives the real app in Chromium and records one clip per promo beat. Each
// clip is driven to its state, a red slate is flashed to mark the exact frame
// where the usable footage begins, then the recorder holds so Remotion has
// clean frames to trim into.
//
// Requires a built app: `npm run build` first.
//
//   node scripts/capture-promo.mjs [beat ...]

import { spawn, execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, renameSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const promo = join(root, 'mirage-promo')
const outDir = join(promo, 'public', 'footage')
const typesFile = join(promo, 'src', 'footage.ts')

// Headless Chromium falls back to SwiftShader and the WebGL stage crawls at
// ~2fps. These flags put it back on the real GPU without needing a window.
// Do not add --disable-frame-rate-limit or --enable-zero-copy here: at 200+fps
// the screencast drops short-lived DOM overlays and the slate never lands.
const GPU_ARGS = [
  '--use-angle=metal',
  '--enable-gpu',
  '--ignore-gpu-blocklist',
  '--enable-gpu-rasterization',
]

const PORT = 5199
const BASE = `http://localhost:${PORT}`
// The recorder will not scale a viewport up into a larger video frame, so the
// viewport has to be the output size for a pixel-exact 1080x1920 capture.
const VIDEO = { width: 1080, height: 1920 }

function startServer() {
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('preview server did not start in time')), 30000)
    const onData = (buf) => {
      if (buf.toString().includes('Local:')) {
        clearTimeout(timer)
        resolve(server)
      }
    }
    server.stdout.on('data', onData)
    server.stderr.on('data', onData)
    server.on('exit', () => reject(new Error('preview server exited early')))
  })
}

const wait = (page, ms) => page.waitForTimeout(ms)

// The app leaves the outgoing step's shell mounted while it animates out, and
// two shells then overlap — Playwright's hit-testing refuses the real click, so
// every interaction goes through the DOM directly.
const clickButton = (page, text) =>
  page.evaluate((t) => {
    const el = [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))
    if (!el) return false
    el.click()
    return true
  }, text)

const clickAria = (page, label) =>
  page.evaluate((l) => {
    const el = document.querySelector(`button[aria-label="${l}"]`)
    if (!el) return false
    el.click()
    return true
  }, label)

const qty = (page, times = 1) =>
  page.evaluate(async (n) => {
    for (let i = 0; i < n; i++) {
      document.querySelector('button[aria-label="Increase quantity"]').click()
      await new Promise((r) => setTimeout(r, 450))
    }
  }, times)

const hasText = (page, text) =>
  page.evaluate((t) => document.body.innerText.includes(t), text)

/** The gold shimmer overlay is the app's "3D model still loading" signal. */
async function waitForStage(page) {
  await page.waitForSelector('.shimmer', { state: 'detached', timeout: 120000 })
  await wait(page, 1000)
}

async function waitForHero(page) {
  await page.getByText('High afford.').waitFor({ timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  await wait(page, 1800)
}

async function landing(page) {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await waitForHero(page)
}

async function begin(page) {
  await page.locator('button[aria-label="Begin configuring — tap anywhere"]').click()
  await waitForStage(page)
}

/** landing -> choose, Aurora X7 loaded and swaying. */
async function toChoose(page) {
  await landing(page)
  await begin(page)
}

/** choose -> customize, with a camera in the cart. */
async function toKit(page) {
  await toChoose(page)
  await qty(page)
  await wait(page, 1400)
  await clickButton(page, 'Continue')
  await waitForStage(page)
  await wait(page, 600)
}

/** choose -> review, camera + strap + two keychains. */
async function toReview(page) {
  await toKit(page)
  await clickAria(page, 'Woven Shoulder Strap')
  await wait(page, 1000)
  await qty(page)
  await wait(page, 900)
  await clickAria(page, 'Leather Wrist Keychain')
  await wait(page, 800)
  await qty(page, 2)
  await wait(page, 1400)
  await clickButton(page, 'Continue')
  await page.waitForFunction(() => document.body.innerText.includes('Invoice'), { timeout: 30000 })
  await wait(page, 2200)
}

/** A slow drag across the canvas so the turntable swings round and springs back. */
async function spin(page) {
  const y = 840
  await page.mouse.move(790, y)
  await page.mouse.down()
  const steps = 26
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(790 - (470 * i) / steps, y + Math.sin(i / 3) * 8)
    await wait(page, 24)
  }
  await page.mouse.up()
  await wait(page, 900)
}

const BEATS = {
  // The black opening card. The app's own copy carries the beat.
  hero: {
    hold: 7,
    async run(page, mark) {
      await landing(page)
      await mark()
    },
  },

  // Tap anywhere -> studio HDRI lights up and the Aurora X7 fades in.
  reveal: {
    hold: 8,
    async run(page, mark) {
      await landing(page)
      await mark()
      await begin(page)
      await wait(page, 2200)
    },
  },

  // Spin the body, cycle the three real models, drop one into the cart.
  browse: {
    hold: 7,
    async run(page, mark) {
      await toChoose(page)
      await mark()
      await spin(page)
      await clickAria(page, 'Vela Pro Gunmetal')
      await wait(page, 1500)
      await clickAria(page, 'Drift Mini Charcoal')
      await wait(page, 1500)
      await clickAria(page, 'Aurora X7 Matte Black')
      await wait(page, 1500)
      await qty(page)
      await wait(page, 1500)
    },
  },

  // Focus each extra — the stage re-centres on the accessory — and add it.
  kit: {
    hold: 7,
    async run(page, mark) {
      await toKit(page)
      await mark()
      await clickAria(page, 'Woven Shoulder Strap')
      await wait(page, 1500)
      await qty(page)
      await wait(page, 1300)
      await clickAria(page, 'Leather Wrist Keychain')
      await wait(page, 1300)
      await qty(page, 2)
      await wait(page, 1600)
    },
  },

  // The invoice builds itself line by line.
  review: {
    hold: 7,
    async run(page, mark) {
      await toReview(page)
      await mark()
    },
  },

  // Send to shop chat -> dismiss the check modal -> Order ready.
  sent: {
    hold: 6,
    async run(page, mark) {
      await toReview(page)
      await clickButton(page, 'Send to shop chat')
      await page.waitForFunction(() => document.body.innerText.includes('Got it'), { timeout: 20000 })
      await wait(page, 500)
      await mark()
      await clickButton(page, 'Got it')
      await page.waitForFunction(() => document.body.innerText.includes('Order ready'), { timeout: 30000 })
      await wait(page, 2400)
      // The handoff opens the Telegram tab; keep it out of the recording.
      for (const p of page.context().pages()) if (p !== page) await p.close().catch(() => {})
      await page.bringToFront()
    },
  },
}

/**
 * Locates the red slate in the encoded clip. The recorder's timeline does not
 * line up with wall-clock time, so the slate is the only reliable sync point.
 */
function findSlate(file) {
  const raw = execFileSync(
    'ffmpeg',
    ['-v', 'error', '-i', file, '-vf', 'fps=24,scale=90:160,format=rgb24', '-f', 'rawvideo', '-'],
    { maxBuffer: 1 << 28 },
  )
  const W = 90
  const H = 160
  const n = W * H
  const frames = Math.floor(raw.length / (n * 3))
  let best = null
  let peak = 0
  for (let i = 0; i < frames; i++) {
    let red = 0
    const base = i * n * 3
    for (let p = 0; p < n; p++) {
      const r = raw[base + p * 3]
      const g = raw[base + p * 3 + 1]
      const b = raw[base + p * 3 + 2]
      if (r - Math.max(g, b) > 60) red++
    }
    const frac = red / n
    if (frac > peak) peak = frac
    if (frac > 0.9 && (best === null || frac > best.frac)) best = { frame: i, frac }
  }
  if (!best) throw new Error(`slate not found (peak red frame was only ${(peak * 100).toFixed(0)}%)`)
  return best.frame / 24
}

async function capture(browser, name, beat) {
  const tmp = join(outDir, `.tmp-${name}`)
  rmSync(tmp, { recursive: true, force: true })
  mkdirSync(tmp, { recursive: true })

  const context = await browser.newContext({
    viewport: VIDEO,
    deviceScaleFactor: 1,
    recordVideo: { dir: tmp, size: VIDEO },
  })
  const page = await context.newPage()
  page.on('pageerror', (e) => console.warn(`  [${name}] page error: ${e.message}`))

  // Flash a full-bleed red slate so the usable footage can be located exactly.
  const mark = async () => {
    await page.evaluate(() => {
      const el = document.createElement('div')
      el.id = '__slate'
      el.style.cssText = 'position:fixed;inset:0;background:rgb(255,0,0);z-index:2147483647'
      document.body.appendChild(el)
    })
    await wait(page, 600)
    await page.evaluate(() => document.getElementById('__slate')?.remove())
    await wait(page, 500)
  }

  await beat.run(page, mark)
  await wait(page, beat.hold * 1000)

  const video = page.video()
  await context.close()
  const dest = join(outDir, `${name}.webm`)
  renameSync(join(tmp, basename(await video.path())), dest)
  rmSync(tmp, { recursive: true, force: true })

const slate = findSlate(dest)
  // The recorder writes 25fps regardless of playback; Remotion indexes in-points
  // in source frames, so the real rate has to travel with the clip.
  const probe = execFileSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=avg_frame_rate', '-of', 'csv=p=0', dest],
  ).toString().trim();
  const [num, den] = probe.split('/').map(Number);
  const frameRate = Math.round((num / den) * 100) / 100;
  const dur = Number(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', dest]).toString().trim(),
  );
  // Skip the slate itself plus a beat of settle after it.
  const from = +(slate + 0.75).toFixed(3);
  console.log(`  ${name}: slate at ${slate.toFixed(2)}s -> usable from ${from.toFixed(2)}s of ${dur.toFixed(2)}s @ ${frameRate}fps`);
  return { from, duration: +(dur - from).toFixed(3), frameRate };
}

const wanted = process.argv.slice(2).filter((a) => a !== "--sync");
const names = wanted.length ? wanted : Object.keys(BEATS);
// Capturing a subset of beats merges into the clips recorded so far.
const clipsPath = join(outDir, 'clips.json')

/** Re-probes already-recorded clips and regenerates footage.ts. No recording. */
function writeTypes(clips) {
  const rows = Object.entries(clips)
    .map(([name, c]) => `  ${name}: { src: '${c.src}', from: ${c.from}, duration: ${c.duration}, frameRate: ${c.frameRate} },`)
    .join('\n')
  writeFileSync(
    typesFile,
    `// Generated by scripts/capture-promo.mjs — do not edit by hand.\n` +
      `// Seconds are measured against each clip's own timeline; frameRate is the\n` +
      `// recorded rate, which is what Remotion's startFrom/endAt are indexed in.\n\n` +
      `export type Footage = { src: string; from: number; duration: number; frameRate: number }\n\n` +
      `export const footage: Record<string, Footage> = {\n${rows}\n}\n`,
  )
  console.log(`\nwrote ${typesFile}`)
}

const CONFORM_FPS = 30

/**
 * Re-encodes recorded clips to the composition's frame rate.
 *
 * Playwright records at 25fps while the composition runs at 30, and Remotion's
 * startFrom is a source frame index — so in-points would be read at the wrong
 * rate. Conforming to CFR makes one composition frame exactly one source frame
 * and the timing unambiguous. Times are unchanged by an fps-only resample, so
 * the slate offsets recorded above stay valid.
 */
function conformClip(file) {
  const tmp = `${file}.conform.webm`
  execFileSync('ffmpeg', [
    '-v', 'error', '-y', '-i', file,
    '-vf', `fps=${CONFORM_FPS}`,
    // libvpx (VP8) ignores -crf entirely, so an explicit bitrate is the only
    // quality control. Below ~3Mbps the second encode visibly softens the app's
    // text edges; 4Mbps keeps it above 42dB against a lossless reference.
    '-c:v', 'libvpx', '-b:v', '4M',
    '-deadline', 'good', '-cpu-used', '4', '-row-mt', '1', '-an',
    tmp,
  ])
  renameSync(tmp, file)
}

if (process.argv.includes('--conform')) {
  const clips = JSON.parse(readFileSync(clipsPath, 'utf8'))
  for (const [name, c] of Object.entries(clips)) {
    const file = join(outDir, basename(c.src))
    console.log(`conforming ${name}…`)
    conformClip(file)
    c.frameRate = CONFORM_FPS
  }
  writeFileSync(clipsPath, JSON.stringify(clips, null, 2) + '\n')
  writeTypes(clips)
  process.exit(0)
}

const clips = existsSync(clipsPath) ? JSON.parse(readFileSync(clipsPath, 'utf8')) : {}

const server = await startServer()
console.log(`preview server up on ${BASE}`)
if (!wanted.length) rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true, args: GPU_ARGS })
try {
  for (const name of names) {
    const beat = BEATS[name]
    if (!beat) throw new Error(`unknown beat: ${name}`)
    console.log(`recording ${name}…`)
    clips[name] = { src: `footage/${name}.webm`, ...(await capture(browser, name, beat)) }
    writeFileSync(clipsPath, JSON.stringify(clips, null, 2) + '\n')
  }
} finally {
  await browser.close()
  server.kill()
}

writeTypes(clips)
