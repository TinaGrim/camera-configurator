import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useReducedMotion } from 'motion/react'
import ImageCard from './ImageCard'

const TARGET_SIZE = 3.2

function useCameraLayout(camera) {
  const { scene } = useGLTF(camera.modelUrl, true)
  return useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    if (box.isEmpty()) return null
    const size = box.getSize(new THREE.Vector3())
    const center = new THREE.Vector3()
    box.getCenter(center)
    const scaleFactor = TARGET_SIZE / Math.max(size.x, size.y, size.z, 0.0001)

    const world = (p) =>
      new THREE.Vector3(
        (p.x - center.x) * scaleFactor,
        (p.y - box.min.y) * scaleFactor,
        (p.z - center.z) * scaleFactor,
      )

    const lug = world(
      new THREE.Vector3(
        box.min.x + size.x * 0.92,
        box.min.y + size.y * 0.96,
        center.z,
      ),
    )
    const front = world(
      new THREE.Vector3(center.x, center.y + size.y * 0.12, box.min.z),
    )

    return {
      lug,
      front,
      accessoryScale: (size.y * scaleFactor) / TARGET_SIZE,
    }
  }, [scene])
}

/** Draco-compressed .glb accessory (e.g. the leather backpack). Fits the
    model so its feet rest on the stage floor (box.min.y -> 0) and pops in. */
function AccessoryGlb({
  url,
  target = 2.8,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  centered = false,
  centerY = 0,
}) {
  const { scene } = useGLTF(url, true)
  const groupRef = useRef(null)
  const innerRef = useRef(null)
  const reduce = useReducedMotion()
  const intro = useRef({ progress: reduce ? 1 : 0 })
  const viewport = useThree((s) => s.viewport)

  useLayoutEffect(() => {
    const g = innerRef.current
    if (!g || !scene) return
    const box = new THREE.Box3().setFromObject(scene)
    if (box.isEmpty()) return
    const size = box.getSize(new THREE.Vector3())
    const center = new THREE.Vector3()
    box.getCenter(center)
    const fit = target / Math.max(size.x, size.y, size.z, 0.0001)
    // Keep the model inside the stage on narrow portrait viewports.
    const maxW = viewport.width * 0.86
    const maxH = viewport.height * 0.62
    const s = Math.min(fit, maxW / Math.max(size.x, 0.0001), maxH / Math.max(size.y, 0.0001))
    if (centered) {
      // Float the model mid-stage instead of resting it on the floor.
      g.position.set(
        -center.x * s,
        -center.y * s + centerY,
        -center.z * s,
      )
    } else {
      g.position.set(-center.x * s, -box.min.y * s, -center.z * s)
    }
    g.scale.setScalar(s)
  }, [scene, target, viewport.width, viewport.height, centered, centerY])

  useFrame((_, delta) => {
    const g = groupRef.current
    if (!g) return
    const s = intro.current
    if (s.progress < 1) {
      s.progress = Math.min(1, s.progress + delta / 0.35)
      const eased = 1 - Math.pow(1 - s.progress, 3)
      g.scale.setScalar(0.94 + 0.06 * eased)
    } else if (g.scale.x !== 1) {
      g.scale.setScalar(1)
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={reduce ? 1 : 0.94}>
      <group ref={innerRef}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

function Keychain({ position }) {
  const reduce = useReducedMotion()
  return (
    <group position={position}>
      <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.035, 16, 40]} />
        <meshStandardMaterial
          color="#d8d4cc"
          metalness={0.95}
          roughness={0.28}
          envMapIntensity={1.2}
        />
      </mesh>
      <mesh position={[0, -0.5, 0]} rotation={[0, 0, 0]}>
        <capsuleGeometry args={[0.11, 0.34, 6, 16]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.85} envMapIntensity={0.4} />
      </mesh>
      <mesh position={[0, -0.42, 0.06]}>
        <boxGeometry args={[0.24, 0.3, 0.03]} />
        <meshStandardMaterial color="#b98d4f" roughness={0.6} />
      </mesh>
      {!reduce && (
        <mesh position={[0, -0.34, 0]}>
          <torusGeometry args={[0.055, 0.018, 6, 20]} />
          <meshStandardMaterial color="#3a3a3e" metalness={0.9} roughness={0.3} />
        </mesh>
      )}
    </group>
  )
}

function LensCap({ position }) {
  return (
    <group position={position} rotation={[0, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.36, 0.4, 0.08, 40]} />
        <meshStandardMaterial color="#161618" roughness={0.55} envMapIntensity={0.6} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <torusGeometry args={[0.3, 0.02, 10, 40]} />
        <meshStandardMaterial color="#d8d4cc" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0.3, 0.01, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.16, 0.05, 0.06]} />
        <meshStandardMaterial color="#161618" roughness={0.6} />
      </mesh>
    </group>
  )
}

