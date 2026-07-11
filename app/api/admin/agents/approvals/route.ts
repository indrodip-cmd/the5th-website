import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { pendingApprovals, decideApproval } from '@/lib/ai/approvals'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* GET — the human-approval queue (pending actions agents proposed). */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ approvals: await pendingApprovals() })
}

/* POST { id, decision:'approve'|'reject' } — resolve one pending approval.
   Approve runs the tool now; reject blocks the originating execution. */
export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const id = String(b?.id || ''); const decision = b?.decision === 'reject' ? 'reject' : 'approve'
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  return NextResponse.json(await decideApproval(id, decision, actor))
}
