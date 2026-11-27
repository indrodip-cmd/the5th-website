'use client'
/* "Your space": a living, device-only progress page. Everything shown is read from this browser
   (quiz profile, interest memory, visit history) and refreshes as the visitor acts. */
import { useCallback, useEffect, useState } from 'react'

type Profile = { primary: string; primaryName: string; secondary?: string; archetype: string; profileId: string; band?: string; readiness?: string; first?: string }
type Hist = { t: number; overall: number }
type Step = { key: string; url: string; go: string; why: string } | null
type Mind = { w: Record<string, number> }
type Visitor = { visitCount?: number; firstSeen?: number; pages?: string[] }
declare global { interface Window { The5thMind?: { next: () => Step; weights: () => Record<string, number> }; The5thVoice?: { open: (s?: string) => void } } }

const LABEL: Record<string, string> = { collective: 'The Collective', ff: 'Fast Forward', audit: 'The $29 audit call', ai: 'The5th AI', book: 'Ebook and workbooks', research: 'Research essays', results: 'Client results', quiz: 'Income Blocker Quiz' }
function read<T>(k: string, d: T): T { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d } catch { return d } }

export default function MePage() {
  const [ready, setReady] = useState(false)
  const [first, setFirst] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [code, setCode] = useState('')
  const [hist, setHist] = useState<Hist[]>([])
  const [mind, setMind] = useState<Mind>({ w: {} })
  const [vis, setVis] = useState<Visitor>({})
  const [step, setStep] = useState<Step>(null)
  const [days, setDays] = useState(1)

  const refresh = useCallback(() => {
    const p = read<Profile | null>('a5_profile', null)
    const q = read<{ code?: string; name?: string } | null>('a5_quiz_v2', null)
    setProfile(p); setCode(q?.code || '')
    setFirst((localStorage.getItem('the5th_first_name') || p?.first || q?.name?.split(' ')[0] || '').trim())
    setHist(read<Hist[]>('a5_quiz_hist', []))
    setMind(read<Mind>('the5th_mind_v1', { w: {} }))
    const v = read<Visitor>('the5th_visitor_v1', {})
    setVis(v); setDays(v.firstSeen ? Math.max(1, Math.round((Date.now() - v.firstSeen) / 864e5)) : 1)
    try { setStep(window.The5thMind?.next() || null) } catch { /* alive.js not loaded yet */ }
  }, [])

  useEffect(() => {
    const t0 = setTimeout(() => { refresh(); setReady(true) }, 0)
    const t = setInterval(refresh, 4000)
    const onStore = () => refresh()
    window.addEventListener('storage', onStore); window.addEventListener('focus', onStore)
    return () => { clearTimeout(t0); clearInterval(t); window.removeEventListener('storage', onStore); window.removeEventListener('focus', onStore) }
  }, [refresh])

  const ranked = Object.entries(mind.w || {}).filter(([k, v]) => v > 0 && LABEL[k]).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const max = ranked[0]?.[1] || 1
  const reportHref = code ? `/quiz/report?r=${code}&n=${encodeURIComponent(first)}` : '/quiz'

  function spark() {
    if (hist.length < 2) return null
    const v = hist.map((h) => h.overall), lo = Math.min(...v), hi = Math.max(...v), span = Math.max(1, hi - lo)
    const pts = v.map((y, i) => [20 + (i / (v.length - 1)) * 360, 100 - ((y - lo) / span) * 80 - 10])
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
    return (
      <svg className="me-spark" viewBox="0 0 400 120" role="img" aria-label="Your blocker intensity over time">
        <path d={d} fill="none" stroke="#E4C879" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="5" fill="#C9A84C" />)}
      </svg>
    )
  }
  const delta = hist.length >= 2 ? hist[hist.length - 1].overall - hist[0].overall : 0

  function clearAll() {
    if (!confirm('Forget everything this device has learned about you? Your quiz report link will still work if you saved it.')) return
    ;['the5th_mind_v1', 'the5th_visitor_v1', 'a5_profile', 'a5_quiz_v2', 'a5_quiz_hist', 'the5th_first_name'].forEach((k) => localStorage.removeItem(k))
    try { window.The5thMind && (window.The5thMind as unknown as { clear: () => void }).clear() } catch { /* ignore */ }
    refresh()
  }

  return (
    <div className="me-wrap">
      <div className="me-nav"><a href="/"><img src="/images/logo-header-white.png" alt="The5th Global Consulting" /></a><a href="/resources">Resources</a></div>
      <span className="me-eb">Your space</span>
      <h1 className="me-h1">{first ? <>Welcome back, <em>{first}.</em></> : <>Your progress, <em>in one place.</em></>}</h1>
      <p className="me-sub">This page updates as you explore. It lives on this device only: nothing here is shared, and you can clear it any time.</p>

      {ready && (
        <div className="me-grid">
          <section className="me-card me-wide me-next" aria-live="polite">
            <span className="me-k">Your next step</span>
            {step ? (<>
              <h2>{step.go}</h2>
              <p className="me-p">{step.why}</p>
              <a className="me-btn" href={step.url}>{step.go} →</a>
            </>) : (<>
              <h2>Find your biggest income blocker</h2>
              <p className="me-p">A short, free assessment that shows what is really holding your income down, and what to do first.</p>
              <a className="me-btn" href="/quiz">Start now →</a>
            </>)}
          </section>

          <section className="me-card">
            <span className="me-k">Your profile</span>
            {profile ? (<>
              <div className="me-arch"><em>{profile.archetype}</em></div>
              <div className="me-id">{profile.profileId}</div>
              <p className="me-p">Main blocker: <b>{profile.primaryName}</b>. Your 7-day plan and full report are saved.</p>
              <a className="me-btn me-btn--g" href={reportHref}>Open my full report →</a>
            </>) : (<>
              <h2>Your profile builds here</h2>
              <p className="me-p">As you explore, this space fills with what we learn about your fastest path. Your personal blocker profile appears here once you have it.</p>
              <a className="me-btn me-btn--g" href="/quiz">Get my profile →</a>
            </>)}
          </section>

          <section className="me-card">
            <span className="me-k">Progress over time</span>
            {hist.length >= 2 ? (<>
              {spark()}
              <p className="me-delta">Blocker intensity: <b>{hist[0].overall} → {hist[hist.length - 1].overall}</b> {delta < 0 ? `(down ${Math.abs(delta)}, moving the right way)` : delta > 0 ? `(up ${delta}, a good moment to revisit your 7-day plan)` : '(steady)'}</p>
            </>) : (<>
              <h2>Your trend appears here</h2>
              <p className="me-p">Come back in a couple of weeks and revisit your profile. Your two results are plotted here so you can see what moved.</p>
              <a className="me-btn me-btn--g" href="/quiz">Revisit my profile →</a>
            </>)}
          </section>

          <section className="me-card">
            <span className="me-k">What you have explored</span>
            {ranked.length ? (
              <div className="me-bars">{ranked.map(([k, v]) => (
                <div className="me-bar" key={k}><span>{LABEL[k]}</span><i><b style={{ width: Math.max(8, (v / max) * 100) + '%' }} /></i><span>{v}</span></div>
              ))}</div>
            ) : <p className="me-p">Browse the site and this fills in with what interests you most.</p>}
            <div className="me-stats">
              <div><b>{vis.visitCount || 1}</b><span>Visits</span></div>
              <div><b>{days}</b><span>{days === 1 ? 'Day' : 'Days'} with us</span></div>
              <div><b>{new Set(vis.pages || []).size}</b><span>Pages seen</span></div>
            </div>
          </section>

          <section className="me-card">
            <span className="me-k">Ask The5th</span>
            <h2>Talk it through</h2>
            <p className="me-p">Ask a question out loud and hear a short answer, or open the chat. It already knows what you have been exploring.</p>
            <button className="me-btn" type="button" onClick={() => (window.The5thVoice ? window.The5thVoice.open() : undefined)}>Ask by voice</button>
            <button className="me-btn me-btn--g" type="button" style={{ marginLeft: 10 }} onClick={() => window.dispatchEvent(new CustomEvent('the5th:invite', { detail: { seed: 'Hi, can you help me choose my next step?' } }))}>Open chat</button>
          </section>
        </div>
      )}
      <p className="me-fine">Stored in this browser only. <button type="button" onClick={clearAll}>Clear everything this device remembers</button></p>
    </div>
  )
}
