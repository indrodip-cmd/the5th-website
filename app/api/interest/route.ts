import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeName, sanitizeText } from '@/lib/validation'
import { verifyRecaptcha } from '@/lib/recaptcha'
import { saveInterestLead } from '@/lib/interest-leads'
import { ALLOWED, REVENUE_STAGES } from '@/app/interest/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Public endpoint for the Business Interest Registration form. Everything the
   client sends is re-validated here against the shared option vocabulary — a
   forged value is dropped, never stored. Rate-limited per IP; optional
   reCAPTCHA v3 when the client supplies a token. */

const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', '10minutemail.com',
  'yopmail.com', 'trashmail.com', 'sharklasers.com', 'maildrop.cc',
  'getnada.com', 'dispostable.com', 'fakeinbox.com', 'temp-mail.org',
])

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

/* Validate a single-select value against the allowed set for a field. */
function pick(field: string, value: unknown): string | null {
  if (typeof value !== 'string') return null
  return ALLOWED[field]?.has(value) ? value : null
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`interest:ip:${ip}`, 12, 600)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  const body = await req.json().catch(() => ({} as Record<string, unknown>))

  // Honeypot: a hidden field bots love to fill. Silently accept, never store.
  if (typeof body?.company_website === 'string' && body.company_website.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  if (body?.recaptchaToken) {
    const rc = await verifyRecaptcha(String(body.recaptchaToken), { action: 'interest', ip })
    if (!rc.ok) {
      return NextResponse.json({ error: 'Verification failed. Please reload and try again.' }, { status: 403 })
    }
  }

  // ── Contact ──
  const email = String(body?.email || '').trim().toLowerCase()
  const domain = email.split('@')[1]
  if (!isValidEmail(email) || !domain || DISPOSABLE.has(domain)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  const name = sanitizeName(body?.name)
  if (!name) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })

  const phoneRaw = sanitizeText(body?.phone, 40)
  if (!phoneRaw || phoneRaw.replace(/\D/g, '').length < 7) {
    return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 })
  }
  const country = sanitizeText(body?.country, 80)
  if (!country) return NextResponse.json({ error: 'Please select your country.' }, { status: 400 })

  // ── Qualification (validated against the shared vocabulary) ──
  const business_type = pick('business_type', body?.business_type)
  const business_stage = pick('business_stage', body?.business_stage)
  const primary_goal = pick('primary_goal', body?.primary_goal)
  if (!business_type || !business_stage || !primary_goal) {
    return NextResponse.json({ error: 'Please complete all steps.' }, { status: 400 })
  }

  // Niche: either an allowed value, or 'other' + free text.
  let niche = pick('niche', body?.niche)
  const nicheOther = sanitizeText(body?.niche_other, 120)
  if (!niche) return NextResponse.json({ error: 'Please choose a niche.' }, { status: 400 })
  if (niche === 'other' && nicheOther) niche = `other:${nicheOther}`

  // Conditional: revenue only when the stage implies an existing business.
  const monthly_revenue = REVENUE_STAGES.has(business_stage)
    ? pick('monthly_revenue', body?.monthly_revenue) : null

  // Conditional: AI sub-type only when building an AI business.
  const ai_business_type = business_type === 'ai'
    ? pick('ai_business_type', body?.ai_business_type) : null

  // Help needed: multi-select, at least one valid value.
  const help_needed = Array.isArray(body?.help_needed)
    ? Array.from(new Set(
        (body.help_needed as unknown[])
          .map((v) => pick('help_needed', v))
          .filter((v): v is string => !!v),
      ))
    : []
  if (help_needed.length === 0) {
    return NextResponse.json({ error: 'Please pick what you need help with.' }, { status: 400 })
  }

  // ── Attribution ──
  const utm: Record<string, string> = {}
  const utmIn = (body?.utm && typeof body.utm === 'object' ? body.utm : {}) as Record<string, unknown>
  for (const k of UTM_KEYS) {
    const v = sanitizeText(utmIn[k], 160)
    if (v) utm[k] = v
  }
  const landing_page = sanitizeText(body?.landing_page, 300) || null
  const referrer = sanitizeText(body?.referrer, 300) || null
  const visitor_id = sanitizeText(body?.visitor_id, 80) || null

  const answers = {
    business_type, niche, business_stage, monthly_revenue,
    ai_business_type, primary_goal, help_needed,
    niche_other: niche.startsWith('other:') ? nicheOther : null,
  }

  try {
    const res = await saveInterestLead({
      name, email, phone: phoneRaw, country,
      business_type, niche, business_stage, monthly_revenue, primary_goal,
      help_needed, ai_business_type,
      utm, landing_page, referrer, visitor_id, answers,
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Could not save your answers. Please try again.' }, { status: 400 })
    }
    return NextResponse.json({ ok: true, name })
  } catch (e) {
    console.error('interest submit failed', e)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