function ShoulderStrap({ from, to, fit = 1 }) {
  const curvePoints = useMemo(() => {
    const a = from.clone()
    const b = to.clone()
    const sag = new THREE.Vector3(0, -1.1 * fit, 0)
    return [
      a,
      a.clone().add(b.clone().sub(a).multiplyScalar(0.3)).add(sag),
      a.clone().add(b.clone().sub(a).multiplyScalar(0.7)).add(sag),
      b,
    ]
  }, [from, to, fit])
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(curvePoints)
    return new THREE.TubeGeometry(curve, 48, 0.06 * fit, 8, false)
  }, [curvePoints, fit])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#6b4a28" roughness={0.9} envMapIntensity={0.3} />
    </mesh>
  )
}

export default function AccessoryModel({ camera, accessory }) {
  const layout = useCameraLayout(camera)
  if (!layout) return null
  const { lug, front, accessoryScale } = layout

  if (accessory.modelUrl) {
    return (
      <AccessoryGlb
        url={accessory.modelUrl}
        target={1.7}
        position={[lug.x + 1.15, 0, lug.z * 0.4]}
        rotation={[0, 0.55, 0]}
      />
    )
  }

  if (accessory.imageUrl) {
    return (
      <group position={front}>
        <group scale={accessoryScale}>
          <ImageCard url={accessory.imageUrl} width={0.9} cornerRadius={0.06} />
        </group>
      </group>
    )
  }

  if (accessory.id === 'lens-cap') {
    return (
      <group position={front}>
        <group scale={accessoryScale}>
          <LensCap position={[0, 0, 0]} />
        </group>
      </group>
    )
  }
  if (accessory.id === 'shoulder-strap') {
    return (
      <ShoulderStrap
        from={lug}
        to={new THREE.Vector3(-lug.x, lug.y, lug.z * 0.4)}
        fit={accessoryScale}
      />
    )
  }
  return (
    <group position={lug}>
      <group scale={accessoryScale}>
        <Keychain position={[0, 0, 0]} />
      </group>
    </group>
  )
}

/** Renders a single accessory centered at the origin — used for thumbnails. */
export function StandaloneAccessory({ accessory }) {
  // The strap spans the full stage width; on portrait screens the visible width
  // shrinks below its size, so scale it down to fit ~90% of the viewport width.
  const viewport = useThree((s) => s.viewport)
  if (accessory.modelUrl)
    return <AccessoryGlb url={accessory.modelUrl} target={2.7} centered centerY={0.08} />
  if (accessory.imageUrl) return <ImageCard url={accessory.imageUrl} width={3.4} />
  if (accessory.id === 'lens-cap') return <LensCap position={[0, 0, 0]} />
  if (accessory.id === 'shoulder-strap') {
    const strapWidth = 2.2
    const fit = Math.min(1.4, Math.max(0.7, (viewport.width * 0.85) / strapWidth))
    return (
      <group scale={fit}>
        <ShoulderStrap from={new THREE.Vector3(-1.1, 0.5, 0)} to={new THREE.Vector3(1.1, 0.5, 0)} />
      </group>
    )
  }
  return (
    <group scale={1.4} position={[0, -0.2, 0]}>
      <Keychain position={[0, 0.6, 0]} />
    </group>
  )
}