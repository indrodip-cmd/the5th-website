import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { searchContacts, resolveContact } from '@/lib/crm'
import { computeJourney, journeyTimeline, liveVisitors } from '@/lib/journey/intent'
import { topRecommendations, decideRecommendation, refreshRecommendations, intelligenceDashboard } from '@/lib/journey/decisions'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* GET ?view=live | search&q= | explorer&contact_id= | intelligence | recommendations */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sp = new URL(req.url).searchParams
  const view = sp.get('view') || 'live'
  if (view === 'live') return NextResponse.json({ visitors: await liveVisitors() })
  if (view === 'intelligence') return NextResponse.json({ dashboard: await intelligenceDashboard(), recommendations: await topRecommendations('open', 30) })
  if (view === 'recommendations') return NextResponse.json({ recommendations: await topRecommendations(sp.get('status') || 'open', 50) })
  if (view === 'search') return NextResponse.json({ results: await searchContacts(sp.get('q') || '', 12) })
  if (view === 'explorer') {
    let id = sp.get('contact_id')
    if (!id && sp.get('email')) { const c = await resolveContact({ email: sp.get('email') }); id = (c?.id as string) || null }
    if (!id) return NextResponse.json({ error: 'contact required' }, { status: 400 })
    const [journey, timeline] = await Promise.all([computeJourney(id), journeyTimeline(id)])
    return NextResponse.json({ journey, timeline })
  }
  return NextResponse.json({ error: 'unknown view' }, { status: 400 })
}

/* POST { action: decide | refresh } */
export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  if (b?.action === 'decide') { await decideRecommendation(String(b?.id), String(b?.status || 'done'), actor); return NextResponse.json({ ok: true }) }
  if (b?.action === 'refresh') return NextResponse.json({ ok: true, ...(await refreshRecommendations(50)) })
  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
