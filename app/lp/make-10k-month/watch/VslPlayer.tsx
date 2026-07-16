'use client'
/* VSL player that exposes REAL playback-time, not a page-load timer.

   Watch-time = the sum of forward playback deltas while the video is actually
   playing. Pausing stops accrual; resuming continues it; seeking backward or
   skipping forward never inflates it. That gives a true "cumulative seconds
   watched" that survives pause/resume (and, seeded from the parent, survives a
   tab close / reload).

   Supports YouTube (IFrame API) and Vimeo (Player SDK); provider is detected
   from the URL. The iframe is only created once the parent mounts this
   component (the parent lazy-mounts it when it scrolls into view). */
import { useEffect, useRef } from 'react'

type Provider = 'youtube' | 'vimeo'
type Parsed = { provider: Provider; id: string }

// Minimal shapes of the third-party player SDKs we actually call.
type YTPlayer = { getPlayerState?: () => number; getCurrentTime?: () => number; destroy?: () => void }
type YTNamespace = { Player: new (el: Element, opts: unknown) => YTPlayer }
type VimeoPlayer = { on: (ev: string, cb: (d: { seconds: number }) => void) => void; destroy?: () => void }
type VimeoNamespace = { Player: new (el: Element, opts: unknown) => VimeoPlayer }

function parseVideo(url: string): Parsed | null {
  const raw = (url || '').trim()
  if (!raw) return null
  // Bare id
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return { provider: 'youtube', id: raw }
  if (/^\d{6,}$/.test(raw)) return { provider: 'vimeo', id: raw }
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    const host = u.hostname.replace(/^www\./, '')
    if (host.includes('vimeo')) {
      const id = u.pathname.split('/').filter(Boolean).pop() || ''
      if (id) return { provider: 'vimeo', id }
    }
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1)
      if (id) return { provider: 'youtube', id }
    }
    if (host.includes('youtube')) {
      const v = u.searchParams.get('v')
      if (v) return { provider: 'youtube', id: v }
      const parts = u.pathname.split('/').filter(Boolean) // /embed/ID or /shorts/ID
      const id = parts[parts.length - 1]
      if (id) return { provider: 'youtube', id }
    }
  } catch { /* fall through */ }
  return null
}

// Load an external script once (idempotent).
function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById(id)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.id = id
    s.async = true
    s.onload = () => resolve()
    document.head.appendChild(s)
  })
}

export default function VslPlayer({
  videoUrl,
  initialSeconds,
  onWatched,
  autoplay = false,
}: {
  videoUrl: string
  initialSeconds: number
  onWatched: (cumulativeSeconds: number, meta: { completed: boolean }) => void
  autoplay?: boolean
}) {
  const mountRef = useRef<HTMLDivElement>(null)
  const accumRef = useRef(initialSeconds || 0)
  const lastPosRef = useRef<number | null>(null)
  const playingRef = useRef(false)
  const completedRef = useRef(false)
  const onWatchedRef = useRef(onWatched)
  useEffect(() => { onWatchedRef.current = onWatched })

  // A single playback sample: currentTime (seconds) + whether it's playing.
  function sample(t: number, playing: boolean) {
    if (playing && lastPosRef.current != null) {
      const delta = t - lastPosRef.current
      // Only real forward playback counts (poll ~1s; allow small slack).
      if (delta > 0 && delta < 2) accumRef.current += delta
    }
    lastPosRef.current = t
    playingRef.current = playing
    onWatchedRef.current(Math.floor(accumRef.current), { completed: completedRef.current })
  }

  useEffect(() => {
    const parsed = parseVideo(videoUrl)
    if (!parsed || !mountRef.current) return
    let cleanup = () => {}
    let cancelled = false

    if (parsed.provider === 'youtube') {
      const w = window as unknown as { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void }
      const init = () => {
        if (cancelled || !mountRef.current || !w.YT?.Player) return
        const player = new w.YT.Player(mountRef.current, {
          videoId: parsed.id,
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1, autoplay: autoplay ? 1 : 0 },
          events: {
            onStateChange: (e: { data: number }) => {
              // 1 = playing, 0 = ended
              if (e.data === 0) { completedRef.current = true }
            },
          },
        })
        const poll = window.setInterval(() => {
          try {
            const state = player.getPlayerState?.() // 1 playing
            const t = player.getCurrentTime?.() || 0
            sample(t, state === 1)
          } catch { /* player not ready */ }
        }, 1000)
        cleanup = () => { window.clearInterval(poll); try { player.destroy?.() } catch { /* noop */ } }
      }
      loadScript('https://www.youtube.com/iframe_api', 'yt-iframe-api').then(() => {
        if (w.YT?.Player) init()
        else { const prev = w.onYouTubeIframeAPIReady; w.onYouTubeIframeAPIReady = () => { prev?.(); init() } }
      })
    } else {
      const w = window as unknown as { Vimeo?: VimeoNamespace }
      loadScript('https://player.vimeo.com/api/player.js', 'vimeo-player-api').then(() => {
        if (cancelled || !mountRef.current || !w.Vimeo?.Player) return
        const player = new w.Vimeo.Player(mountRef.current, {
          id: parsed.id, responsive: true, dnt: true, playsinline: true, autoplay,
        })
        player.on('timeupdate', (d: { seconds: number }) => sample(d.seconds, true))
        player.on('pause', () => { playingRef.current = false; lastPosRef.current = null })
        player.on('ended', () => { completedRef.current = true; onWatchedRef.current(Math.floor(accumRef.current), { completed: true }) })
        cleanup = () => { try { player.destroy?.() } catch { /* noop */ } }
      })
    }

    return () => { cancelled = true; cleanup() }
  }, [videoUrl])

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#120912', borderRadius: 14, overflow: 'hidden' }}>
      <div ref={mountRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    </div>
  )
}
