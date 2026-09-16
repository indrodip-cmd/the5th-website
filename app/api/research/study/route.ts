import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { limit, clientIp } from '@/lib/rateLimit'

/* The5th Original Research, data collection endpoint for the
   "Critical Thinking x AI Reliance" study. Scores the reasoning test
   server-side (so the client cannot inflate it) and stores one anonymous
   response per submission. Reads/writes go through the service role; the table
   has RLS on with no public policies, so the anon key cannot touch it. */

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Cognitive Reflection Test (Frederick, 2005) answer key. 'c' = correct,
// 'l' = the intuitive-but-wrong lure. Everything else counts as neither.
const CRT_KEY: Record<string, { correct: string; lure: string }> = {
  q1: { correct: 'c', lure: 'l' }, // bat & ball: 5 cents (lure: 10 cents)
  q2: { correct: 'c', lure: 'l' }, // widgets: 5 minutes (lure: 100)
  q3: { correct: 'c', lure: 'l' }, // lily pads: 47 days (lure: 24)
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`research-study:ip:${ip}`, 8, 3600)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many submissions. Please try later.' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
  }

  try {
    const body = await req.json()
    if (!body?.consent) {
      return NextResponse.json({ error: 'Consent is required to take part.' }, { status: 400 })
    }

    // Score the reasoning test server-side.
    const crt = (body.crt && typeof body.crt === 'object') ? body.crt as Record<string, string> : {}
    let crtScore = 0, crtLure = 0
    const crtTotal = Object.keys(CRT_KEY).length
    for (const [q, key] of Object.entries(CRT_KEY)) {
      if (crt[q] === key.correct) crtScore++
      else if (crt[q] === key.lure) crtLure++
    }

    // Reliance: four Likert items (1..5), higher = leans on AI / offloads more.
    const reliance = (body.reliance && typeof body.reliance === 'object') ? body.reliance as Record<string, number> : {}
    const relVals = Object.values(reliance).map(Number).filter((n) => n >= 1 && n <= 5)
    const relianceScore = relVals.length ? (relVals.reduce((a, b) => a + b, 0) / relVals.length - 1) / 4 : null

    const confidence = Number.isFinite(Number(body.confidence)) ? Math.max(0, Math.min(100, Math.round(Number(body.confidence)))) : null

    const row = {
      study: 'critical-thinking-ai',
      age_band: typeof body.age_band === 'string' ? body.age_band.slice(0, 40) : null,
      gender: typeof body.gender === 'string' ? body.gender.slice(0, 40) : null,
      country: typeof body.country === 'string' ? body.country.slice(0, 60) : null,
      ai_use: typeof body.ai_use === 'string' ? body.ai_use.slice(0, 40) : null,
      reliance,
      reliance_score: relianceScore,
      crt_answers: crt,
      crt_score: crtScore,
      crt_total: crtTotal,
      crt_lure: crtLure,
      confidence,
      self_ct: (body.self_ct && typeof body.self_ct === 'object') ? body.self_ct : null,
      consent: true,
      meta: {
        ua: (req.headers.get('user-agent') || '').slice(0, 300),
        ref: (req.headers.get('referer') || '').slice(0, 300),
        ts: new Date().toISOString(),
      },
    }

    const supabase = getSupabase()
    const { error } = await supabase.from('research_study_responses').insert(row)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Give the participant honest, immediate feedback about their own result.
    return NextResponse.json({
      ok: true,
      crtScore,
      crtTotal,
      crtLure,
      confidence,
      accuracyPct: Math.round((crtScore / crtTotal) * 100),
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
