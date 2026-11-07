#!/usr/bin/env node
// Finds the scene-change points inside a recorded clip by looking for spikes in
// frame-to-frame difference. A camera swap repaints the whole stage, so it shows
// up as a spike; a slow turntable does not.
//
// Usage: node probe-cuts.mjs <file> [from] [to]

import { execFileSync } from "node:child_process"

const [file, fromArg, toArg] = process.argv.slice(2)
const from = fromArg ? Number(fromArg) : 0
const to = toArg ? Number(toArg) : null

const args = ["-v", "error"]
if (from) args.push("-ss", String(from));
args.push("-i", file);
if (to) args.push("-t", String(to - from));
const raw = execFileSync("ffmpeg", [...args, "-vf", "scale=32:57,format=rgb24", "-f", "rawvideo", "-"], {
  maxBuffer: 1 << 28,
});

const W = 32;
const H = 57;
const n = W * H;
const frames = Math.floor(raw.length / (n * 3));

const diffs = [];
for (let i = 1; i < frames; i++) {
  let sum = 0;
  const a = (i - 1) * n * 3;
  const b = i * n * 3;
  for (let p = 0; p < n; p++) {
    sum +=
      Math.abs(raw[a + p * 3] - raw[b + p * 3]) +
      Math.abs(raw[a + p * 3 + 1] - raw[b + p * 3 + 1]) +
      Math.abs(raw[a + p * 3 + 2] - raw[b + p * 3 + 2]);
  }
  diffs.push(sum / (n * 3));
}

const mean = diffs.reduce((s, d) => s + d, 0) / diffs.length;
const sorted = [...diffs].sort((a, b) => a - b);
const median = sorted[Math.floor(sorted.length / 2)];
const cutoff = median + (mean - median) * 2.5;

console.log(`${file}  window ${from}s..${to ?? "end"}  frames ${frames}`);
console.log(`mean diff ${mean.toFixed(2)}  median ${median.toFixed(2)}  cutoff ${cutoff.toFixed(2)}`);
console.log("\ncut candidates:");
diffs.forEach((d, i) => {
  if (d > cutoff) {
    console.log(`  t=${(from + i / 25).toFixed(2)}s (clip time)   diff ${d.toFixed(2)}`);
  }
});