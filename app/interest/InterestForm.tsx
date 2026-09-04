'use client'
/* Progressive, conversational interest-registration form.

   One question per screen, dynamic step list (conditional revenue + AI steps),
   back/continue, keyboard advance, per-step analytics, and a clean success
   state. All submitted values are re-validated server-side (/api/interest). */
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  C, BUSINESS_TYPES, NICHES, BUSINESS_STAGES, MONTHLY_REVENUE, AI_BUSINESS_TYPES,
  PRIMARY_GOALS, HELP_NEEDED, REVENUE_STAGES,
} from './config'
import { COUNTRIES } from './countries'
import {
  OptionCard, Field, Btn, ProgressIndicator, Footer, Wordmark,
  useAttribution, useVisitorId, FONT, SANS,
} from './ui'
import { track } from './track'
import { getRecaptchaToken } from '@/lib/recaptcha-client'

type StepId =
  | 'business_type' | 'ai_business_type' | 'niche' | 'business_stage'
  | 'monthly_revenue' | 'primary_goal' | 'help_needed' | 'contact'

interface Answers {
  business_type: string
  ai_business_type: string
  niche: string
  niche_other: string
  business_stage: string
  monthly_revenue: string
  primary_goal: string
  help_needed: string[]
  name: string
  email: string
  phone: string
  country: string
}

const EMPTY: Answers = {
  business_type: '', ai_business_type: '', niche: '', niche_other: '',
  business_stage: '', monthly_revenue: '', primary_goal: '', help_needed: [],
  name: '', email: '', phone: '', country: '',
}

const SINGLE: Record<string, { title: string; sub?: string; options: { value: string; label: string }[] }> = {
  business_type: { title: 'What would you like to build?', options: BUSINESS_TYPES },
  ai_business_type: { title: 'What type of AI business interests you?', options: AI_BUSINESS_TYPES },
  niche: { title: 'What niche are you drawn to?', sub: 'Pick the closest — you can refine it later.', options: NICHES },
  business_stage: { title: 'Where are you right now?', options: BUSINESS_STAGES },
  monthly_revenue: { title: 'What does the business make per month today?', options: MONTHLY_REVENUE },
  primary_goal: { title: 'What is your biggest goal right now?', options: PRIMARY_GOALS },
}

