import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sessionEmail } from '@/lib/session'
import { isValidEmail } from '@/lib/validation'

export const dynamic = 'force-dynamic'

/* Entitlement check for the current quiz session. Trusts only the signed OTP
   cookie — never a client-supplied email. Used by /checkout/complete to reveal
   the "view report" button once the Whop webhook has marked the buyer paid. */
export async function GET(req: NextRequest) {
  const email = sessionEmail(req)
  if (!email || !isValidEmail(email)) return NextResponse.json({ paid: false })
  try {
    const { data } = await getSupabaseAdmin().from('quiz_leads').select('paid').eq('email', email).maybeSingle()
    return NextResponse.json({ paid: !!data?.paid })
  } catch {
    return NextResponse.json({ paid: false })
  }
}
