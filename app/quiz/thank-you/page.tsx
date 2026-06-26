'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const [name, setName] = useState('')

  const date = searchParams.get('date') || ''
  const time = searchParams.get('time') || ''

  useEffect(() => {
    const n = sessionStorage.getItem('video_name') || sessionStorage.getItem('quiz_name') || ''
    const e = sessionStorage.getItem('quiz_email') || ''
    setName(n)
    // Stop email sequence now that they have booked
    if (e) {
      fetch('/api/update-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, call_booked: true, sequence_assigned: null })
      }).catch(() => {})
    }
  }, [])

  const firstName = name.split(' ')[0] || 'there'

  const formatDate = (d: string) => {
    if (!d) return ''
    try {
      const dt = new Date(d)
      return dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return d
    }
  }

  const formatTime = (t: string) => {
    if (!t) return ''
    try {
      const [h, m] = t.split(':')
      const hour = parseInt(h)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
      return `${displayHour}:${m} ${ampm}`
    } catch {
      return t
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2ee', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Cormorant+Garant:wght@700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .fade-up-2 { animation: fadeUp 0.6s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.6s 0.4s ease both; }
        .scale-in { animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @media (max-width: 480px) {
          .thankyou-inner { padding: 40px 20px !important; }
          .thankyou-h1 { font-size: 28px !important; }
          .booking-details { padding: 24px 20px !important; }
        }
      `}</style>

      <header style={{ background: 'rgba(255,255,255,0.97)', borderBottom: '1px solid #f0f0f0', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="28" height="32" viewBox="0 0 32 36" fill="none">
          <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 14 21 10 21 10C21 10 20 14 18 16C17 17 16 17 16 17C16 17 18 13 16 2Z" fill="#2d6a4f"/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#225840', letterSpacing: '.06em', textTransform: 'uppercase' }}>THE5TH CONSULTING</span>
      </header>

      <div className="thankyou-inner" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>

          <div className="scale-in" style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #225840, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', fontSize: 36 }}>
            &#10003;
          </div>

          <div className="fade-up">
            <h1 className="thankyou-h1" style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 900, color: '#1a1a1a', lineHeight: 1.1, marginBottom: 16 }}>
              You are booked, {firstName}.
            </h1>
            <p style={{ fontSize: 17, color: '#555', lineHeight: 1.7, marginBottom: 36 }}>
              Indrodip is looking forward to speaking with you. Check your email for a calendar confirmation with everything you need.
            </p>
          </div>

          {(date || time) ? (
            <div className="fade-up-2 booking-details" style={{ background: '#fff', borderRadius: 20, padding: '32px 40px', marginBottom: 36, boxShadow: '0 4px 40px rgba(0,0,0,0.06)', border: '1px solid #e8e8e8' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: '#b8960c', textTransform: 'uppercase', marginBottom: 20 }}>
                Your Confirmed Session
              </div>
              {date && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Date</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>{formatDate(date)}</div>
                </div>
              )}
              {time && (
                <div>
                  <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Time</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#225840' }}>{formatTime(time)}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="fade-up-2" style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', marginBottom: 36, boxShadow: '0 4px 40px rgba(0,0,0,0.06)', border: '1px solid #e8e8e8' }}>
              <p style={{ fontSize: 15, color: '#666' }}>Check your email for your confirmed date and time.</p>
            </div>
          )}

          <div className="fade-up-3">
            <a
              href="https://whop.com/joined/10kroadmap-org/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', padding: '16px 36px', background: 'linear-gradient(135deg, #225840, #2d6a4f)', color: '#fff', fontSize: 16, fontWeight: 700, borderRadius: 50, textDecoration: 'none', transition: 'transform 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Join Our Community
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f5f2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Loading...</p></div>}>
      <ThankYouContent />
    </Suspense>
  )
}
