import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { comfortSpring } from '../utils/motion'
import { money } from '../utils/pricing'

/** Single source of truth for rolling prices — gentle roll on value change. */
export default function PriceRoll({ value, className, format = money }) {
  const raw = useMotionValue(value)
  const spring = useSpring(raw, comfortSpring)
  const text = useTransform(spring, (v) => format(v))
  const prev = useRef(value)

  useEffect(() => {
    if (prev.current !== value) {
      raw.set(prev.current)
      animate(raw, value, { duration: value > prev.current ? 0.3 : 0.6, ease: 'easeOut' })
      prev.current = value
    }
  }, [value, raw])

  return <motion.span className={className}>{text}</motion.span>
}