/* AI Playground (3I.5) — admin-only surface to test a prompt + model + tool set
   before shipping it to an agent. Read tools run for real; mutating tools are
   DRY-RUN (never executed) so experiments can't touch business data. Nothing is
   persisted to agent_executions. */
import type Anthropic from '@anthropic-ai/sdk'
import { anthropic, modelFor, type TaskKind } from '@/lib/ai/router'
import { getRegistered, toolDefsFor } from '@/lib/ai/registry'
import { costOf } from '@/lib/ai-usage'

type Row = Record<string, unknown>
export interface PlaygroundResult { reply: string; steps: Row[]; toolsUsed: string[]; costUsd: number }

export async function playgroundRun(input: { systemPrompt: string; modelTask?: string; tools?: string[]; message: string }): Promise<PlaygroundResult> {
  const ai = anthropic()
  if (!ai) return { reply: 'AI is not configured (missing ANTHROPIC_API_KEY).', steps: [], toolsUsed: [], costUsd: 0 }
  const model = modelFor((['chat', 'cheap', 'reasoning'].includes(input.modelTask || '') ? input.modelTask : 'chat') as TaskKind)
  const tools = toolDefsFor(input.tools || [])
  const convo: Anthropic.MessageParam[] = [{ role: 'user', content: input.message }]
  const steps: Row[] = []; const toolsUsed: string[] = []; let cost = 0

  for (let hop = 0; hop < 6; hop++) {
    const res = await ai.messages.create({ model, max_tokens: 1200, system: input.systemPrompt || 'You are a helpful assistant.', tools, messages: convo })
    cost += costOf(model, res.usage)
    const toolUses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
    if (toolUses.length === 0) {
      const text = res.content.find((b) => b.type === 'text')
      return { reply: text && text.type === 'text' ? text.text : '', steps, toolsUsed, costUsd: Math.round(cost * 1e6) / 1e6 }
    }
    convo.push({ role: 'assistant', content: res.content })
    const results: Anthropic.ContentBlockParam[] = []
    for (const tu of toolUses) {
      toolsUsed.push(tu.name)
      const reg = getRegistered(tu.name)
      const input2 = (tu.input || {}) as Row
      let out: string
      if (reg?.mutating) { out = JSON.stringify({ dry_run: true, note: 'Mutating tool not executed in the Playground.', would_call: tu.name, input: input2 }) }
      else { try { out = reg ? await reg.run(input2) : JSON.stringify({ error: 'unknown tool' }) } catch (e) { out = JSON.stringify({ error: String(e) }) } }
      steps.push({ tool: tu.name, input: input2, output: out.slice(0, 3000), dry_run: !!reg?.mutating })
      results.push({ type: 'tool_result', tool_use_id: tu.id, content: out })
    }
    convo.push({ role: 'user', content: results })
  }
  return { reply: 'Reached the Playground step limit.', steps, toolsUsed, costUsd: Math.round(cost * 1e6) / 1e6 }
}
