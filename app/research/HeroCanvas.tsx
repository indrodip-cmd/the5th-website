'use client'
import { useEffect, useRef } from 'react'

/* Interactive constellation: drifting nodes that link up and lean toward the cursor. */
export default function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, raf = 0, vis = true
    const mouse = { x: -999, y: -999 }
    type P = { x: number; y: number; vx: number; vy: number; r: number; g: boolean }
    let pts: P[] = []
    const size = () => {
      const r = cv.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = r.width; h = r.height
      cv.width = w * dpr; cv.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round(Math.min(90, Math.max(28, (w * h) / 14000)))
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: 1 + Math.random() * 2, g: Math.random() < 0.22 }))
    }
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of pts) {
        if (!still) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy)
          if (d < 160 && d > 1) { p.vx += (dx / d) * 0.012; p.vy += (dy / d) * 0.012 }
          p.vx *= 0.995; p.vy *= 0.995
          p.x += p.vx; p.y += p.vy
          if (p.x < 0 || p.x > w) p.vx *= -1
          if (p.y < 0 || p.y > h) p.vy *= -1
        }
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
          if (d < 120) { ctx.strokeStyle = `rgba(228,200,121,${0.22 * (1 - d / 120)})`; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke() }
        }
        const md = Math.hypot(mouse.x - pts[i].x, mouse.y - pts[i].y)
        if (md < 150) { ctx.strokeStyle = `rgba(255,255,255,${0.35 * (1 - md / 150)})`; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke() }
      }
      for (const p of pts) { ctx.fillStyle = p.g ? 'rgba(228,200,121,.95)' : 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill() }
      if (!still && vis) raf = requestAnimationFrame(draw)
    }
    const move = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top }
    const leave = () => { mouse.x = -999; mouse.y = -999 }
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !still) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw) } })
    io.observe(cv)
    size(); draw()
    window.addEventListener('resize', size)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerleave', leave)
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', size); window.removeEventListener('pointermove', move); window.removeEventListener('pointerleave', leave) }
  }, [])
  return <canvas ref={ref} aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
}
