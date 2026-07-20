'use client'
/* The one Workspace shell: single OTP login, single sidebar, single topbar,
   single design system. Every /admin module renders inside this. */
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_CSS, T } from './theme'
import CoachChat from './CoachChat'
import NotificationBell from './NotificationBell'
import CommandPalette from './CommandPalette'

interface NavItem { href: string; label: string; icon: string; match: (p: string) => boolean; flag?: string }
const NAV: Array<{ section?: string; items: NavItem[] }> = [
  { items: [
    { href: '/admin/executive', label: 'Command Center', icon: '◈', match: (p) => p.startsWith('/admin/executive') || p.startsWith('/admin/launch') },
    { href: '/admin/hq', label: 'Business HQ', icon: '◈', match: (p) => p.startsWith('/admin/hq') },
    { href: '/admin', label: 'Dashboard', icon: '◉', match: (p) => p === '/admin' },
    { href: '/admin/ai', label: 'Command AI', icon: '🤖', match: (p) => p === '/admin/ai' || p.startsWith('/admin/ai/'), flag: 'command_ai' },
    { href: '/admin/agents', label: 'Agent Platform', icon: '⚙︎', match: (p) => p.startsWith('/admin/agents'), flag: 'agent_platform' },
    { href: '/admin/automation', label: 'Automation', icon: '⚡', match: (p) => p.startsWith('/admin/automation'), flag: 'automation_studio' },
    { href: '/admin/memory', label: 'Business Memory', icon: '🧠', match: (p) => p.startsWith('/admin/memory'), flag: 'business_memory' },
  ] },
  { section: 'CRM', items: [
    { href: '/admin/crm', label: 'Contacts', icon: '⧉', match: (p) => p === '/admin/crm' || /^\/admin\/crm\/[0-9a-f-]{8,}/.test(p) },
    { href: '/admin/crm/pipeline', label: 'Pipeline', icon: '▤', match: (p) => p.startsWith('/admin/crm/pipeline') || p.startsWith('/admin/crm/opportunities') },
    { href: '/admin/crm/meetings', label: 'Meetings', icon: '◷', match: (p) => p.startsWith('/admin/crm/meetings') },
    { href: '/admin/crm/tasks', label: 'Tasks', icon: '✓', match: (p) => p.startsWith('/admin/crm/tasks') },
    { href: '/admin/crm/members', label: 'Members', icon: '👥', match: (p) => p.startsWith('/admin/crm/members') },
    { href: '/admin/crm/products', label: 'Products', icon: '📦', match: (p) => p.startsWith('/admin/crm/products') },
  ] },
  { section: 'Business', items: [
    { href: '/admin/communications', label: 'Communications', icon: '✉', match: (p) => p.startsWith('/admin/communications'), flag: 'communication_os' },
    { href: '/admin/inbox', label: 'Live Inbox', icon: '💬', match: (p) => p.startsWith('/admin/inbox') },
    { href: '/admin/revenue', label: 'Revenue', icon: '＄', match: (p) => p.startsWith('/admin/revenue') },
    { href: '/admin/events', label: 'Event Campaign', icon: '🎟', match: (p) => p.startsWith('/admin/events') },
    { href: '/admin/journeys', label: 'Journeys', icon: '🧭', match: (p) => p.startsWith('/admin/journeys'), flag: 'journey_engine' },
    { href: '/admin/analytics', label: 'Analytics', icon: '📈', match: (p) => p.startsWith('/admin/analytics') },
    { href: '/admin/cms', label: 'CMS', icon: '▦', match: (p) => p.startsWith('/admin/cms') },
    { href: '/admin/knowledge', label: 'Knowledge', icon: '📚', match: (p) => p.startsWith('/admin/knowledge') },
  ] },
  { section: 'Platform', items: [
    { href: '/admin/platform', label: 'Platform Control', icon: '⚙', match: (p) => p.startsWith('/admin/platform') },
    { href: '/admin/integrations', label: 'Integrations', icon: '🔌', match: (p) => p.startsWith('/admin/integrations') },
    { href: '/admin/costs', label: 'Costs', icon: '＄', match: (p) => p.startsWith('/admin/costs'), flag: 'cost_center' },
    { href: '/admin/system', label: 'System', icon: '❤', match: (p) => p.startsWith('/admin/system') },
    { href: '/admin/flags', label: 'Feature Flags', icon: '⚑', match: (p) => p.startsWith('/admin/flags') },
    { href: '/admin/settings', label: 'Settings', icon: '⚙', match: (p) => p.startsWith('/admin/settings') },
    { href: '/admin/legacy', label: 'Legacy tools', icon: '◲', match: (p) => p.startsWith('/admin/legacy') },
  ] },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/admin'
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [sideOpen, setSideOpen] = useState(false)
  const [flags, setFlags] = useState<string[] | null>(null)

  useEffect(() => {
    fetch('/api/admin/me').then((r) => setAuthed(r.ok)).catch(() => setAuthed(false)).finally(() => setReady(true))
  }, [])
  useEffect(() => { if (authed) fetch('/api/admin/flags?keys=1').then((r) => r.ok ? r.json() : null).then((d) => setFlags(d?.enabled || [])).catch(() => setFlags([])) }, [authed])
  useEffect(() => { setSideOpen(false) }, [pathname]) // close the mobile drawer on navigation
  // Hide nav for disabled feature flags (fail-open while flags are loading).
  const flagOn = (f?: string) => !f || flags == null || flags.includes(f)

  if (!ready) return <div style={{ minHeight: '100vh', background: T.ink }}><style>{ADMIN_CSS}</style></div>
  if (!authed) return <><style>{ADMIN_CSS}</style><LoginScreen onLogin={() => setAuthed(true)} /></>

  const logout = async () => {
    try { await fetch('/api/admin/logout', { method: 'POST' }) } catch {}
    setAuthed(false)
  }

  return (
    <div className="ws-layout">
      <style>{ADMIN_CSS}</style>
      {sideOpen && <div className="ws-side-overlay" onClick={() => setSideOpen(false)} />}
      <aside className={`ws-side${sideOpen ? ' open' : ''}`}>
        <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 19, fontWeight: 800, color: '#fff' }}>The<span style={{ color: T.green2 }}>5th</span></span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Workspace</span>
        </div>
        <nav style={{ marginTop: 8, flex: 1, overflowY: 'auto' }}>
          {NAV.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 6 }}>
              {group.section && <div style={{ padding: '12px 24px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{group.section}</div>}
              {group.items.filter((n) => flagOn(n.flag)).map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setSideOpen(false)} className={`ws-nav-item ${n.match(pathname) ? 'active' : ''}`}>
                  <span className="ws-nav-ico" style={{ fontSize: 15, textAlign: 'center' }}>{n.icon}</span>
                  {n.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <button onClick={logout} style={{ margin: 14, padding: '10px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Log out</button>
      </aside>

      <div className="ws-main">
        <header className="ws-topbar">
          <button className="ws-hamburger" aria-label="Open menu" onClick={() => setSideOpen(true)}><span /></button>
          <GlobalSearch />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CoachChat />
            <NotificationBell />
          </div>
        </header>
        <main className="ws-content">{children}</main>
        <CommandPalette />
      </div>
    </div>
  )
}

/* Global search — jumps to CRM search results. */
function GlobalSearch() {
  const [q, setQ] = useState('')
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) window.location.href = `/admin/crm?q=${encodeURIComponent(q.trim())}` }}
      style={{ flex: 1, maxWidth: 460 }}
    >
      <input
        value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search contacts, notes, tasks…"
        className="a-input" style={{ background: '#f6f7f6' }}
      />
    </form>
  )
}

