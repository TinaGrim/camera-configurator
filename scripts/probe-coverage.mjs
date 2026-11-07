#!/usr/bin/env node
// Reports, per second, how much of a clip is the 126,126,126 unpainted
// placeholder and how much is dark. Used to catch recorder scaling failures.
import { execFileSync } from 'node:child_process'

const file = process.argv[2]
const rate = Number(process.argv[3] ?? 1)
const W = 90
const H = 160

const raw = execFileSync(
  'ffmpeg',
  ['-v', 'error', '-i', file, '-vf', `fps=${rate},scale=${W}:${H},format=rgb24`, '-f', 'rawvideo', '-'],
  { maxBuffer: 1 << 28 },
)

const n = W * H
const frames = Math.floor(raw.length / (n * 3))
console.log(`${file}: ${frames} samples @${rate}fps`)
for (let i = 0; i < frames; i++) {
  const base = i * n * 3
  let gray = 0
  let dark = 0
  let bright = 0
  let sum = 0
  for (let p = 0; p < n; p++) {
    const r = raw[base + p * 3]
    const g = raw[base + p * 3 + 1]
    const b = raw[base + p * 3 + 2]
    sum += (r + g + b) / 3
    if (r === 126 && g === 126 && b === 126) gray++
    else if (r < 45) dark++
    else bright++
  }
  const pct = (v) => ((v / n) * 100).toFixed(0).padStart(3)
  console.log(`${(i / rate).toFixed(1).padStart(6)}s mean ${(sum / n).toFixed(1).padStart(5)}  unpainted ${pct(gray)}%  dark ${pct(dark)}%  bright ${pct(bright)}%`)
}
