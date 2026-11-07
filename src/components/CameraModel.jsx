import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useReducedMotion } from 'motion/react'

const TARGET_SIZE = 3.2

/** Draco-compressed .glb camera. Fits the model so its feet rest on the stage
    floor (box.min.y -> 0), centers it, and pops in once. */
export default function CameraModel({ url, onReady }) {
  const { scene } = useGLTF(url, true)
  const groupRef = useRef(null)
  const fitRef = useRef(1)
  const reduce = useReducedMotion()
  const intro = useRef({ progress: reduce ? 1 : 0 })
  const readyRef = useRef(false)
  const viewport = useThree((s) => s.viewport)

  useLayoutEffect(() => {
    const g = groupRef.current
    if (!g || !scene) return
    const box = new THREE.Box3().setFromObject(scene)
    if (box.isEmpty()) return
    const size = box.getSize(new THREE.Vector3())
    const center = new THREE.Vector3()
    box.getCenter(center)
    const fit = TARGET_SIZE / Math.max(size.x, size.y, size.z, 0.0001)
    // Keep the model inside the stage on narrow portrait viewports.
    const maxW = viewport.width * 0.86
    const maxH = viewport.height * 0.62
    const s = Math.min(fit, maxW / Math.max(size.x, 0.0001), maxH / Math.max(size.y, 0.0001))
    fitRef.current = s
    intro.current.progress = reduce ? 1 : intro.current.progress
    g.position.set(-center.x * s, -box.min.y * s, -center.z * s)
    g.scale.setScalar(s)
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    if (!readyRef.current) {
      readyRef.current = true
      onReady?.()
    }
  }, [scene, viewport.width, viewport.height, reduce])

  useFrame((_, delta) => {
    const g = groupRef.current
    if (!g) return
    const p = intro.current
    if (p.progress < 1) {
      p.progress = Math.min(1, p.progress + delta / 0.35)
      const eased = 1 - Math.pow(1 - p.progress, 3)
      g.scale.setScalar(fitRef.current * (0.94 + 0.06 * eased))
    } else if (Math.abs(g.scale.x - fitRef.current) > 1e-4) {
      g.scale.setScalar(fitRef.current)
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}