/* Agent Framework (3I.5) — specialist agents registered in ai_agents, each with
   a system prompt, an allow-list of Tool Registry tools, and an autonomy level.
   runAgent drives the lifecycle: Understand → Plan → Select tools → Execute
   (gated by the approval engine) → Verify → Summarize, logging every step to
   agent_executions and every model call to ai_events. Read-only tools run
   freely; mutating tools are held for human approval per the autonomy policy. */
import type Anthropic from '@anthropic-ai/sdk'
import { anthropic, modelFor, type TaskKind } from '@/lib/ai/router'
import { getRegistered, toolDefsFor } from '@/lib/ai/registry'
import { needsApproval, createApproval, type Autonomy } from '@/lib/ai/approvals'
import { logAiEvent, costOf } from '@/lib/ai-usage'
import { getSupabaseAdmin } from '@/lib/supabase'

type Row = Record<string, unknown>
export interface AgentDef { key: string; name: string; role: string; description: string; system_prompt: string; model_task: string; allowed_tools: string[]; autonomy: Autonomy; enabled: boolean }

export async function listAgents(): Promise<AgentDef[]> {
  const { data } = await getSupabaseAdmin().from('ai_agents').select('*').order('name')
  return (data || []) as unknown as AgentDef[]
}
export async function getAgent(key: string): Promise<AgentDef | null> {
  const { data } = await getSupabaseAdmin().from('ai_agents').select('*').eq('key', key).maybeSingle()
  return (data as unknown as AgentDef) || null
}

export interface AgentRun { executionId: string; agent: string; status: string; reply: string; toolsUsed: string[]; pendingApprovals: number; costUsd: number }

const GUARD = `\n\nLIFECYCLE: understand the goal, plan briefly, then use tools to gather grounded data before answering. Never invent names, numbers, quotes or outcomes.\nACTIONS: read-only tools run immediately. Tools that change data may be held for human approval — if a tool result says an action was "queued for approval", do NOT retry it; note it in your summary as a proposed action awaiting sign-off, and continue.\nFinish with a concise, skimmable summary: what you found, what you did or propose, and the recommended next step.`

/** Execute one agent against a goal. Bounded tool-loop with approval gating. */
export async function runAgent(agentKey: string, goal: string, actor?: string): Promise<AgentRun> {
  const db = getSupabaseAdmin()
  const agent = await getAgent(agentKey)
  if (!agent) return { executionId: '', agent: agentKey, status: 'error', reply: 'Unknown agent.', toolsUsed: [], pendingApprovals: 0, costUsd: 0 }
  if (!agent.enabled) return { executionId: '', agent: agentKey, status: 'error', reply: 'This agent is disabled.', toolsUsed: [], pendingApprovals: 0, costUsd: 0 }

  const ai = anthropic()
  const { data: exec } = await db.from('agent_executions').insert({ agent_key: agentKey, actor: actor || null, goal, status: 'running' }).select('id').single()
  const executionId = (exec?.id as string) || ''
  if (!ai) { await finalize(executionId, 'error', 'AI is not configured (missing ANTHROPIC_API_KEY).', [], 0, 0); return { executionId, agent: agentKey, status: 'error', reply: 'AI is not configured.', toolsUsed: [], pendingApprovals: 0, costUsd: 0 } }

  const model = modelFor((['chat', 'cheap', 'reasoning'].includes(agent.model_task) ? agent.model_task : 'chat') as TaskKind)
  const tools = toolDefsFor(agent.allowed_tools)
  const convo: Anthropic.MessageParam[] = [{ role: 'user', content: goal }]
  const steps: Row[] = []
  const toolsUsed: string[] = []
  let pending = 0, cost = 0
  const started = Date.now()

  for (let hop = 0; hop < 8; hop++) {
    const t0 = Date.now()
    const res = await ai.messages.create({ model, max_tokens: 1500, system: agent.system_prompt + GUARD, tools, messages: convo })
    cost += costOf(model, res.usage)
    await logAiEvent({ endpoint: 'agent', model, usage: res.usage, latencyMs: Date.now() - t0, email: actor, meta: { agent: agentKey, execution_id: executionId, hop } })

    const toolUses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
    if (toolUses.length === 0) {
      const text = res.content.find((b) => b.type === 'text')
      const reply = text && text.type === 'text' ? text.text : ''
      await finalize(executionId, pending > 0 ? 'awaiting_approval' : 'completed', reply, toolsUsed, Date.now() - started, cost, steps)
      return { executionId, agent: agentKey, status: pending > 0 ? 'awaiting_approval' : 'completed', reply, toolsUsed, pendingApprovals: pending, costUsd: round(cost) }
    }

    convo.push({ role: 'assistant', content: res.content })
    const results: Anthropic.ContentBlockParam[] = []
    for (const tu of toolUses) {
      const reg = getRegistered(tu.name)
      const input = (tu.input || {}) as Row
      toolsUsed.push(tu.name)
      if (reg && needsApproval(reg.risk, agent.autonomy)) {
        await createApproval({ executionId, agentKey, toolName: tu.name, args: input, reason: `Proposed by ${agent.name}` })
        pending++
        steps.push({ type: 'approval_requested', tool: tu.name, input, risk: reg.risk, ts: new Date().toISOString() })
        results.push({ type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify({ status: 'queued for approval', note: 'A human must approve this action before it runs.' }) })
        continue
      }
      let out: string
      try { out = reg ? await reg.run(input) : JSON.stringify({ error: 'unknown tool' }) }
      catch (e) { out = JSON.stringify({ error: String(e) }) }
      steps.push({ type: 'tool_call', tool: tu.name, input, output: out.slice(0, 4000), risk: reg?.risk || 'unknown', ts: new Date().toISOString() })
      results.push({ type: 'tool_result', tool_use_id: tu.id, content: out })
    }
    convo.push({ role: 'user', content: results })
  }

  await finalize(executionId, pending > 0 ? 'awaiting_approval' : 'completed', 'Reached the step limit while working. Ask a more specific question to continue.', toolsUsed, Date.now() - started, cost, steps)
  return { executionId, agent: agentKey, status: 'completed', reply: 'Reached the step limit while working.', toolsUsed, pendingApprovals: pending, costUsd: round(cost) }
}

function round(n: number) { return Math.round(n * 1e6) / 1e6 }
async function finalize(id: string, status: string, result: string, toolsUsed: string[], durationMs: number, cost: number, steps?: Row[]) {
  if (!id) return
  const patch: Row = { status, result, tools_used: [...new Set(toolsUsed)], duration_ms: durationMs, cost_usd: round(cost), finished_at: new Date().toISOString() }
  if (steps) patch.steps = steps
  try { await getSupabaseAdmin().from('agent_executions').update(patch).eq('id', id) } catch (e) { console.error('finalize failed', e) }
}
