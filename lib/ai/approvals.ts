/* Human-Approval Engine (3I.5) — no AI action executes blindly. Every tool the
   AI wants to run is classified by risk; whether it runs automatically depends
   on the tool's risk and the agent's autonomy level. Anything gated becomes a
   pending approval a human resolves from the Business Command Center. */
import { getSupabaseAdmin } from '@/lib/supabase'
import { getRegistered, riskOf, type Risk } from '@/lib/ai/registry'

type Row = Record<string, unknown>
export type Autonomy = 'suggest' | 'approve' | 'auto'

/** Decide whether a tool call must be held for human approval. */
export function needsApproval(risk: Risk, autonomy: Autonomy): boolean {
  if (risk === 'high') return true            // high-risk always needs explicit approval
  if (risk === 'medium') return autonomy !== 'auto'
  return false                                 // low-risk (incl. all read tools) runs freely
}

export async function createApproval(input: { executionId: string; agentKey: string; toolName: string; args: Row; reason?: string }) {
  const { data } = await getSupabaseAdmin().from('agent_approvals').insert({
    execution_id: input.executionId, agent_key: input.agentKey, tool_name: input.toolName,
    risk: riskOf(input.toolName), args: input.args || {}, reason: input.reason || null, status: 'pending',
  }).select('*').single()
  return data
}

export async function pendingApprovals() {
  const { data } = await getSupabaseAdmin().from('agent_approvals')
    .select('*, execution:agent_executions(goal,actor)').eq('status', 'pending').order('created_at', { ascending: false }).limit(100)
  return data || []
}

export async function pendingCount(): Promise<number> {
  const { count } = await getSupabaseAdmin().from('agent_approvals').select('id', { count: 'exact', head: true }).eq('status', 'pending')
  return count || 0
}

/** Approve → run the tool now and record the result; Reject → cancel. */
export async function decideApproval(id: string, decision: 'approve' | 'reject', actor: string) {
  const db = getSupabaseAdmin()
  const { data: appr } = await db.from('agent_approvals').select('*').eq('id', id).eq('status', 'pending').single()
  if (!appr) return { ok: false, error: 'not found or already decided' }

  if (decision === 'reject') {
    await db.from('agent_approvals').update({ status: 'rejected', decided_by: actor, decided_at: new Date().toISOString() }).eq('id', id)
    if (appr.execution_id) await db.from('agent_executions').update({ status: 'blocked' }).eq('id', appr.execution_id)
    return { ok: true, status: 'rejected' }
  }

  const tool = getRegistered(appr.tool_name as string)
  if (!tool) {
    await db.from('agent_approvals').update({ status: 'failed', decided_by: actor, decided_at: new Date().toISOString(), result: 'unknown tool' }).eq('id', id)
    return { ok: false, error: 'unknown tool' }
  }
  let result: string
  try { result = await tool.run((appr.args || {}) as Row) }
  catch (e) { result = JSON.stringify({ error: String(e) }) }
  await db.from('agent_approvals').update({ status: 'executed', decided_by: actor, decided_at: new Date().toISOString(), result }).eq('id', id)

  // Append the executed action onto the originating execution's step log.
  if (appr.execution_id) {
    const { data: ex } = await db.from('agent_executions').select('steps').eq('id', appr.execution_id).single()
    const steps = Array.isArray(ex?.steps) ? (ex!.steps as Row[]) : []
    steps.push({ type: 'approved_action', tool: appr.tool_name, input: appr.args, output: result, risk: appr.risk, ts: new Date().toISOString(), by: actor })
    await db.from('agent_executions').update({ steps, status: 'completed', finished_at: new Date().toISOString() }).eq('id', appr.execution_id)
  }
  return { ok: true, status: 'executed', result }
}
