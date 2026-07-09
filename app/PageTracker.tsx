'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    __a5trackPage?: (path: string) => void
  }
}

/* Bridges client-side (SPA) route changes in the Next app to the first-party
   tracker in /public/track.js. track.js fires the initial pageview on load;
   this only handles subsequent in-app navigations. */
export default function PageTracker() {
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (typeof window !== 'undefined' && typeof window.__a5trackPage === 'function') {
      window.__a5trackPage(pathname)
    }
  }, [pathname])

  return null
}
