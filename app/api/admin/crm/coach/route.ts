import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { coachChat } from '@/lib/ai-coach'

export const dynamic = 'force-dynamic'
export const maxDuration = 45

/* POST { messages: [{role, content}] } — grounded admin sales-coach chat. */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const messages = Array.isArray(b?.messages)
    ? b.messages
        .filter((m: unknown) => m && typeof (m as Record<string, unknown>).content === 'string')
        .map((m: Record<string, unknown>) => ({
          role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
          content: sanitizeText(m.content, 2000),
        }))
        .slice(-16)
    : []
  if (!messages.length) return NextResponse.json({ error: 'No message.' }, { status: 400 })
  const reply = await coachChat(messages)
  return NextResponse.json({ ok: true, reply })
}
