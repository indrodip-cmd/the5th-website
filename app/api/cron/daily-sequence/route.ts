import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE_URL = 'https://quiz.the5th.consulting'

/* Pull cal.com bookings once per run and return the set of attendee emails
   that have a live (non-cancelled) booking. Fails open (empty set) so a
   cal.com outage never blocks the sequence. */
async function fetchBookedEmails(): Promise<Set<string>> {
  const set = new Set<string>()
  const key = process.env.CAL_COM || process.env.CAL_COM_API_KEY || process.env.CALCOM_API_KEY
  if (!key) return set
  try {
    const r = await fetch(`https://api.cal.com/v1/bookings?apiKey=${encodeURIComponent(key)}`, { cache: 'no-store' })
    if (!r.ok) return set
    const j = await r.json()
    for (const b of (j.bookings || [])) {
      const status = String(b?.status || '').toLowerCase()
      if (status === 'cancelled' || status === 'rejected') continue
      for (const a of (b?.attendees || [])) {
        if (a?.email) set.add(String(a.email).trim().toLowerCase())
      }
    }
  } catch (e) {
    console.error('cal.com bookings fetch failed', e)
  }
  return set
}

export async function GET(req: NextRequest) {
  const supabase = getSupabase()
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const results = { sent: 0, skipped: 0, errors: 0 }

    // Get all leads who are in an active sequence
    const { data: leads, error } = await supabase
      .from('quiz_leads')
      .select('*')
      .not('sequence_assigned', 'is', null)
      .eq('call_booked', false)

    if (error) throw error
    if (!leads || leads.length === 0) {
      return NextResponse.json({ message: 'No active leads', results })
    }

    // Who has already booked a call on cal.com? Stop coaching-emails' call CTA for them.
    const bookedEmails = await fetchBookedEmails()

    for (const lead of leads) {
      try {
        const leadEmail = (lead.email || '').trim().toLowerCase()
        // If they've booked, mark them so the sequence stops (and never resumes the push).
        if (leadEmail && bookedEmails.has(leadEmail)) {
          await supabase.from('quiz_leads').update({ call_booked: true }).eq('id', lead.id)
          results.skipped++
          continue
        }
        // Calculate which day of sequence this lead is on
        const createdAt = new Date(lead.created_at)
        const daysSinceCreated = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Days 0-7 only
        if (daysSinceCreated < 0 || daysSinceCreated > 7) {
          results.skipped++
          continue
        }

        const sequence = lead.sequence_assigned // 'A' or 'B'
        const day = daysSinceCreated

        // Send the sequence email for this day
        const res = await fetch(`${BASE_URL}/api/send-sequence-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: lead.email,
            name: lead.name || 'there',
            day,
            sequence,
            video_slug: lead.video_assigned || 'v1',
          })
        })

        if (res.ok) {
          results.sent++
          // Update last_email_day in Supabase
          await supabase
            .from('quiz_leads')
            .update({ last_email_day: day })
            .eq('id', lead.id)
        } else {
          results.errors++
        }
      } catch (leadErr) {
        console.error(`Error processing lead ${lead.email}:`, leadErr)
        results.errors++
      }
    }

    return NextResponse.json({ success: true, results, processed: leads.length })
  } catch (err) {
    console.error('Cron job error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
