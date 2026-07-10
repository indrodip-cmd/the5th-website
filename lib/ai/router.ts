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
