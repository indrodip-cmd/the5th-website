'use client'
/* Step 1 — Your Details. Saves/updates the lead in Supabase (via the reserve
   API → vsl_leads + CRM), carries name/email forward, then advances to Payment.
   Qualification answers (if the visitor came through /qualify) ride along. */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { APPLY, T } from '../config'
import { Fonts, Header, Btn, Reveal, Stepper, useUtm, loadQualAnswers, getAuditId } from '../ui'
import { track } from '../track'

const inp: React.CSSProperties = { width: '100%', background: '#fff', border: `1px solid ${T.line}`, borderRadius: 12, color: T.text, fontSize: 15.5, padding: '14px 15px', fontFamily: T.sans }

export default function Apply() {
  const router = useRouter()
  const utm = useUtm()
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('')
    const email = form.email.trim().toLowerCase()
    if (form.name.trim().length < 2) { setErr('Please enter your name.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('Please enter a valid email you can access.'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/10k-roadmap/reserve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email, phone: form.phone.trim() || null, qualification: loadQualAnswers(), utm, audit_id: getAuditId() }),
      })
      if (!res.ok) throw new Error()
      try { sessionStorage.setItem('audit_email', email); sessionStorage.setItem('audit_name', form.name.trim()) } catch { /* noop */ }
      track('checkout_started')
      router.push(`/10k-roadmap/pay?email=${encodeURIComponent(email)}`)
    } catch {
      setErr('We couldn’t save that. Your details are safe — please try again.')
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans }}>
      <Fonts />
      <Header />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(26px,5vw,48px) 22px 80px' }}>
        <Stepper current={0} />
        <Reveal style={{ textAlign: 'center' }}>
          <div className="rm-eyebrow" style={{ marginBottom: 12 }}>{APPLY.eyebrow}</div>
          <h1 className="rm-serif" style={{ fontSize: 'clamp(28px,4.4vw,40px)', margin: '0 0 10px', fontWeight: 700 }}>{APPLY.headline}</h1>
          <p style={{ color: T.text2, fontSize: 16, lineHeight: 1.55, maxWidth: 480, margin: '0 auto 26px' }}>{APPLY.sub}</p>
        </Reveal>
        <Reveal delay={80}>
          <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 420, margin: '0 auto' }}>
            <input className="rm-focus" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" style={inp} />
            <input className="rm-focus" placeholder="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" style={inp} />
            <input className="rm-focus" placeholder="Phone (with country code) — optional" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" style={inp} />
            {err && <p role="alert" style={{ color: T.danger, fontSize: 13, margin: 0 }}>{err}</p>}
            <Btn type="submit" full disabled={busy}>{busy ? 'Saving…' : APPLY.cta}</Btn>
            <p style={{ textAlign: 'center', color: T.text3, fontSize: 12, margin: 0 }}>{APPLY.micro}</p>
          </form>
        </Reveal>
      </main>
    </div>
  )
}
