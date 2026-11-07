#!/usr/bin/env node
// Generates PNG thumbnails for every camera and accessory by rendering the
// actual 3D scene headlessly (via ?thumb=<id>) and downscaling the captured
// framebuffer. Requires a built app: run `npm run build` first.

import { spawn } from 'node:child_process'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'
import { chromium } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'thumbs')
const PORT = 5199
const BASE = `http://localhost:${PORT}`
const SIZE = 256

const ids = [
  'aurora-x7',
  'vela-pro',
  'drift-mini',
  'leather-keychain',
  'lens-cap',
  'shoulder-strap',
  'leather-backpack',
]

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

async function downscale(page, dataUrl) {
  return page.evaluate(
    async ([url, size]) => {
      const img = new Image()
      img.src = url
      await img.decode()
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      const side = Math.min(img.width, img.height)
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
      return canvas.toDataURL('image/png')
    },
    [dataUrl, SIZE],
  )
}

mkdirSync(outDir, { recursive: true })

/** Rough alpha-content check so a silently-blank capture fails loudly. */
function hasContent(file) {
  try {
    const b = readFileSync(file)
    let off = 8
    const chunks = []
    while (off < b.length) {
      const len = b.readUInt32BE(off)
      chunks.push({ type: b.toString('ascii', off + 4, off + 8), data: b.slice(off + 8, off + 8 + len) })
      off += 12 + len
    }
    const ihdr = chunks.find((c) => c.type === 'IHDR')
    if (!ihdr) return false
    const w = ihdr.data.readUInt32BE(0)
    const h = ihdr.data.readUInt32BE(4)
    const raw = inflateSync(Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data)))
    const stride = w * 4
    let src = 0
    for (let y = 0; y < h; y++) {
      const filter = raw[src++]
      const row = raw.slice(src, src + stride)
      src += stride
      void filter
      for (let i = 0; i < stride; i += 4) {
        if (row[i + 3] > 10) return true
      }
    }
    return false
  } catch {
    return false
  }
}

const server = await startServer()
console.log('preview server up — rendering thumbnails…')

// Prefer the native GPU/ANGLE renderer (swiftshader software WebGL draws some
// models blank), and fall back to swiftshader for environments without a GPU.
let browser
try {
  browser = await chromium.launch()
} catch {
  console.warn('native chromium unavailable — falling back to swiftshader')
  browser = await chromium.launch({ args: ['--use-angle=swiftshader'] })
}
const page = await browser.newPage({ viewport: { width: 640, height: 640 } })

try {
  for (const id of ids) {
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.warn(`[${id}] page error: ${msg.text()}`)
    })
    await page.goto(`${BASE}/?thumb=${id}`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(
      () => window.__thumb && window.__thumb.url && window.__thumb.id,
      { timeout: 30000 },
    )
    const captured = await page.evaluate(() => window.__thumb)
    if (captured.id !== id) throw new Error(`thumb id mismatch: ${captured.id}`)
    const small = await downscale(page, captured.url)
    const file = join(outDir, `${id}.png`)
    writeFileSync(file, Buffer.from(small.split(',')[1], 'base64'))
    if (!hasContent(file)) console.warn(`  ⚠ ${id}.png rendered blank — check the model render`)
    console.log(`  wrote ${file}`)
  }
} finally {
  await browser.close()
  await server.kill()
}

console.log('Done.')