export default function InterestForm() {
  const [started, setStarted] = useState(false)
  const [idx, setIdx] = useState(0)
  const [a, setA] = useState<Answers>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const attr = useAttribution()
  const visitorId = useVisitorId()
  const doneRef = useRef(false)

  // Build the visible step list from current answers (conditional logic).
  const steps = useMemo<StepId[]>(() => {
    const s: StepId[] = ['business_type']
    if (a.business_type === 'ai') s.push('ai_business_type')
    s.push('niche', 'business_stage')
    if (REVENUE_STAGES.has(a.business_stage)) s.push('monthly_revenue')
    s.push('primary_goal', 'help_needed', 'contact')
    return s
  }, [a.business_type, a.business_stage])

  const total = steps.length
  const stepId = steps[Math.min(idx, total - 1)]

  // Page view once.
  useEffect(() => { track('interest_page_view') }, [])

  // Abandonment beacon: fired if the visitor leaves mid-form without submitting.
  useEffect(() => {
    const onLeave = () => {
      if (started && !doneRef.current) {
        track('interest_form_abandoned', { step: idx + 1, step_id: stepId })
      }
    }
    window.addEventListener('pagehide', onLeave)
    return () => window.removeEventListener('pagehide', onLeave)
  }, [started, idx, stepId])

  const set = (patch: Partial<Answers>) => setA((prev) => ({ ...prev, ...patch }))

  const begin = () => { setStarted(true); track('interest_form_started') }

  const canContinue = (): boolean => {
    switch (stepId) {
      case 'business_type': return !!a.business_type
      case 'ai_business_type': return !!a.ai_business_type
      case 'niche': return a.niche === 'other' ? !!a.niche_other.trim() : !!a.niche
      case 'business_stage': return !!a.business_stage
      case 'monthly_revenue': return !!a.monthly_revenue
      case 'primary_goal': return !!a.primary_goal
      case 'help_needed': return a.help_needed.length > 0
      case 'contact': return true // validated on submit
      default: return false
    }
  }

  const next = () => {
    if (!canContinue()) return
    const value = stepId === 'help_needed' ? a.help_needed : (a as unknown as Record<string, unknown>)[stepId]
    track('interest_step_completed', { step: idx + 1, step_id: stepId, value })
    if (idx < total - 1) setIdx(idx + 1)
  }

  const back = () => {
    setFormError(null)
    if (idx === 0) { setStarted(false); return }
    setIdx(idx - 1)
  }

  const toggleHelp = (value: string) => {
    set({ help_needed: a.help_needed.includes(value)
      ? a.help_needed.filter((v) => v !== value)
      : [...a.help_needed, value] })
  }

  function validateContact(): boolean {
    const e: Partial<Record<string, string>> = {}
    if (!a.name.trim()) e.name = 'Please enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.email.trim())) e.email = 'Enter a valid email address.'
    if (a.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone number.'
    if (!a.country) e.country = 'Select your country.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit() {
    if (!validateContact()) return
    setSubmitting(true)
    setFormError(null)
    const dial = COUNTRIES.find((c) => c.code === a.country)?.dial || ''
    const phone = a.phone.trim().startsWith('+') ? a.phone.trim() : `${dial} ${a.phone.trim()}`.trim()
    const countryName = COUNTRIES.find((c) => c.code === a.country)?.name || a.country

    let recaptchaToken: string | null = null
    try { recaptchaToken = await getRecaptchaToken('interest') } catch { /* noop */ }

    try {
      const res = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: a.name, email: a.email, phone, country: countryName,
          business_type: a.business_type,
          ai_business_type: a.business_type === 'ai' ? a.ai_business_type : null,
          niche: a.niche, niche_other: a.niche === 'other' ? a.niche_other : '',
          business_stage: a.business_stage,
          monthly_revenue: REVENUE_STAGES.has(a.business_stage) ? a.monthly_revenue : null,
          primary_goal: a.primary_goal,
          help_needed: a.help_needed,
          utm: attr.utm, landing_page: attr.landing_page, referrer: attr.referrer,
          visitor_id: visitorId, recaptchaToken,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFormError(data?.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }
      doneRef.current = true
      setSubmittedName(data?.name || a.name.split(' ')[0] || '')
      setSubmitted(true)
      track('interest_form_submitted', {
        business_type: a.business_type, business_stage: a.business_stage,
        primary_goal: a.primary_goal, help_needed: a.help_needed,
      })
    } catch {
      setFormError('Network error. Please check your connection and try again.')
      setSubmitting(false)
    }
  }

  // ── Success state ──
  if (submitted) return <Success name={submittedName} />

  // ── Hero / intro ──
  if (!started) return <Hero onStart={begin} />

  // ── Form shell ──
  return (
    <div style={{ minHeight: '100dvh', width: '100%', background: C.cream, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', padding: '26px 20px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <ProgressIndicator current={idx + 1} total={total} />

        <div style={{ flex: 1 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stepId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              {stepId in SINGLE && (
                <SingleStep
                  cfg={SINGLE[stepId]}
                  value={(a as unknown as Record<string, string>)[stepId]}
                  onSelect={(v) => set({ [stepId]: v } as Partial<Answers>)}
                  extra={stepId === 'niche' && a.niche === 'other' ? (
                    <div style={{ marginTop: 16 }}>
                      <Field id="niche_other" label="Tell us what you have in mind"
                        value={a.niche_other} onChange={(v) => set({ niche_other: v })}
                        placeholder="e.g. Executive coaching for founders" />
                    </div>
                  ) : null}
                />
              )}

              {stepId === 'help_needed' && (
                <MultiStep
                  value={a.help_needed}
                  onToggle={toggleHelp}
                />
              )}

              {stepId === 'contact' && (
                <ContactStep a={a} set={set} errors={errors} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {formError && (
          <p role="alert" style={{ color: '#C0392B', fontSize: 14, marginTop: 16, fontFamily: SANS }}>{formError}</p>
        )}
      </div>

      {/* Sticky action bar (comfortable on mobile, respects the home indicator). */}
      <div style={{
        position: 'sticky', bottom: 0, background: `linear-gradient(to top, ${C.cream} 74%, rgba(251,248,242,0))`,
        padding: '16px 20px calc(20px + env(safe-area-inset-bottom))', borderTop: `1px solid ${C.line}`,
        backdropFilter: 'blur(2px)',
      }}>
        <div style={{
          maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12,
        }}>
          <Btn variant="ghost" onClick={back}>← Back</Btn>
          {stepId === 'contact' ? (
            <Btn onClick={submit} disabled={submitting}>
              {submitting ? 'Sending…' : 'Submit →'}
            </Btn>
          ) : (
            <Btn onClick={next} disabled={!canContinue()}>Continue →</Btn>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Sub-views ─────────────────────────────────────────────────────────── */

function TopBar() {
  return (
    <div style={{ marginBottom: 26, display: 'flex', alignItems: 'center', gap: 10 }}>
      <Wordmark size={20} />
      <span aria-hidden style={{ width: 1, height: 15, background: C.line }} />
      <span style={{ fontSize: 10.5, letterSpacing: 2.4, color: C.inkSoft, fontWeight: 700, fontFamily: SANS }}>
        CONSULTING
      </span>
    </div>
  )
}

function SingleStep({
  cfg, value, onSelect, extra,
}: {
  cfg: { title: string; sub?: string; options: { value: string; label: string }[] }
  value: string; onSelect: (v: string) => void; extra?: React.ReactNode
}) {
  return (
    <div role="radiogroup" aria-label={cfg.title}>
      <h2 style={{ fontFamily: FONT, fontWeight: 400, fontSize: 'clamp(24px,5vw,32px)', color: C.ink, lineHeight: 1.2, marginBottom: cfg.sub ? 8 : 20 }}>
        {cfg.title}
      </h2>
      {cfg.sub && <p style={{ fontFamily: SANS, fontSize: 15, color: C.inkSoft, marginBottom: 20 }}>{cfg.sub}</p>}
      <div style={{ display: 'grid', gap: 10 }}>
        {cfg.options.map((o) => (
          <OptionCard
            key={o.value} label={o.label} selected={value === o.value}
            onSelect={() => onSelect(o.value)}
          />
        ))}
      </div>
      {extra}
    </div>
  )
}

function MultiStep({ value, onToggle }: { value: string[]; onToggle: (v: string) => void }) {
  return (
    <div role="group" aria-label="What do you need the most help with?">
      <h2 style={{ fontFamily: FONT, fontWeight: 400, fontSize: 'clamp(24px,5vw,32px)', color: C.ink, lineHeight: 1.2, marginBottom: 8 }}>
        What do you need the most help with?
      </h2>
      <p style={{ fontFamily: SANS, fontSize: 15, color: C.inkSoft, marginBottom: 20 }}>Select all that apply.</p>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr' }}>
        {HELP_NEEDED.map((o) => (
          <OptionCard
            key={o.value} label={o.label} multi selected={value.includes(o.value)}
            onSelect={() => onToggle(o.value)}
          />
        ))}
      </div>
    </div>
  )
}

function ContactStep({
  a, set, errors,
}: {
  a: Answers; set: (p: Partial<Answers>) => void; errors: Partial<Record<string, string>>
}) {
  const dial = COUNTRIES.find((c) => c.code === a.country)?.dial
  return (
    <div>
      <h2 style={{ fontFamily: FONT, fontWeight: 400, fontSize: 'clamp(24px,5vw,32px)', color: C.ink, lineHeight: 1.2, marginBottom: 8 }}>
        Where should we reach you?
      </h2>
      <p style={{ fontFamily: SANS, fontSize: 15, color: C.inkSoft, marginBottom: 24 }}>
        We only use this to follow up on what you&apos;re building.
      </p>

      <Field id="name" label="Full name" value={a.name} onChange={(v) => set({ name: v })}
        error={errors.name} autoComplete="name" placeholder="Jordan Rivera" />

      <Field id="email" label="Email" type="email" inputMode="email" value={a.email}
        onChange={(v) => set({ email: v })} error={errors.email} autoComplete="email" placeholder="you@email.com" />

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="country" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 6, fontFamily: SANS }}>
          Country
        </label>
        <select
          id="country" value={a.country} onChange={(e) => set({ country: e.target.value })}
          aria-invalid={!!errors.country}
          style={{
            width: '100%', padding: '13px 14px', fontSize: 16, fontFamily: SANS,
            color: a.country ? C.ink : C.inkSoft, background: C.white,
            border: `1px solid ${errors.country ? '#C0392B' : C.line}`, borderRadius: 10, outline: 'none',
          }}
        >
          <option value="">Select your country</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}{c.dial !== '+' ? ` (${c.dial})` : ''}</option>
          ))}
        </select>
        {errors.country && <p role="alert" style={{ color: '#C0392B', fontSize: 13, marginTop: 6, fontFamily: SANS }}>{errors.country}</p>}
      </div>

      <Field id="phone" label="Phone / WhatsApp" type="tel" inputMode="tel" value={a.phone}
        onChange={(v) => set({ phone: v })} error={errors.phone} autoComplete="tel"
        placeholder="Mobile number" prefix={dial && dial !== '+' ? dial : undefined} />

      {/* Honeypot — hidden from humans, tempting to bots. */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off"
        aria-hidden style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        onChange={() => { /* real users never touch this */ }} />

      <p style={{ fontSize: 12.5, color: C.inkSoft, fontFamily: SANS, marginTop: 8, lineHeight: 1.5 }}>
        By submitting, you agree we may contact you about your answers. No spam.
      </p>
    </div>
  )
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ minHeight: '100dvh', width: '100%', background: C.cream, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      {/* Slim brand bar */}
      <div style={{ width: '100%', padding: '20px 22px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Wordmark size={22} />
          <span aria-hidden style={{ width: 1, height: 16, background: C.line }} />
          <span style={{ fontSize: 10.5, letterSpacing: 2.4, color: C.inkSoft, fontWeight: 700, fontFamily: SANS }}>CONSULTING</span>
        </div>
      </div>

      <div style={{
        flex: 1, width: '100%', maxWidth: 760, margin: '0 auto', padding: '10px 22px 52px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 640 }}>
          <span style={{
            display: 'inline-block', fontSize: 'clamp(10px,2.8vw,11.5px)', letterSpacing: 2.2, fontWeight: 700, fontFamily: SANS,
            color: '#8A6D1F', background: 'rgba(201,168,76,0.14)', border: '1px solid rgba(201,168,76,0.32)',
            padding: '7px 13px', borderRadius: 999, marginBottom: 22, maxWidth: '100%',
          }}>
            FOR COACHES · CONSULTANTS · EXPERTS
          </span>
          <h1 style={{
            fontFamily: FONT, fontWeight: 400, color: C.ink,
            fontSize: 'clamp(31px,7vw,56px)', lineHeight: 1.08, margin: '0 0 20px', letterSpacing: '-0.015em',
            maxWidth: '100%', overflowWrap: 'break-word',
          }}>
            The end-to-end platform to build your coaching business.
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(15.5px,2.4vw,19px)', color: C.inkSoft, lineHeight: 1.62, maxWidth: 540, marginBottom: 34 }}>
            Positioning, offers, funnels, content and automation — in one place. Tell us what
            you&apos;re building, and we&apos;ll map where you are and how we can help.
          </p>
          <Btn onClick={onStart} size="lg">Tell us about your business →</Btn>
          <p style={{ fontFamily: SANS, fontSize: 13, color: C.inkSoft, marginTop: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: C.gold }} />
            Takes under 60 seconds · No obligation
          </p>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}

function Success({ name }: { name: string }) {
  return (
    <div style={{ minHeight: '100dvh', width: '100%', background: C.cream, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ maxWidth: 560, textAlign: 'center' }}
        >
          <div style={{
            width: 66, height: 66, borderRadius: 999, background: C.plum, margin: '0 auto 30px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 8px rgba(201,168,76,0.14), 0 14px 34px rgba(46,26,53,0.28)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5 10 17.5 19.5 7" stroke={C.goldLight} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ fontFamily: FONT, fontWeight: 400, fontSize: 'clamp(30px,6.5vw,46px)', color: C.ink, lineHeight: 1.12, marginBottom: 18, letterSpacing: '-0.01em' }}>
            You&apos;re on our radar.
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 17, color: C.inkSoft, lineHeight: 1.62 }}>
            {name ? `Thanks, ${name}. ` : 'Thanks. '}
            We&apos;ve received your answers and we&apos;ll review what you&apos;re building.
            If the next step calls for a conversation, we&apos;ll reach out with the right one.
          </p>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
