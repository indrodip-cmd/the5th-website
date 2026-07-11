import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { searchContacts, resolveContact } from '@/lib/crm'
import { computeJourney, journeyTimeline, liveVisitors } from '@/lib/journey/intent'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* GET ?view=live | search&q= | explorer&contact_id= (or &email=) */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sp = new URL(req.url).searchParams
  const view = sp.get('view') || 'live'
  if (view === 'live') return NextResponse.json({ visitors: await liveVisitors() })
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
