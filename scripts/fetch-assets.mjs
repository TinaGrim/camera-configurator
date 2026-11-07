#!/usr/bin/env node
// Vendors CC0 camera assets into public/models/ and compresses them to Draco .glb.
//
// Sources (all CC0):
//   - Poly Haven "Camera_01"            https://polyhaven.com/a/Camera_01
//   - Poly Haven "vintage_video_camera" https://polyhaven.com/a/vintage_video_camera
//   - Khronos glTF-Sample-Assets "AntiqueCamera"
//
// Re-run with `npm run fetch:assets` after clearing public/models.

import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'models')
const tmpDir = join(root, '.tmp-assets')

const UA = 'MIRAGE-configurator/1.0'

async function jget(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(dest, buf)
  console.log(`  downloaded ${(buf.length / 1024 / 1024).toFixed(2)} MB -> ${dest}`)
}

async function fetchPolyhaven(setId, resolution) {
  const files = await jget(`https://api.polyhaven.com/files/${setId}`)
  const entry = files.gltf?.[resolution]
  if (!entry?.gltf) throw new Error(`no gltf ${resolution} for ${setId}`)
  const { url, include } = entry.gltf
  const dir = join(tmpDir, setId, resolution)
  mkdirSync(dir, { recursive: true })
  await download(url, join(dir, 'model.gltf'))
  for (const [rel, info] of Object.entries(include)) {
    const dest = join(dir, rel)
    mkdirSync(dirname(dest), { recursive: true })
    await download(info.url, dest)
  }
  return join(dir, 'model.gltf')
}

function gltfToGlb(input, output) {
  console.log(`  converting -> ${output}`)
  execFileSync(
    'npx',
    [
      'gltf-transform',
      'optimize',
      input,
      output,
      '--compress',
      'draco',
      '--texture-compress',
      'webp',
      '--texture-size',
      '1024',
      '--verbose',
    ],
    { stdio: ['ignore', 'inherit', 'inherit'], cwd: root },
  )
}

function rmIfExists(p) {
  if (existsSync(p)) rmSync(p, { recursive: true, force: true })
}

try {
  rmIfExists(tmpDir)
  mkdirSync(tmpDir, { recursive: true })
  mkdirSync(outDir, { recursive: true })

  // 1. Aurora X7 -> Poly Haven "Camera_01" (2k)
  const aurora = await fetchPolyhaven('Camera_01', '2k')
  gltfToGlb(aurora, join(outDir, 'aurora-x7.glb'))

  // 2. Vela Pro -> Poly Haven "vintage_video_camera" (2k)
  const vela = await fetchPolyhaven('vintage_video_camera', '2k')
  gltfToGlb(vela, join(outDir, 'vela-pro.glb'))

  // 3. Drift Mini -> Khronos AntiqueCamera (glb)
  const antiqueUrl =
    'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb'
  await download(antiqueUrl, join(tmpDir, 'AntiqueCamera.glb'))
  gltfToGlb(join(tmpDir, 'AntiqueCamera.glb'), join(outDir, 'drift-mini.glb'))

  console.log('\nDone. Models in public/models/')
} catch (err) {
  console.error('\nAsset step failed:', err.message)
  process.exitCode = 1
} finally {
  rmIfExists(tmpDir)
}