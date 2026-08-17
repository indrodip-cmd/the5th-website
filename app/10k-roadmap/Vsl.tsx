'use client'
/* VSL container for the audit landing page.

   Cinematic click-to-play poster → player. Fires the funnel's video events
   (vsl_play, vsl_25/50/75, vsl_complete) once each. Supports YouTube and Vimeo
   (via their SDKs, for accurate % milestones) and self-hosted video files
   (native <video>). Lazy: the player/iframe is only created on first play, so
   the VSL never hurts initial page load. Never autoplays with sound. */
import { useEffect, useRef, useState } from 'react'
import { T } from './config'
import { track, type AuditEvent } from './track'

type Provider = 'youtube' | 'vimeo' | 'file' | 'none'
function detect(url: string): { provider: Provider; id: string } {
  const raw = (url || '').trim()
  if (!raw) return { provider: 'none', id: '' }
  if (/\.(mp4|webm|m3u8|mov)(\?|$)/i.test(raw)) return { provider: 'file', id: raw }
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    const host = u.hostname.replace(/^www\./, '')
    if (host.includes('vimeo')) return { provider: 'vimeo', id: u.pathname.split('/').filter(Boolean).pop() || '' }
    if (host === 'youtu.be') return { provider: 'youtube', id: u.pathname.slice(1) }
    if (host.includes('youtube')) return { provider: 'youtube', id: u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop() || '' }
  } catch { /* noop */ }
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return { provider: 'youtube', id: raw }
  if (/^\d{6,}$/.test(raw)) return { provider: 'vimeo', id: raw }
  return { provider: 'file', id: raw }
}

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById(id)) return resolve()
    const s = document.createElement('script'); s.src = src; s.id = id; s.async = true; s.onload = () => resolve()
    document.head.appendChild(s)
  })
}

// YT / Vimeo minimal SDK shapes.
type YTPlayer = { getCurrentTime?: () => number; getDuration?: () => number; getPlayerState?: () => number }
type YTNS = { Player: new (el: Element, opts: unknown) => YTPlayer }
type VimeoNS = { Player: new (el: Element, opts: unknown) => { on: (e: string, cb: (d: { percent?: number; seconds?: number }) => void) => void } }

export default function Vsl({ url, poster }: { url: string; poster?: string }) {
  const { provider, id } = detect(url)
  const [playing, setPlaying] = useState(false)
  const mountRef = useRef<HTMLDivElement>(null)
  const fired = useRef<Set<AuditEvent>>(new Set())

  const mark = (pct: number) => {
    const map: [number, AuditEvent][] = [[25, 'vsl_25'], [50, 'vsl_50'], [75, 'vsl_75'], [99, 'vsl_complete']]
    for (const [p, ev] of map) if (pct >= p && !fired.current.has(ev)) { fired.current.add(ev); track(ev) }
  }

  useEffect(() => {
    if (!playing || provider === 'none' || provider === 'file') return
    let poll = 0
    const el = mountRef.current
    if (!el) return
    if (provider === 'youtube') {
      const w = window as unknown as { YT?: YTNS; onYouTubeIframeAPIReady?: () => void }
      const init = () => {
        if (!w.YT?.Player || !mountRef.current) return
        const player = new w.YT.Player(mountRef.current, { videoId: id, playerVars: { rel: 0, modestbranding: 1, playsinline: 1, autoplay: 1 } })
        poll = window.setInterval(() => {
          try {
            const d = player.getDuration?.() || 0, t = player.getCurrentTime?.() || 0
            if (d > 0) mark((t / d) * 100)
          } catch { /* not ready */ }
        }, 1000)
      }
      loadScript('https://www.youtube.com/iframe_api', 'yt-iframe-api').then(() => {
        if (w.YT?.Player) init()
        else { const prev = w.onYouTubeIframeAPIReady; w.onYouTubeIframeAPIReady = () => { prev?.(); init() } }
      })
    } else if (provider === 'vimeo') {
      const w = window as unknown as { Vimeo?: VimeoNS }
      loadScript('https://player.vimeo.com/api/player.js', 'vimeo-player-api').then(() => {
        if (!w.Vimeo?.Player || !mountRef.current) return
        const player = new w.Vimeo.Player(mountRef.current, { id, autoplay: true, dnt: true, responsive: true })
        player.on('timeupdate', (d) => { if (typeof d.percent === 'number') mark(d.percent * 100) })
        player.on('ended', () => mark(100))
      })
    }
    return () => { if (poll) window.clearInterval(poll) }
  }, [playing, provider, id])

  const start = () => { setPlaying(true); track('vsl_play') }

  const frame: React.CSSProperties = {
    position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 20, overflow: 'hidden',
    background: '#0c0c0c', border: `1px solid ${T.line}`, boxShadow: '0 40px 120px -50px rgba(201,168,76,.35), 0 30px 80px -40px #000',
  }

  return (
    <div style={frame}>
      {!playing && (
        <button onClick={start} aria-label="Play the training" className="rm-focus"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', cursor: 'pointer', padding: 0,
            background: poster ? `linear-gradient(180deg,rgba(8,8,8,.15),rgba(8,8,8,.65)), url(${poster}) center/cover` : 'radial-gradient(120% 90% at 50% 20%, #1a1a1a, #0a0a0a)' }}>
          <span style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            <span style={{ width: 84, height: 84, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px -6px rgba(201,168,76,.6)' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="#12100a"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 600, letterSpacing: '.02em', textShadow: '0 2px 12px rgba(0,0,0,.6)' }}>Play the training</span>
          </span>
        </button>
      )}
      {playing && provider === 'file' && (
        <video src={id} poster={poster} controls autoPlay playsInline
          onTimeUpdate={(e) => { const v = e.currentTarget; if (v.duration) mark((v.currentTime / v.duration) * 100) }}
          onEnded={() => mark(100)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: '#000' }} />
      )}
      {playing && (provider === 'youtube' || provider === 'vimeo') && (
        <div ref={mountRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      )}
      {playing && provider === 'none' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2, fontSize: 14 }}>Training video coming soon.</div>
      )}
    </div>
  )
}
