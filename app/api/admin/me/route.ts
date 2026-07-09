import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'

/* Lightweight auth probe used by the /admin page to decide whether to show
   the dashboard or the login screen. The httpOnly cookie does the real work. */
export async function GET(req: NextRequest) {
  const email = adminEmail(req)
  if (!email) return NextResponse.json({ authed: false }, { status: 401 })
  return NextResponse.json({ authed: true, email })
}
