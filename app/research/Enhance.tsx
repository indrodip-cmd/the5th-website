'use client'
import { useEffect } from 'react'

/* Editorial enhancer: inserts a numbered chapter banner (the article's own
   illustration, varied) before each top-level section heading and one mid-article
   call-to-action. Only adds sibling nodes; never edits React-owned text. */
export default function Enhance() {
  useEffect(() => {
    const root = document.querySelector('.rsch-art')
    if (!root) return
    const src = document.getElementById('rsch-banner-src')?.innerHTML ?? ''
    const added: HTMLElement[] = []
    const h2s = Array.from(root.querySelectorAll('h2')).filter((h) => !h.closest('#new-in-2026'))
    let n = 0
    h2s.forEach((h, i) => {
      const t = (h.textContent ?? '').trim()
      if (/^\d+\.\d/.test(t)) return // sub-section like 3.1
      n += 1
      const m = t.match(/^(\d+)\./)
      const label = m ? `Chapter ${m[1]}` : t.length < 24 ? t : `Section ${n}`
      const wrap = document.createElement('div')
      wrap.className = 'rsch-chap'
      wrap.setAttribute('aria-hidden', 'true')
      const flip = n % 2 === 0 ? 'scaleX(-1)' : 'none'
      const shift = (n * 17) % 60
      wrap.innerHTML = `<div class="rsch-chap-art" style="transform:${flip};filter:hue-rotate(${(n % 3) * 8}deg)"><div style="margin-top:-${shift}px">${src}</div></div><span class="rsch-chap-tag">${label}</span>`
      h.parentNode?.insertBefore(wrap, h)
      added.push(wrap)
      if (i === 2 && h2s.length > 4) {
        const cta = document.createElement('aside')
        cta.className = 'rsch-cta'
        cta.innerHTML = `<div><div class="rsch-cta-k">Independent research</div><div class="rsch-cta-t">Get each new paper, with the data, the day it drops.</div></div><a href="/research#newsletter">Join the newsletter</a>`
        h.parentNode?.insertBefore(cta, wrap)
        added.push(cta)
      }
    })
    return () => added.forEach((a) => a.remove())
  }, [])
  return null
}
