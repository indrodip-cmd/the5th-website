import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { playgroundRun } from '@/lib/ai/playground'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* POST { system_prompt, model_task?, tools?, message } — dry-run test (mutating
   tools are never executed; nothing is persisted). */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const message = sanitizeText(b?.message, 4000)
  if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 })
  const result = await playgroundRun({
    systemPrompt: sanitizeText(b?.system_prompt, 20000),
    modelTask: String(b?.model_task || 'chat'),
    tools: Array.isArray(b?.tools) ? (b.tools as string[]).slice(0, 40) : [],
    message,
  })
  return NextResponse.json(result)
}
