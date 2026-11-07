import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import SceneViewer from './components/SceneViewer'
import { CardHalo } from './components/StageCardFx'
import ProgressSteps from './components/ProgressSteps'
import StepShell from './components/StepShell'
import ProductInfo from './components/ProductInfo'
import ProductBar from './components/ProductBar'
import BottomCTA from './components/BottomCTA'
import InvoiceSummary from './components/InvoiceSummary'
import TelegramHandoff from './components/TelegramHandoff'
import { useConfiguratorStore } from './store/useConfiguratorStore'
import { CAMERAS, getAccessory, getCamera, getQuantity } from './utils/pricing'

function thumbFromParam() {
  const raw = new URLSearchParams(window.location.search).get('thumb')
  if (!raw) return null
  const camera = getCamera(raw)
  if (camera) return { type: 'camera', camera }
  const accessory = getAccessory(raw)
  if (accessory) return { type: 'accessory', accessory }
  return null
}

const heroContainer = {
  hidden: {},
  visible: { transition: { delayChildren: 0.15, staggerChildren: 0.11 } },
}

const heroItem = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

function Landing() {
  const goto = useConfiguratorStore((s) => s.goto)

  const start = () => goto('choose')

  return (
    <motion.button
      type="button"
      aria-label="Begin configuring — tap anywhere"
      onClick={start}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center px-6 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      style={{ touchAction: 'manipulation' }}
    >
      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center"
      >
        <motion.p variants={heroItem} className="eyebrow text-accent">
          MIRAGE · Camera Atelier
        </motion.p>

        <motion.h1
          variants={heroItem}
          className="font-display mt-4 text-5xl font-medium leading-[1.02] tracking-tight text-ink sm:text-7xl"
        >
          High afford.
          <br />
          <span className="gold-text italic">Pretty price, pretty quality.</span>
        </motion.h1>

        <motion.p
          variants={heroItem}
          className="mt-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-muted"
        >
          <span className="gold-hairline inline-block h-px w-8" aria-hidden="true" />
          From $280
          <span className="gold-hairline inline-block h-px w-8" aria-hidden="true" />
        </motion.p>
      </motion.div>

      <motion.p
        variants={heroItem}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.55, duration: 0.4 }}
        className="absolute bottom-12 text-[11px] uppercase tracking-[0.24em] text-ink-faint"
      >
        Tap anywhere to begin
      </motion.p>
    </motion.button>
  )
}

