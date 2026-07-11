'use client'
/* Post-Typeform step — "choose your time". Big headline + live Cal.com booking
   embed; on a successful booking, a premium Thank-You that pulls the confirmed
   call from the Cal.com API. */
import { useEffect, useState } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global { interface Window { Cal?: any } }

const CAL_LINK = 'indrodip-ghosh-ut1vxh/60min'

export default function ChoseYourTime() {
  const [booked, setBooked] = useState(false)
  const [info, setInfo] = useState<{ name?: string; start?: string; meetingUrl?: string | null }>({})

  useEffect(() => {
    // Cal.com embed loader.
    ;(function (C: any, A: string, L: string) { const p = (a: any, ar: any) => a.q.push(ar); const d = C.document; C.Cal = C.Cal || function (this: any) { const cal = C.Cal; const ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true } if (ar[0] === L) { const api: any = function () { p(api, arguments) }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]) } else p(cal, ar); return } p(cal, ar) } })(window, 'https://app.cal.com/embed/embed.js', 'init')

    const Cal = window.Cal
    Cal('init', 'cyt', { origin: 'https://cal.com' })
    Cal.ns.cyt('inline', { elementOrSelector: '#cal-booking', calLink: CAL_LINK, layout: 'month_view' })
    Cal.ns.cyt('ui', { hideEventTypeDetails: false, layout: 'month_view' })
    Cal.ns.cyt('on', {
      action: 'bookingSuccessful',
      callback: (e: any) => {
        const d = (e && e.detail && e.detail.data) || {}
        const b = d.booking || d || {}
        const att = (b.attendees && b.attendees[0]) || {}
        const start = b.startTime || d.date || b.start || ''
        const name = att.name || ''
        const email = (att.email || '').toLowerCase()
        setInfo({ name, start })
        setBooked(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        // Enrich with the confirmed booking (join link, exact time) from the Cal.com API.
        if (email) fetch(`/api/cal/recent-booking?email=${encodeURIComponent(email)}`).then((r) => r.json()).then((j) => { if (j?.booking) setInfo((cur) => ({ name: j.booking.name || cur.name, start: j.booking.start || cur.start, meetingUrl: j.booking.meetingUrl })) }).catch(() => {})
      },
    })
  }, [])

  const when = info.start ? new Date(info.start).toLocaleString([], { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''

  return (
    <div style={{ minHeight: '100dvh', background: '#faf8fc', fontFamily: 'Inter, system-ui, sans-serif', color: '#1c1720', display: 'flex', flexDirection: 'column' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box}@keyframes pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>

      <header style={{ padding: '22px 28px' }}>
        <a href="/" style={{ fontSize: 18, fontWeight: 800, color: '#3D2645', textDecoration: 'none' }}>The<span style={{ color: '#C9A84C' }}>5th</span></a>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 860, margin: '0 auto', padding: '0 22px 60px' }}>
        {!booked ? (
          <>
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '10px auto 30px', animation: 'rise .4s ease' }}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 14 }}>Your last step</div>
              <h1 style={{ fontSize: 'clamp(30px,5vw,48px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.08, color: '#2a2233', margin: 0 }}>Choose a time that suits you</h1>
              <p style={{ fontSize: 'clamp(15px,2vw,17px)', color: '#6b6472', lineHeight: 1.6, marginTop: 14 }}>Pick a slot below and you’re all set. You’ll speak with Indrodip personally — bring your biggest question.</p>
            </div>
            <div id="cal-booking" style={{ width: '100%', minHeight: 680, borderRadius: 18, overflow: 'hidden', background: '#fff', border: '1px solid #ece7f0', boxShadow: '0 10px 40px rgba(40,20,50,.07)' }} />
          </>
        ) : (
          <div style={{ maxWidth: 560, margin: '6vh auto 0', textAlign: 'center', animation: 'rise .5s ease' }}>
            <div style={{ width: 84, height: 84, borderRadius: '50%', margin: '0 auto 22px', background: 'linear-gradient(160deg,#1C4A32,#2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(28,74,50,.4)', animation: 'pop .5s cubic-bezier(.22,1.4,.4,1)' }}>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h1 style={{ fontSize: 'clamp(28px,5vw,40px)', fontWeight: 800, letterSpacing: '-.02em', color: '#2a2233', margin: 0 }}>You’re all set{info.name ? `, ${info.name.split(' ')[0]}` : ''} ✦</h1>
            {when && <p style={{ fontSize: 17, color: '#3D2645', fontWeight: 700, marginTop: 14 }}>{when}</p>}
            <p style={{ fontSize: 15, color: '#6b6472', lineHeight: 1.6, marginTop: 10 }}>A calendar invite and confirmation are on their way to your inbox. Add it to your calendar so you don’t miss it.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
              {info.meetingUrl && <a href={info.meetingUrl} target="_blank" rel="noopener" style={gold}>Join link</a>}
              <a href="/results" style={ghost}>See client results while you wait →</a>
            </div>
          </div>
        )}
      </main>
      <div style={{ textAlign: 'center', fontSize: 12, color: '#b3abbb', padding: '0 0 20px' }}>© 2026 The5th Consulting</div>
    </div>
  )
}

const gold: React.CSSProperties = { display: 'inline-block', background: 'linear-gradient(145deg,#C9A84C,#a9862f)', color: '#1a1206', fontWeight: 700, fontSize: 14.5, padding: '12px 24px', borderRadius: 12, textDecoration: 'none' }
const ghost: React.CSSProperties = { display: 'inline-block', background: '#fff', border: '1px solid #e7e2ec', color: '#3D2645', fontWeight: 600, fontSize: 14.5, padding: '12px 22px', borderRadius: 12, textDecoration: 'none' }
