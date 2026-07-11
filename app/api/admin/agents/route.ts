import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { listAgents, runAgent } from '@/lib/ai/agents'
import { listRegistry } from '@/lib/ai/registry'
import { pendingCount } from '@/lib/ai/approvals'
import { providerStatus, modelRoutes } from '@/lib/ai/router'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* GET — the Agent console: agents, recent executions, pending approvals, the
   Tool Registry catalog, and model-provider routing. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const [agents, recent, pending] = await Promise.all([
    listAgents(),
    db.from('agent_executions').select('id,agent_key,goal,status,tools_used,cost_usd,duration_ms,created_at').order('created_at', { ascending: false }).limit(20),
    pendingCount(),
  ])
  return NextResponse.json({ agents, recent: recent.data || [], pendingApprovals: pending, tools: listRegistry(), providers: providerStatus(), routes: modelRoutes() })
}

/* POST { agent_key, goal } — run one agent against a goal. */
export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const goal = sanitizeText(b?.goal, 4000)
  const agentKey = String(b?.agent_key || '')
  if (!agentKey || !goal) return NextResponse.json({ error: 'agent_key and goal are required.' }, { status: 400 })
  const run = await runAgent(agentKey, goal, actor)
  return NextResponse.json(run)
}
