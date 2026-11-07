import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, PresentationControls, useEnvironment } from '@react-three/drei'
import { useReducedMotion } from 'motion/react'
import * as THREE from 'three'
import CameraModel from './CameraModel'
import AccessoryModel, { StandaloneAccessory } from './AccessoryModel'
import ImageCard from './ImageCard'

useEnvironment.preload({ files: '/environment/studio.hdr' })

function FrameCapture({ onCaptured }) {
  const gl = useThree((s) => s.gl)
  const state = useRef({ topped: false, verifying: false, attempts: 0 })

  useEffect(() => {
    if (typeof onCaptured !== 'function') return
    let cancelled = false

    const hasContent = async (url) => {
      try {
        const img = new Image()
        img.src = url
        await img.decode()
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] > 128) return true
        }
        return false
      } catch {
        return false
      }
    }

    // readPixels (toDataURL) stalls software WebGL badly, so capture rarely:
    // give the scene a quiet settle period first, then read + verify.
    const id = window.setInterval(async () => {
      if (cancelled || state.current.topped) {
        window.clearInterval(id)
        return
      }
      const s = state.current
      s.attempts += 1
      if (s.verifying) return
      // Quiet period — let the model present and the reveal fade finish before
      // touching the backbuffer.
      if (s.attempts < 3) return
      let url = ''
      try {
        url = gl.domElement.toDataURL('image/png')
      } catch {
        return
      }
      if (url.length < 5000) return
      s.verifying = true
      const ok = await hasContent(url)
      s.verifying = false
      if (cancelled) return
      // Emit as soon as the frame is stable content; give up after ~15s and
      // emit whatever we have so the caller's own check can surface a blank.
      if (ok || s.attempts >= 30) {
        s.topped = true
        window.clearInterval(id)
        onCaptured(url)
      }
    }, 500)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl])

  return null
}

/** Gentle idle swing + float so the product feels alive. Pauses while dragging. */
function Sway({ children, staticCapture = false }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const dragging = useRef(false)
  const amplitude = useRef(0)
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const el = gl.domElement
    const down = () => (dragging.current = true)
    const up = () => (dragging.current = false)
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [gl])

  useFrame((state, delta) => {
    const g = ref.current
    if (!g) return
    const target = reduce || dragging.current || staticCapture ? 0 : 1
    amplitude.current = THREE.MathUtils.damp(amplitude.current, target, 5, delta)
    const a = amplitude.current
    const t = state.clock.elapsedTime
    g.rotation.y = Math.sin(t * 0.65) * 0.06 * a
    g.rotation.z = Math.sin(t * 0.47 + 1.3) * 0.014 * a
    g.position.y = Math.sin(t * 0.9) * 0.03 * a
  })

  return <group ref={ref}>{children}</group>
}

function SceneContents({
  step,
  camera,
  accessories = [],
  offsetX = 0,
  offsetY = 0,
  viewScale = 1,
  thumb = null,
  showModel = true,
  onLoaded,
  onCaptured,
}) {
  const reduce = useReducedMotion()
  const [modelReady, setModelReady] = useState(thumb?.type === 'accessory')
  const isThumbAccessory = thumb?.type === 'accessory'
  const activeCamera = thumb?.type === 'camera' ? thumb.camera : camera
  const imageMode = !activeCamera?.modelUrl && Boolean(activeCamera?.imageUrl)

  const showKit = step === 'review' || step === 'handoff'
  const kitOnly = step === 'customize'
  const kitEmpty = kitOnly && accessories.length === 0

  const shadowOpacity = isThumbAccessory
    ? 0.3
    : showModel && !kitEmpty
      ? reduce
        ? 0.28
        : 0.38
      : 0

  return (
    <>
      <PresentationControls
        global
        cursor={showModel ? 'grab' : false}
        enabled={showModel && step !== 'handoff' && !thumb}
        snap={!reduce}
        speed={1.3}
        zoom={1.6}
        polar={[-0.12, 0.12]}
        azimuth={[-0.6, 0.6]}
      >
        <group position={kitOnly ? [0, 0, 0] : [offsetX, offsetY, 0]}>
          <group scale={kitOnly ? 1 : viewScale}>
            <Sway staticCapture={Boolean(onCaptured)}>
              {isThumbAccessory ? (
                <Suspense fallback={null}>
                  <StandaloneAccessory accessory={thumb.accessory} />
                </Suspense>
              ) : kitOnly ? (
                !kitEmpty && (
                  <Suspense fallback={null}>
                    <StandaloneAccessory
                      accessory={accessories[accessories.length - 1]}
                    />
                  </Suspense>
                )
              ) : (
                showModel &&
                activeCamera &&
                (imageMode ? (
                  <Suspense fallback={null}>
                    <ImageCard
                      key={`img-${activeCamera.id}`}
                      url={activeCamera.imageUrl}
                      onReady={() => {
                        setModelReady(true)
                        onLoaded?.()
                      }}
                    />
                  </Suspense>
                ) : (
                  <Suspense fallback={null}>
                    <CameraModel
                      key={`cam-${activeCamera.id}`}
                      url={activeCamera.modelUrl}
                      onReady={() => {
                        setModelReady(true)
                        onLoaded?.()
                      }}
                    />
                    {!thumb &&
                      showKit &&
                      accessories.map((a) => (
                        <AccessoryModel key={a.id} camera={activeCamera} accessory={a} />
                      ))}
                  </Suspense>
                ))
              )}
            </Sway>

            <ContactShadows
              position={[0, -0.02, 0]}
              opacity={shadowOpacity}
              scale={7}
              blur={2.6}
              far={3.5}
              frames={reduce ? 1 : Infinity}
              resolution={512}
              color="#000000"
            />
          </group>
        </group>
      </PresentationControls>

      <Environment files="/environment/studio.hdr" />
      <hemisphereLight args={['#ffffff', '#33414f', 2.2]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[4, 8, 5]} angle={0.35} penumbra={1} intensity={1.6} />

      {onCaptured && modelReady && <FrameCapture onCaptured={onCaptured} />}
    </>
  )
}

export default function SceneViewer(props) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.35, 6.4], fov: 32 }}
      gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
      style={{ touchAction: 'none' }}
      onCreated={({ gl }) => {
        gl.toneMapping = 3 // ACESFilmic
      }}
    >
      <Suspense fallback={null}>
        <SceneContents {...props} />
      </Suspense>
    </Canvas>
  )
}