'use client'
/* Post-application "choose your time" — conversion-optimized. Real logo,
   commitment/value/reassurance copy, trust + scarcity to cut drop-off, the
   official Cal.com React embed (event details hidden), and a premium Thank-You
   pulled from the Cal.com API. */
import { useEffect, useState } from 'react'
import Cal, { getCalApi } from '@calcom/embed-react'

const AVATARS = ['jeanne', 'angela', 'hayley', 'laurie', 'toril']

export default function ChoseYourTime() {
  const [booked, setBooked] = useState(false)
  const [info, setInfo] = useState<{ name?: string; start?: string; meetingUrl?: string | null }>({})

  useEffect(() => {
    ;(async () => {
      const cal = await getCalApi({ namespace: '60min' })
      cal('ui', { hideEventTypeDetails: true, layout: 'month_view' })
      cal('on', {
        action: 'bookingSuccessful',
        callback: (e: unknown) => {
          const d = ((e as { detail?: { data?: Record<string, unknown> } })?.detail?.data) || {}
          const b = (d.booking as Record<string, unknown>) || d
          const att = ((b.attendees as Array<Record<string, unknown>>)?.[0]) || {}
          const start = String(b.startTime || d.date || b.start || '')
          const email = String(att.email || '').toLowerCase()
          setInfo({ name: String(att.name || ''), start }); setBooked(true)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          if (email) fetch(`/api/cal/recent-booking?email=${encodeURIComponent(email)}`).then((r) => r.json()).then((j) => { if (j?.booking) setInfo((c) => ({ name: j.booking.name || c.name, start: j.booking.start || c.start, meetingUrl: j.booking.meetingUrl })) }).catch(() => {})
        },
      })
    })()
  }, [])

  const when = info.start ? new Date(info.start).toLocaleString([], { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''

  return (
    <div style={{ minHeight: '100dvh', background: 'radial-gradient(120% 80% at 50% -10%, #f3ecfa 0%, #faf8fc 55%)', fontFamily: 'Inter, system-ui, sans-serif', color: '#1c1720' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box}
        @keyframes pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        @keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .cyt-grid{display:grid;grid-template-columns:minmax(0,420px) minmax(0,1fr);gap:40px;align-items:start}
        .cyt-cal{position:sticky;top:24px;height:720px}
        @media(max-width:880px){.cyt-grid{grid-template-columns:1fr;gap:24px}.cyt-cal{position:static;height:640px}}`}</style>

      <header style={{ padding: '26px 28px', display: 'flex', justifyContent: 'center' }}>
        <a href="/"><img src="/public/images/logo.png" alt="The5th Consulting" style={{ height: 40, width: 'auto' }} /></a>
      </header>

      <main style={{ width: '100%', maxWidth: 1080, margin: '0 auto', padding: '0 24px 70px' }}>
        {!booked ? (
          <div className="cyt-grid">
            <div style={{ animation: 'rise .4s ease' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#eaf7ef', color: '#1C4A32', fontWeight: 700, fontSize: 12.5, padding: '6px 12px', borderRadius: 999, marginBottom: 18 }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#1C4A32', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✓</span>
                Application received · Step 2 of 2
              </div>
              <h1 style={{ fontSize: 'clamp(30px,4.4vw,44px)', fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.08, color: '#2a2233', margin: 0 }}>
                You’ve done the hard part. Now let’s map your next <span style={{ color: '#C9A84C' }}>$10K month.</span>
              </h1>
              <p style={{ fontSize: 16.5, color: '#57505f', lineHeight: 1.65, marginTop: 18 }}>
                Pick a time below and you’re locked in. You’ll talk <b style={{ color: '#3D2645' }}>1-on-1 with Indrodip</b> — not a sales rep — about exactly what’s holding your business back and the fastest path forward. It’s free, and there’s <b style={{ color: '#3D2645' }}>zero pressure</b> to buy anything.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px', margin: '22px 0' }}>
                {['1-on-1 with Indrodip', 'Completely free', 'No pitch, no pressure'].map((t) => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, color: '#3D2645', fontWeight: 600 }}><span style={{ color: '#C9A84C' }}>✓</span>{t}</span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid #ece7f0', borderRadius: 16, padding: 16, boxShadow: '0 8px 30px rgba(40,20,50,.05)' }}>
                <img src="/public/images/founder.png" alt="Indrodip Ghosh" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ fontSize: 13.5, color: '#57505f', lineHeight: 1.5 }}><b style={{ color: '#2a2233' }}>You’ll speak with Indrodip personally.</b><br />He’s helped 76+ women turn expertise into income.</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
                <div style={{ display: 'flex' }}>{AVATARS.map((a, i) => <img key={a} src={`/public/clients/${a}.jpg`} alt="" style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid #faf8fc', marginLeft: i ? -10 : 0, objectFit: 'cover' }} />)}</div>
                <div style={{ fontSize: 13, color: '#57505f' }}><span style={{ color: '#C9A84C', letterSpacing: 1 }}>★★★★★</span><br /><b style={{ color: '#2a2233' }}>Join 76+ women</b> who already booked their call.</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 22, fontSize: 13, color: '#a1451f', fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e0692f', boxShadow: '0 0 0 4px rgba(224,105,47,.18)' }} />
                We open only a handful of calls each week — grab yours before they’re gone.
              </div>
            </div>

            <div className="cyt-cal">
              <div style={{ width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', background: '#fff', border: '1px solid #ece7f0', boxShadow: '0 16px 50px rgba(40,20,50,.09)' }}>
                <Cal namespace="60min" calLink="indrodip-ghosh-ut1vxh/60min" style={{ width: '100%', height: '100%', overflow: 'scroll' }} config={{ layout: 'month_view', useSlotsViewOnSmallScreen: 'true' }} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 560, margin: '4vh auto 0', textAlign: 'center', animation: 'rise .5s ease' }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', margin: '0 auto 24px', background: 'linear-gradient(160deg,#1C4A32,#2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 44px rgba(28,74,50,.4)', animation: 'pop .5s cubic-bezier(.22,1.4,.4,1)' }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h1 style={{ fontSize: 'clamp(28px,5vw,40px)', fontWeight: 800, letterSpacing: '-.02em', color: '#2a2233', margin: 0 }}>You’re all set{info.name ? `, ${info.name.split(' ')[0]}` : ''} ✦</h1>
            {when && <p style={{ fontSize: 17.5, color: '#3D2645', fontWeight: 700, marginTop: 14 }}>{when}</p>}
            <p style={{ fontSize: 15, color: '#57505f', lineHeight: 1.65, marginTop: 10 }}>A calendar invite and confirmation are on their way to your inbox. Add it to your calendar so you don’t miss it — this is your time.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
              {info.meetingUrl && <a href={info.meetingUrl} target="_blank" rel="noopener" style={gold}>Join link</a>}
              <a href="/results" style={ghost}>See client results while you wait →</a>
            </div>
          </div>
        )}
      </main>
      <div style={{ textAlign: 'center', fontSize: 12, color: '#b3abbb', padding: '0 0 22px' }}>© 2026 The5th Consulting</div>
    </div>
  )
}

const gold: React.CSSProperties = { display: 'inline-block', background: 'linear-gradient(145deg,#C9A84C,#a9862f)', color: '#1a1206', fontWeight: 700, fontSize: 14.5, padding: '12px 24px', borderRadius: 12, textDecoration: 'none' }
const ghost: React.CSSProperties = { display: 'inline-block', background: '#fff', border: '1px solid #e7e2ec', color: '#3D2645', fontWeight: 600, fontSize: 14.5, padding: '12px 22px', borderRadius: 12, textDecoration: 'none' }
