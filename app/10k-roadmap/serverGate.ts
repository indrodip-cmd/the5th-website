import { cookies } from 'next/headers'
import { verifyPaidPass, AUDIT_PAID_COOKIE } from '@/lib/roadmap-audit'

/* Server-side gate for the paid steps (3-5). Reads the signed HttpOnly pass
   from the request cookies and returns the paid email, or null. Gated page
   server components use this to decide whether to render the step or the
   PayGate (which re-verifies against the DB and issues the pass). */
export async function getPaidEmail(): Promise<string | null> {
  const store = await cookies()
  const token = store.get(AUDIT_PAID_COOKIE)?.value
  const v = verifyPaidPass(token)
  return v?.email || null
}
