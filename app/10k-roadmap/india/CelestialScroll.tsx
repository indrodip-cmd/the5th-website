'use client'

/* One scroll-linked signature, not a theme: a sun that sets into a crescent
   moon as the reader moves from the problem (pain) into the method
   (mechanism) — daylight hustle giving way to a calmer, structured night.
   transform/opacity only (10a), a still end-state when motion is reduced
   (27), decorative only — the page reads the same with scripting off. */
import { useEffect, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

function SunMark() {
  return (
    <g>
      <circle cx="16" cy="16" r="7" fill="var(--color-sun)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1={16 + Math.cos((a * Math.PI) / 180) * 11}
          y1={16 + Math.sin((a * Math.PI) / 180) * 11}
          x2={16 + Math.cos((a * Math.PI) / 180) * 14.5}
          y2={16 + Math.sin((a * Math.PI) / 180) * 14.5}
          stroke="var(--color-sun)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
    </g>
  )
}

function MoonMark() {
  return (
    <g>
      <circle cx="16" cy="16" r="8" fill="var(--color-accent-hi)" />
      <circle cx="20" cy="13" r="7" fill="var(--color-paper)" />
      <circle cx="4" cy="4" r="1" fill="var(--color-accent-hi)" opacity="0.8" />
      <circle cx="28" cy="10" r="1.3" fill="var(--color-accent-hi)" opacity="0.6" />
      <circle cx="6" cy="26" r="1" fill="var(--color-accent-hi)" opacity="0.5" />
    </g>
  )
}

export default function CelestialScroll({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  // Scroll-linked motion values render differently server-side (no layout
  // to measure) than after mount, which trips React's hydration check — so
  // the server and the first client paint both get this same static mark,
  // and only the mounted client swaps in the live scroll link.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const reduceMotion = useReducedMotion()
  // Fades the whole mark in as the pain→mechanism run enters the viewport,
  // and out again once it has fully passed — it's fixed on screen, but only
  // while the run it illustrates is actually in view.
  const { scrollYProgress: visible } = useScroll({ target: targetRef, offset: ['start end', 'end start'] })
  const visibility = useTransform(visible, [0, 0.06, 0.94, 1], [0, 1, 1, 0])
  // The sun→moon phase itself, timed to the middle of that same run.
  const { scrollYProgress: phase } = useScroll({ target: targetRef, offset: ['start 0.85', 'end 0.4'] })
  const sunPhase = useTransform(phase, [0, 0.45, 0.6], [1, 1, 0])
  const sunY = useTransform(phase, [0, 0.6], [0, -36])
  const moonPhase = useTransform(phase, [0.5, 0.7, 1], [0, 1, 1])
  const moonY = useTransform(phase, [0.5, 1], [36, 0])
  const sunOpacity = useTransform([visibility, sunPhase], ([v, s]: number[]) => v * s)
  const moonOpacity = useTransform([visibility, moonPhase], ([v, m]: number[]) => v * m)

  if (!mounted || reduceMotion) {
    return <svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden style={!mounted ? { opacity: 0 } : undefined}><MoonMark /></svg>
  }

  return (
    <>
      <motion.svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden style={{ opacity: sunOpacity, y: sunY, position: 'absolute', inset: 0 }}>
        <SunMark />
      </motion.svg>
      <motion.svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden style={{ opacity: moonOpacity, y: moonY, position: 'absolute', inset: 0 }}>
        <MoonMark />
      </motion.svg>
    </>
  )
}
