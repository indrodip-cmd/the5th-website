import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { WB_EMAILS, WB_BY_KEY, sendWorkbookEmail } from '@/lib/workbook-campaign'
import { getBookedEmails } from '@/lib/calcom'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* Admin-only manual sends for the workbook nurture.
   - action:'preview' → send all 8 emails to the admin (or ?to) for proofing.
     NOT logged and NOT suppressed, so it never marks a real buyer as sent.
   - action:'send' with key:'next' → send the next due email to a buyer (logged).
   - action:'send' with key:'wb_*' → resend that specific email to a buyer.
   These work regardless of WORKBOOK_CAMPAIGN_LIVE (deliberate manual action). */
export async function POST(req: NextRequest) {
  const admin = adminEmail(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const action = String(body?.action || 'send')
  const db = getSupabaseAdmin()

  if (action === 'preview') {
    const to = typeof body?.to === 'string' && body.to.includes('@') ? String(body.to).trim().toLowerCase() : String(admin).toLowerCase()
    let sent = 0
    const errors: string[] = []
    for (const def of WB_EMAILS) {
      const r = await sendWorkbookEmail(to, def.key, { name: 'there', quizTaken: false, callBooked: false }, { log: false, skipSuppress: true })
      if (r.ok) sent++
      else errors.push(`${def.key}: ${r.error}`)
    }
    return NextResponse.json({ ok: errors.length === 0, sent, to, errors })
  }

  const email = String(body?.email || '').trim().toLowerCase()
  if (!email.includes('@')) return NextResponse.json({ error: 'email required' }, { status: 400 })
  const { data: buyer } = await db.from('workbook_buyers').select('email,name,purchased_at').eq('email', email).maybeSingle()
  if (!buyer) return NextResponse.json({ error: 'not a buyer' }, { status: 404 })

  const [{ data: quiz }, booked] = await Promise.all([
    db.from('quiz_leads').select('email').eq('email', email).maybeSingle(),
    getBookedEmails(),
  ])
  const ctx = { name: buyer.name || undefined, quizTaken: !!quiz, callBooked: booked.has(email) }

  let key = String(body?.key || '')
  if (key === 'next') {
    const { data: logs } = await db.from('event_email_log').select('email_key').eq('email', email).like('email_key', 'wb_%')
    const sent = new Set((logs || []).map((l) => String(l.email_key)))
    const daysSince = Math.floor((Date.now() - new Date(buyer.purchased_at || Date.now()).getTime()) / 86400000)
    const nextDef = WB_EMAILS.find((e) => e.day <= daysSince && !sent.has(e.key)) || WB_EMAILS.find((e) => !sent.has(e.key))
    if (!nextDef) return NextResponse.json({ ok: true, done: true, message: 'All emails already sent.' })
    key = nextDef.key
  }
  if (!WB_BY_KEY[key]) return NextResponse.json({ error: 'unknown key' }, { status: 400 })

  const r = await sendWorkbookEmail(email, key, ctx, { log: true, skipSuppress: false })
  return NextResponse.json({ ok: r.ok, key, subject: WB_BY_KEY[key].subject, error: r.error })
}
