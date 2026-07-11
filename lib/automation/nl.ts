/* Natural-language workflow builder (3I.6) — the AI-native differentiator.
   Describe an automation in plain English; the AI emits a valid workflow graph
   (trigger + nodes) that the visual builder renders and the engine runs. */
import { anthropic, modelFor } from '@/lib/ai/router'
import { logAiEvent } from '@/lib/ai-usage'
import { TRIGGER_TYPES, ACTION_TYPES } from '@/lib/automation/engine'

type Row = Record<string, unknown>

const SYSTEM = `You convert a plain-English request into a JSON workflow for The5th Automation Studio. Return ONLY minified JSON, no prose.

Shape:
{"name":"...","description":"...","category":"sales|crm|marketing|content|meetings|revenue|support|ai|custom",
 "trigger":{"type":"<trigger>","config":{"conditions":[{"field":"...","op":"eq|ne|gt|gte|lt|lte|contains|exists","value":"..."}],"match":"all|any"}},
 "graph":{"nodes":[ {"id":"n1","type":"trigger","config":{}}, ... ]}}

Node types (in order): "trigger" (first), "condition", "ai", "action", "notify", "delay", "approval", "end" (last).
- condition.config: {"conditions":[{field,op,value}],"match":"all"}
- ai.config: {"prompt":"instruction, may reference {{field}}","task":"cheap","output":"varName"}
- action.config: {"action":"<action>","params":{...}}  params may reference {{field}} and {{varName}}
- notify.config: {"title":"...","body":"..."}
- delay.config: {"minutes":0,"hours":0,"days":0}
- approval.config: {"title":"...","note":"..."}

Available triggers: ${TRIGGER_TYPES.join(', ')}.
Available actions: ${ACTION_TYPES.join(', ')}.
Common context fields you can reference: email, name, lead_score, pipeline_stage, country, interest, value, amount, title.
Keep it minimal and correct. Always start with a trigger node and end with an end node. Use AI nodes for reasoning (summaries, drafting, intent) and reference their output var in later steps.`

function extract(text: string): Row | null {
  try { return JSON.parse(text) } catch {}
  const m = text.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]) } catch {} }
  return null
}

let _n = 0
function ensureIds(nodes: Row[]): Row[] {
  return (nodes || []).map((n) => ({ id: (n.id as string) || `n${++_n}_${Date.now().toString(36)}`, type: String(n.type || 'action'), config: (n.config as Row) || {} }))
}

export async function generateWorkflow(description: string, actor?: string): Promise<{ ok: boolean; workflow?: Row; error?: string }> {
  const ai = anthropic()
  if (!ai) return { ok: false, error: 'AI not configured' }
  const model = modelFor('chat')
  const t0 = Date.now()
  const msg = await ai.messages.create({ model, max_tokens: 1400, system: SYSTEM, messages: [{ role: 'user', content: description.slice(0, 2000) }] })
  await logAiEvent({ endpoint: 'automation_nl', model, usage: msg.usage, latencyMs: Date.now() - t0, email: actor })
  const text = msg.content.find((b) => b.type === 'text')
  const parsed = extract(text && text.type === 'text' ? text.text : '')
  if (!parsed) return { ok: false, error: 'Could not generate a valid workflow. Try rephrasing.' }
  const nodes = ensureIds(((parsed.graph as Row)?.nodes as Row[]) || [])
  if (!nodes.some((n) => n.type === 'trigger')) nodes.unshift({ id: `n${++_n}`, type: 'trigger', config: {} })
  return {
    ok: true,
    workflow: {
      name: String(parsed.name || 'Generated workflow'),
      description: String(parsed.description || description.slice(0, 160)),
      category: String(parsed.category || 'custom'),
      trigger: (parsed.trigger as Row) || { type: 'manual', config: {} },
      graph: { nodes },
      status: 'draft',
    },
  }
}
