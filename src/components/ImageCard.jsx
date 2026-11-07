import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { useReducedMotion } from 'motion/react'

/** Frame lip as a fraction of the photo width (bezel → gold ring → back plate). */
const BEZEL_FRAC = 0.0125
const GOLD_FRAC = 0.005
const BACK_FRAC = 0.005

/** Rounded-rect shape centered on the origin. */
function roundedRectShape(w, h, r) {
  const hw = w / 2
  const hh = h / 2
  const radius = Math.max(0, Math.min(r, hw, hh))
  const s = new THREE.Shape()
  s.moveTo(-hw + radius, -hh)
  s.lineTo(hw - radius, -hh)
  s.quadraticCurveTo(hw, -hh, hw, -hh + radius)
  s.lineTo(hw, hh - radius)
  s.quadraticCurveTo(hw, hh, hw - radius, hh)
  s.lineTo(-hw + radius, hh)
  s.quadraticCurveTo(-hw, hh, -hw, hh - radius)
  s.lineTo(-hw, -hh + radius)
  s.quadraticCurveTo(-hw, -hh, -hw + radius, -hh)
  return s
}

/** Rounded-rect geometry with UVs normalized to [0,1] over the bounding box
    (ShapeGeometry ships raw x/y coordinates as UVs, not 0-1). */
function roundedRectGeometry(w, h, r) {
  const geometry = new THREE.ShapeGeometry(roundedRectShape(w, h, r), 20)
  const position = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, (position.getX(i) + w / 2) / w, (position.getY(i) + h / 2) / h)
  }
  geometry.computeVertexNormals()
  return geometry
}

/**
 * A photo presented as a floating card inside the 3D stage. Layer-stacked for
 * depth: dark back plate → thin gold ring → dark bezel → photo. Full bleed (no
 * padding): the bezel lip reads as a thin frame edge, not a cushion. Mirrors
 * the GLB reveal with a soft three-dimensional pop-in. Use when a product
 * defines `imageUrl` instead of `modelUrl`.
 */
export default function ImageCard({ url, width: widthProp, cornerRadius = 0.08, onReady }) {
  // A fixed world width (1.8 default, 3.4 for standalone accessory previews) is
  // wider than the stage on narrow portrait viewports, so clamp it to 72% of
  // the visible width — the card keeps breathing room on mobile but is
  // unchanged on desktop.
  const viewport = useThree((s) => s.viewport)
  const width = Math.max(0.8, Math.min(widthProp ?? 1.8, viewport.width * 0.72))
  const texture = useTexture(url, (t) => {
    t.colorSpace = THREE.SRGBColorSpace
  })
  const reduce = useReducedMotion()
  const groupRef = useRef(null)
  const intro = useRef({ progress: reduce ? 1 : 0 })
  const image = texture.image
  const aspect = image?.width && image?.height ? image.width / image.height : 1

  // The key remounts ImageCard per camera, so this runs once per card load.
  // onReady/setModelReady are idempotent in the caller.
  useLayoutEffect(() => {
    onReady?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Soft pop-in (scale 0.95 → 1) — mirrors the GLB card reveal, respects reduced motion.
  useFrame((_, delta) => {
    const g = groupRef.current
    if (!g) return
    const s = intro.current
    if (s.progress < 1) {
      s.progress = Math.min(1, s.progress + delta / 0.4)
      const eased = 1 - Math.pow(1 - s.progress, 3)
      g.scale.setScalar(0.95 + 0.05 * eased)
    } else if (g.scale.x !== 1) {
      g.scale.setScalar(1)
    }
  })

  const height = width / Math.max(aspect, 0.0001)
  const bezelOut = width * BEZEL_FRAC
  const goldOut = bezelOut + width * GOLD_FRAC
  const backOut = goldOut + width * BACK_FRAC

  const geometry = useMemo(
    () => roundedRectGeometry(width, height, cornerRadius),
    [width, height, cornerRadius],
  )
  const bezel = useMemo(
    () => roundedRectGeometry(width + bezelOut, height + bezelOut, cornerRadius * ((width + bezelOut) / width)),
    [width, height, cornerRadius, bezelOut],
  )
  const gold = useMemo(
    () => roundedRectGeometry(width + goldOut, height + goldOut, cornerRadius * ((width + goldOut) / width)),
    [width, height, cornerRadius, goldOut],
  )
  const back = useMemo(
    () => roundedRectGeometry(width + backOut, height + backOut, cornerRadius * ((width + backOut) / width)),
    [width, height, cornerRadius, backOut],
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
      bezel.dispose()
      gold.dispose()
      back.dispose()
    }
  }, [geometry, bezel, gold, back])

  return (
    <group ref={groupRef} scale={reduce ? 1 : 0.95}>
      <mesh geometry={back} position={[0, 0, -0.095]}>
        <meshStandardMaterial color="#0c0c0f" roughness={0.75} metalness={0.35} envMapIntensity={0.4} />
      </mesh>
      <mesh geometry={gold} position={[0, 0, -0.06]}>
        <meshBasicMaterial color="#e2b877" toneMapped={false} />
      </mesh>
      <mesh geometry={bezel} position={[0, 0, -0.03]}>
        <meshStandardMaterial color="#22222a" roughness={0.5} metalness={0.3} envMapIntensity={0.7} />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}