/* ── OTP login (the single sign-in for the whole Workspace) ── */
function LoginScreen({ onLogin }: { onLogin: (email: string) => void }) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const sendCode = useCallback(async () => {
    setError(''); setBusy(true)
    try {
      const res = await fetch('/api/admin/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const d = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) { setError(d.error || 'Something went wrong.'); return }
      setStep('code')
    } catch { setError('Network error. Please try again.') } finally { setBusy(false) }
  }, [email])

  const verify = useCallback(async () => {
    setError(''); setBusy(true)
    try {
      const res = await fetch('/api/admin/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp }) })
      const d = (await res.json().catch(() => ({}))) as { success?: boolean; email?: string; error?: string }
      if (!res.ok || !d.success) { setError(d.error || 'Invalid code.'); return }
      onLogin(d.email || email)
    } catch { setError('Network error. Please try again.') } finally { setBusy(false) }
  }, [email, otp, onLogin])

  return (
    <div style={{ minHeight: '100vh', background: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="a-card" style={{ width: '100%', maxWidth: 380, padding: 34 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.ink, marginBottom: 4 }}>The<span style={{ color: T.green2 }}>5th</span> Workspace</div>
        <div style={{ fontSize: 14, color: T.sub, marginBottom: 22 }}>{step === 'email' ? 'Sign in to continue' : `Enter the code sent to ${email}`}</div>
        {step === 'email' ? (
          <input className="a-input" style={{ marginBottom: 14, padding: '14px 16px', fontSize: 16 }} type="email" placeholder="you@10kroadmap.org" value={email}
            onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendCode()} autoFocus />
        ) : (
          <input className="a-input" style={{ marginBottom: 14, padding: '14px 16px', fontSize: 18, letterSpacing: '.3em', textAlign: 'center' }} inputMode="numeric" placeholder="••••••" value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={(e) => e.key === 'Enter' && verify()} autoFocus />
        )}
        {error && <div style={{ color: T.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button className="admin-btn" disabled={busy || (step === 'email' ? !email : otp.length < 6)} onClick={step === 'email' ? sendCode : verify}>
          {busy ? 'Please wait…' : step === 'email' ? 'Send code' : 'Verify & enter'}
        </button>
        {step === 'code' && <button onClick={() => { setStep('email'); setOtp(''); setError('') }} style={{ marginTop: 12, background: 'none', border: 'none', color: T.sub, fontSize: 13, cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>← Use a different email</button>}
      </div>
    </div>
  )
}
