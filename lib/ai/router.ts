/* Shared AI model router (3I.3.5). One thin place that picks a provider + model
   per task, so Carolina, Command AI and future agents don't hardcode models.
   Anthropic today; add Gemini/OpenAI here without touching callers. */
import Anthropic from '@anthropic-ai/sdk'

export type TaskKind = 'chat' | 'cheap' | 'reasoning'

// Named model per task — future providers slot in by extending this map + client().
export const MODELS: Record<TaskKind, string> = {
  chat: 'claude-sonnet-4-6',
  reasoning: 'claude-sonnet-4-6',
  cheap: 'claude-haiku-4-5-20251001',
}

export function modelFor(task: TaskKind): string { return MODELS[task] }

export function anthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export function aiConfigured(): boolean { return !!process.env.ANTHROPIC_API_KEY }

/* Multi-provider awareness (3I.5). Anthropic is the only live client today; the
   router advertises which providers are configured and which model serves each
   task so the platform can route (and the Playground can show) per-task models.
   Add a provider by wiring its client + extending PROVIDERS/MODELS — callers
   (Command AI, agents) don't change. */
export interface ProviderInfo { id: string; label: string; configured: boolean; kinds: TaskKind[] }
export function providerStatus(): ProviderInfo[] {
  return [
    { id: 'anthropic', label: 'Anthropic (Claude)', configured: !!process.env.ANTHROPIC_API_KEY, kinds: ['chat', 'reasoning', 'cheap'] },
    { id: 'openai', label: 'OpenAI', configured: !!process.env.OPENAI_API_KEY, kinds: ['chat', 'reasoning', 'cheap'] },
    { id: 'google', label: 'Google Gemini', configured: !!process.env.GEMINI_API_KEY, kinds: ['chat', 'reasoning', 'cheap'] },
  ]
}
/** Task → provider+model routing table (for observability / the Playground). */
export function modelRoutes() {
  return (Object.keys(MODELS) as TaskKind[]).map((task) => ({ task, model: MODELS[task], provider: 'anthropic' }))
}
