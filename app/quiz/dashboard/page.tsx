'use client'

import React, { useState, useEffect, useCallback } from 'react'

/* ── Returning-user dashboard: sign in with the email you used for the quiz,
   get a 6-digit code, and work through your personalised 7-Day Action Plan.
   One day unlocks per day. Progress saves as you tick things off. ── */

const C = {
  cream: '#FAF6F0', ivory: '#FBF8F2', creamDeep: '#EAE3D8',
  plum: '#3D2645', plumDark: '#2E1A35',
  gold: '#C9A84C', goldDeep: '#B0902F', goldLine: 'rgba(201,168,76,.32)',
  green: '#1C4A32', ink: '#1A1A2E', inkSoft: '#5a5550', muted: '#8A8075', border: '#E2DCD2', white: '#fff',
}

interface Task { text: string; done: boolean }
interface Day { day: number; title: string; tasks: Task[]; unlocked: boolean; unlockAt: string }
interface Plan { name: string; startedAt: string; unlockedDay: number; days: Day[] }

type Screen = 'checking' | 'login' | 'code' | 'ready'

/* Page chrome — module-scope so it isn't recreated on every render. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box}`}</style>
      <header style={{ padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, background: C.ivory }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: C.plum }}>The<em style={{ color: C.goldDeep }}>5th</em></span>
        <span style={{ fontSize: 12, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase' }}>7-Day Action Plan</span>
      </header>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const [screen, setScreen] = useState<Screen>('checking')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [plan, setPlan] = useState<Plan | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const fetchPlan = useCallback(async (): Promise<boolean> => {
    const res = await fetch('/api/quiz/plan', { credentials: 'same-origin' })
    if (res.ok) { setPlan(await res.json()); return true }
    return false
  }, [])

  useEffect(() => {
    ;(async () => { setScreen((await fetchPlan()) ? 'ready' : 'login') })()
  }, [fetchPlan])

  const sendCode = async () => {
    setError('')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setError('Please enter a valid email.'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/quiz/login-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'Something went wrong. Please try again.'); setBusy(false); return }
      setNotice('We just emailed you a 6-digit code. Check your inbox, and your spam or junk folder too.')
      setScreen('code')
    } catch { setError('Network error. Please try again.') }
    setBusy(false)
  }

  const verify = async () => {
    setError('')
    if (!/^\d{6}$/.test(otp.trim())) { setError('Enter the full 6-digit code.'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/quiz/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) { setError(data.error || 'That code did not work.'); setBusy(false); return }
      if (await fetchPlan()) setScreen('ready')
      else { setError('Signed in, but could not load your plan. Please refresh.'); }
    } catch { setError('Network error. Please try again.') }
    setBusy(false)
  }

  const toggle = async (day: number, index: number, done: boolean) => {
    // Optimistic update, then persist.
    setPlan(p => {
      if (!p) return p
      const days = p.days.map(d => d.day === day
        ? { ...d, tasks: d.tasks.map((t, i) => i === index ? { ...t, done } : t) }
        : d)
      return { ...p, days }
    })
    try {
      await fetch('/api/quiz/plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ day, index, done }),
      })
    } catch { /* optimistic; will reconcile on next load */ }
  }

  const authCard = (children: React.ReactNode) => (
    <Shell><div style={{ display: 'flex', justifyContent: 'center', padding: '64px 24px' }}>
      <div style={{ maxWidth: 440, width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: '40px 36px', boxShadow: '0 24px 60px -44px rgba(46,26,53,.5)' }}>
        {children}
      </div>
    </div></Shell>
  )

  const input: React.CSSProperties = { width: '100%', padding: '14px 16px', fontSize: 16, border: `1px solid ${C.border}`, borderRadius: 10, outline: 'none', color: C.ink, background: C.ivory }
  const btn: React.CSSProperties = { width: '100%', padding: '14px 16px', fontSize: 15.5, fontWeight: 700, color: C.plumDark, background: `linear-gradient(180deg,#E4C879,${C.gold} 60%,${C.goldDeep})`, border: 'none', borderRadius: 10, cursor: 'pointer', marginTop: 14 }
  const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: C.goldDeep, fontWeight: 700, marginBottom: 12, display: 'block' }

  if (screen === 'checking') return (
    <Shell><div style={{ textAlign: 'center', padding: '120px 24px', color: C.muted }}>Loading your plan…</div></Shell>
  )

  if (screen === 'login') return authCard(<>
    <span style={eyebrow}>Welcome back</span>
    <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, color: C.ink, lineHeight: 1.1, marginBottom: 10 }}>Sign in to your plan</h1>
    <p style={{ fontSize: 14.5, color: C.inkSoft, lineHeight: 1.6, marginBottom: 22 }}>Enter the email you used for the quiz and we will send you a 6-digit code. No password needed.</p>
    <input style={input} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendCode()} autoFocus />
    {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 10 }}>{error}</p>}
    <button style={btn} onClick={sendCode} disabled={busy}>{busy ? 'Sending…' : 'Email me a code'}</button>
  </>)

  if (screen === 'code') return authCard(<>
    <span style={eyebrow}>Check your email</span>
    <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, color: C.ink, lineHeight: 1.1, marginBottom: 10 }}>Enter your code</h1>
    {notice && <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, marginBottom: 8 }}>{notice}</p>}
    <div style={{ background: 'rgba(201,168,76,.1)', border: `1px solid ${C.goldLine}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#7a6a2f', marginBottom: 18, lineHeight: 1.5 }}>📬 The code is from <b>noreply@10kroadmap.org</b>. If it is not in your inbox, look in <b>spam</b> or <b>junk</b>.</div>
    <input style={{ ...input, textAlign: 'center', letterSpacing: 8, fontSize: 24, fontWeight: 700 }} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={e => e.key === 'Enter' && verify()} autoFocus />
    {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 10 }}>{error}</p>}
    <button style={btn} onClick={verify} disabled={busy}>{busy ? 'Verifying…' : 'Open my plan →'}</button>
    <p style={{ fontSize: 13, color: C.muted, marginTop: 16, textAlign: 'center' }}>
      <button onClick={() => { setScreen('login'); setOtp(''); setError('') }} style={{ background: 'none', border: 'none', color: C.green, cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>Use a different email</button>
    </p>
  </>)

  /* ── Ready: the board ── */
  const p = plan!
  const firstName = (p.name || '').split(' ')[0] || 'there'
  const totalTasks = p.days.reduce((n, d) => n + d.tasks.length, 0)
  const doneTasks = p.days.reduce((n, d) => n + d.tasks.filter(t => t.done).length, 0)
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <Shell>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
        <span style={eyebrow}>Your plan</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(30px,5vw,44px)', fontWeight: 600, color: C.ink, lineHeight: 1.05, marginBottom: 10 }}>
          Welcome back, <em style={{ fontStyle: 'italic', color: C.goldDeep }}>{firstName}.</em>
        </h1>
        <p style={{ fontSize: 16, color: C.inkSoft, lineHeight: 1.6, marginBottom: 8 }}>Your 7-Day Action Plan. One day unlocks each day. Small steps, real momentum.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '18px 0 30px' }}>
          <div style={{ flex: 1, height: 8, background: C.creamDeep, borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${totalTasks ? (doneTasks / totalTasks) * 100 : 0}%`, background: `linear-gradient(90deg,${C.green},${C.gold})`, transition: 'width .5s' }} />
          </div>
          <span style={{ fontSize: 13, color: C.muted, fontWeight: 600, whiteSpace: 'nowrap' }}>{doneTasks}/{totalTasks} done</span>
        </div>

        {p.days.map(d => {
          const isToday = d.day === p.unlockedDay
          return (
            <div key={d.day} style={{
              background: d.unlocked ? C.white : '#F4F0EA',
              border: `1px solid ${isToday ? C.goldLine : C.border}`,
              borderRadius: 14, padding: '20px 22px', marginBottom: 14,
              opacity: d.unlocked ? 1 : 0.7,
              boxShadow: isToday ? '0 16px 40px -30px rgba(201,168,76,.9)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: d.unlocked ? 12 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: d.unlocked ? C.plum : C.muted }}>Day {d.day}</span>
                  {d.title !== `Day ${d.day}` && <span style={{ fontSize: 14.5, color: C.inkSoft }}>· {d.title}</span>}
                  {isToday && <span style={{ fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: C.goldDeep, background: 'rgba(201,168,76,.14)', padding: '3px 9px', borderRadius: 20 }}>Today</span>}
                </div>
                {!d.unlocked && <span style={{ fontSize: 12.5, color: C.muted }}>🔒 Unlocks {fmtDate(d.unlockAt)}</span>}
              </div>
              {d.unlocked && d.tasks.map((t, i) => (
                <label key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0', cursor: 'pointer' }}>
                  <input type="checkbox" checked={t.done} onChange={e => toggle(d.day, i, e.target.checked)} style={{ marginTop: 3, width: 18, height: 18, accentColor: C.green, flexShrink: 0, cursor: 'pointer' }} />
                  <span style={{ fontSize: 15, lineHeight: 1.6, color: t.done ? C.muted : C.ink, textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
                </label>
              ))}
            </div>
          )
        })}

        <p style={{ fontSize: 13, color: C.muted, textAlign: 'center', marginTop: 26 }}>
          Your full report lives on your <a href="/quiz/results" style={{ color: C.green, textDecoration: 'underline' }}>results page</a>. Need help? support@10kroadmap.org
        </p>
      </div>
    </Shell>
  )
}
