'use client'
/* Mounts a heavy below-the-fold block only when it nears the viewport, so its
   JS is fetched and hydrated after first paint instead of during it. */
import { Suspense, useEffect, useRef, useState } from 'react'

export default function Defer({ children, minHeight = 320, margin = '900px' }: { children: React.ReactNode; minHeight?: number; margin?: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || on) return
    if (typeof IntersectionObserver === 'undefined') { Promise.resolve().then(() => setOn(true)); return }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setOn(true); io.disconnect() } }, { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [on, margin])
  return <div ref={ref} style={on ? undefined : { minHeight }}>{on ? <Suspense fallback={<div style={{ minHeight }} />}>{children}</Suspense> : null}</div>
}
