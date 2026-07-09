import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/validation'

export const dynamic = 'force-dynamic'

/* Newsletter opt-in from the Carolina Home footer. Saves the email as a
   lead (never blocks the UI on failure). */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`carolina:sub:${ip}`, 10, 600)
  if (!rl.ok) return NextResponse.json({ error: 'Please try again shortly.' }, { status: 429 })

  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!isValidEmail(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })

  try {
    await getSupabaseAdmin()
      .from('carolina_leads')
      .upsert({ email, interest: 'newsletter', updated_at: new Date().toISOString() }, { onConflict: 'email' })
  } catch (e) {
    console.error('carolina subscribe failed', e)
  }
  return NextResponse.json({ ok: true })
}
