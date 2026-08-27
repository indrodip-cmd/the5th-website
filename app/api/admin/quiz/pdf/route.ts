import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { buildPremiumReport, fetchLogo, pdfViaApiTemplate } from '@/app/api/generate-pdf/route'

export const dynamic = 'force-dynamic'
export const maxDuration = 90

/* Admin-only: generate (and download) any lead's full Business Blueprint PDF
   from /admin/quiz. If the lead has no full report cached yet, we generate one
   on demand via /api/generate-roadmap (admin bypass), then render the PDF. */

const STAGE_MAP: Record<string, string> = {
  starting: 'The Pioneer', idea: 'The Pioneer', launched: 'The Pathfinder',
  scaling: 'The Builder', established: 'The Luminary',
}
const PERSONALITY_LABELS: Record<string, string> = {
  action: 'The Driver', connection: 'The Flow Worker', ideas: 'The Deep Thinker', meaning: 'The Gentle Builder',
}

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const email = (new URL(req.url).searchParams.get('email') || '').trim().toLowerCase()
  if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { data: lead } = await supabase
    .from('quiz_leads')
    .select('name, email, answers, roadmap')
    .eq('email', email)
    .maybeSingle()
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  const answers = (lead.answers as Record<string, string> | null) || {}
  const name = (lead.name as string) || email
  let roadmap = typeof lead.roadmap === 'string' ? lead.roadmap : (lead.roadmap ? String(lead.roadmap) : '')

  // Generate + cache the full report on the fly if this lead doesn't have one.
  if (!roadmap || roadmap.length < 200) {
    try {
      const origin = new URL(req.url).origin
      const gr = await fetch(`${origin}/api/generate-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie: req.headers.get('cookie') || '' },
        body: JSON.stringify({ email, name, answers }),
      })
      const gj = await gr.json().catch(() => ({}))
      roadmap = typeof gj?.roadmap === 'string' ? gj.roadmap : ''
    } catch (e) {
      console.error('admin pdf: report generation failed', e)
    }
  }
  if (!roadmap || roadmap.length < 200) {
    return NextResponse.json({ error: 'Could not build a full report for this lead (missing answers or AI unavailable).' }, { status: 422 })
  }

  // Render the same premium PDF customers receive.
  const logo = await fetchLogo()
  const html = buildPremiumReport(roadmap, {
    name,
    firstName: name.split(' ')[0],
    archetypeLabel: STAGE_MAP[answers.q1] || 'The Pioneer',
    personalityLabel: PERSONALITY_LABELS[answers.q2] || 'The Driver',
    goal: answers.q18 || '$5K-$10K / month',
    stage: answers.q1 || 'launched',
    dateStr: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    logo,
  })

  const b64 = await pdfViaApiTemplate(html)
  if (!b64) {
    return NextResponse.json({ error: 'PDF service is not configured (set APITEMPLATE_API_KEY).' }, { status: 502 })
  }

  const filename = `${name} Business Blueprint.pdf`.replace(/[^a-zA-Z0-9 ._-]/g, '')
  return new NextResponse(Buffer.from(b64, 'base64'), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