export default function App() {
  const step = useConfiguratorStore((s) => s.step)
  const direction = useConfiguratorStore((s) => s.direction)
  const cameraId = useConfiguratorStore((s) => s.selectedCameraId)
  const accessoryIds = useConfiguratorStore((s) => s.selectedAccessoryIds)
  const quantities = useConfiguratorStore((s) => s.quantities)
  const browse = {
    back: useConfiguratorStore((s) => s.back),
    next: useConfiguratorStore((s) => s.next),
    goto: useConfiguratorStore((s) => s.goto),
    cycleCamera: useConfiguratorStore((s) => s.cycleCamera),
  }

  const camera = getCamera(cameraId) ?? CAMERAS[0]
  const accessoryMap = accessoryIds.map((id) => getAccessory(id)).filter(Boolean)
  const accessories = accessoryMap.filter((a) => getQuantity(quantities, a.id, 0) > 0)
  // On the kit step, preview the focused card immediately (even at qty 0); on
  // review/handoff only show accessories that were actually added to the order.
  const showcasedAccessories = step === 'customize' ? accessoryMap : accessories
  const thumb = thumbFromParam()
  const [modelLoaded, setModelLoaded] = useState(false)
  const imageMode = !camera.modelUrl && Boolean(camera.imageUrl)

  useEffect(() => {
    setModelLoaded(false)
  }, [cameraId])

  // Keyboard navigation per step.
  useEffect(() => {
    if (thumb) return
    const handler = (e) => {
      const k = e.key
      if (k === 'Escape') {
        browse.back()
        return
      }
      switch (step) {
        case 'landing':
          if (k === 'Enter' || k === ' ') {
            e.preventDefault()
            document.querySelector('button[aria-label="Begin configuring — tap anywhere"]')?.click()
          }
          break
        case 'choose':
          if (k === 'ArrowLeft') {
            e.preventDefault()
            browse.back()
          } else if (k === 'ArrowRight') {
            e.preventDefault()
            browse.next()
          } else if (k === 'Enter') {
            e.preventDefault()
            browse.next()
          }
          break
        case 'customize':
          if (k === 'ArrowLeft') {
            e.preventDefault()
            browse.back()
          } else if (k === 'ArrowRight' || k === 'Enter') {
            e.preventDefault()
            browse.next()
          }
          break
        case 'review':
          if (k === 'Enter') {
            e.preventDefault()
            document.querySelector('[data-cta-primary]')?.click()
          } else if (k === 'ArrowLeft') {
            e.preventDefault()
            browse.back()
          } else if (k === 'ArrowRight') {
            e.preventDefault()
            browse.next()
          }
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, thumb])

  const dimCanvas = step === 'review' || step === 'handoff' || thumb != null
  const onCaptured = thumb
    ? (url) => {
        window.__thumb = { id: thumb.type === 'camera' ? thumb.camera.id : thumb.accessory.id, url }
      }
    : undefined

  if (thumb) {
    return (
      <div className="h-dvh w-full bg-bg">
        <SceneViewer
          step="choose"
          camera={thumb.type === 'camera' ? thumb.camera : camera}
          accessories={[]}
          offsetY={thumb.type === 'camera' ? (thumb.camera.viewOffsetY ?? -0.28) : -0.28}
          viewScale={thumb.type === 'camera' ? (thumb.camera.viewScale ?? 1) : 1}
          thumb={thumb}
          onCaptured={onCaptured}
        />
      </div>
    )
  }

  const kitCount = accessories.length

  return (
    <MotionConfig reducedMotion="user">
      <div className="stage-vignette relative h-dvh w-full overflow-hidden bg-bg text-ink">
        <ProgressSteps />

        <motion.div
          className="absolute inset-0"
          animate={{ opacity: dimCanvas ? 0.16 : 1, scale: dimCanvas ? 0.985 : 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <SceneViewer
            step={step}
            camera={camera}
            accessories={showcasedAccessories}
            offsetY={camera.viewOffsetY ?? -0.28}
            viewScale={camera.viewScale ?? 1}
            onLoaded={() => setModelLoaded(true)}
          />
        </motion.div>

        {imageMode && !dimCanvas && <CardHalo />}

        {step === 'landing' && <div className="absolute inset-0 z-[5] bg-bg" aria-hidden="true" />}

        {!modelLoaded && <div className="shimmer pointer-events-none absolute inset-0" aria-hidden="true" />}

        <AnimatePresence mode="popLayout" custom={direction}>
          {step === 'landing' && (
            <StepShell key="landing" step="landing" direction={direction} className="absolute inset-0 z-10">
              <Landing />
            </StepShell>
          )}

          {step === 'choose' && (
            <StepShell key="choose" step="choose" direction={direction} className="absolute inset-0 z-30">
              <ProductInfo />
              <ProductBar onContinue={browse.next} />
            </StepShell>
          )}

          {step === 'customize' && (
            <StepShell key="customize" step="customize" direction={direction} className="absolute inset-0 z-30">
              <ProductInfo />
              <ProductBar onContinue={browse.next} />
            </StepShell>
          )}

          {step === 'review' && (
            <StepShell key="review" step="review" direction={direction} className="absolute inset-0 z-10 flex items-center justify-center px-5 py-10">
              <div className="pointer-events-auto">
                <InvoiceSummary />
              </div>
            </StepShell>
          )}

          {step === 'handoff' && (
            <StepShell key="handoff" step="handoff" direction={direction} className="absolute inset-0 z-10 flex items-center justify-center px-5 py-10">
              <div className="pointer-events-auto">
                <TelegramHandoff />
              </div>
            </StepShell>
          )}
        </AnimatePresence>

        <div className="grain" aria-hidden="true" />
      </div>
    </MotionConfig>
  )
}