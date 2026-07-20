import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyUnsub } from '@/lib/event-enroll'

export const dynamic = 'force-dynamic'

/* One-click unsubscribe for the Breakthrough Intensive campaign. The link is
   HMAC-signed with CRON_SECRET so it can't be forged. Flips unsubscribed=true
   (the cron skips those rows) and returns a simple branded confirmation. */

function page(msg: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title></head>
  <body style="margin:0;background:#FAF6F0;font-family:Arial,Helvetica,sans-serif;color:#2b2430">
    <div style="max-width:520px;margin:12vh auto;background:#fff;border-radius:18px;padding:40px;text-align:center;box-shadow:0 20px 50px -30px rgba(46,26,53,.5)">
      <div style="font-family:Georgia,serif;font-size:26px;color:#2E1A35;margin-bottom:10px">You're unsubscribed</div>
      <p style="font-size:15px;color:#5a5248;line-height:1.6">${msg}</p>
      <a href="https://the5th.consulting" style="display:inline-block;margin-top:18px;color:#B0902F;text-decoration:none;font-size:14px">← the5th.consulting</a>
    </div>
  </body></html>`
}

export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get('e') || '').trim().toLowerCase()
  const sig = req.nextUrl.searchParams.get('k') || ''
  const html = (body: string) => new NextResponse(body, { headers: { 'content-type': 'text/html; charset=utf-8' } })

  if (!email || !sig || !verifyUnsub(email, sig)) {
    return html(page('This unsubscribe link looks invalid or expired. Reply to any email and we\'ll remove you manually.'))
  }
  try {
    const db = getSupabaseAdmin()
    await db.from('event_registrants').update({ unsubscribed: true }).eq('email', email)
  } catch {
    /* fail soft — still show success to the user */
  }
  return html(page("You won't receive any more emails about the Breakthrough Intensive. We're sorry to see you go."))
}
