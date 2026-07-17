import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { limit, clientIp } from '@/lib/rateLimit'
import { anthropic, modelFor } from '@/lib/ai/router'
import { logAiEvent } from '@/lib/ai-usage'
import { emitEvent } from '@/lib/events'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const FREE = 7
const SYSTEM = [
  'You are The5th AI, a sharp and warm business coach for professionals 40+ who are turning a lifetime of expertise into income (coaching, consulting, services). This is a live demo.',
  'Style: confident, specific, practical, encouraging. Never generic, never hypey, never fluffy. Give genuinely useful advice a top consultant would give. Keep it tight: 2 to 4 short paragraphs; use a bullet list only when it truly helps. Ask one clarifying question when it sharpens your help.',
  'You are also gently qualifying: understand what they do and where they are stuck, and help them see whether The5th is right for them. When it genuinely fits, warmly point them to the $1, 7-day trial — the Expertise To Income book (free) plus 7 days of The5th AI — never pushy, only when it helps.',
  'If asked who you are, you are The5th AI by The5th. Never invent fake statistics or client names.',
].join(' ')

const CTRL = new RegExp('[\\u0000-\\u001F\\u007F]', 'g')
const clean = (v: unknown, n: number): string => (typeof v === 'string' ? v.replace(CTRL, ' ').trim().slice(0, n) : '')

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const visitorId = clean(body.visitor_id, 64)
  if (!visitorId) return NextResponse.json({ error: 'bad request' }, { status: 400 })

  const ip = clientIp(req)
  const lim = await limit(`demo:ip:${ip}`, 40, 3600)
  if (!lim.ok) return NextResponse.json({ error: 'Too many requests, please slow down.' }, { status: 429 })

  const db = getSupabaseAdmin()
  let { data: sess } = await db.from('demo_sessions').select('*').eq('visitor_id', visitorId).maybeSingle()
  if (!sess) { const { data } = await db.from('demo_sessions').insert({ visitor_id: visitorId }).select('*').single(); sess = data }
  if (!sess) return NextResponse.json({ error: 'server error' }, { status: 500 })

  const email = clean(body.email, 200).toLowerCase()
  const name = clean(body.name, 120)
  if (email && !sess.email) {
    // Enforce the free preview PER EMAIL (so it can't be reset by clearing the
    // browser). If this email already used its 7 prompts anywhere, it's locked.
    const { data: prior } = await db.from('demo_sessions').select('message_count').eq('email', email).order('message_count', { ascending: false }).limit(1)
    const priorCount = Number(prior?.[0]?.message_count || 0)
    if (priorCount >= FREE) return NextResponse.json({ emailBlocked: true })
    const carried = Math.max(Number(sess.message_count || 0), priorCount)
    await db.from('demo_sessions').update({ email, name: name || null, lead_saved: true, message_count: carried, updated_at: new Date().toISOString() }).eq('id', sess.id)
    sess.email = email; sess.message_count = carried
    try {
      await db.from('crm_contacts').upsert({ email, name: name || null, source: 'the5th-ai-demo', lifecycle_stage: 'lead' }, { onConflict: 'email', ignoreDuplicates: false })
      emitEvent('lead_captured', { email, name, source: 'the5th-ai-demo' })
    } catch (e) { console.error('demo lead capture failed', e) }
  }

  const count = Number(sess.message_count || 0)
  // Must give name + email before the very first reply.
  if (!sess.email) return NextResponse.json({ needsContact: true })
  if (count >= FREE) return NextResponse.json({ limitReached: true, used: count })

  const ai = anthropic()
  if (!ai) return NextResponse.json({ reply: 'The demo is warming up, please try again shortly.' })
  const msgs = (Array.isArray(body.messages) ? body.messages : []).slice(-12)
    .map((m) => m as Record<string, unknown>)
    .filter((m) => m && m.role && m.content)
    .map((m) => ({ role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const), content: clean(m.content, 4000) }))
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return NextResponse.json({ error: 'no message' }, { status: 400 })

  const model = modelFor('chat')
  const t0 = Date.now()
  const res = await ai.messages.create({ model, max_tokens: 700, system: SYSTEM, messages: msgs })
  await logAiEvent({ endpoint: 'demo', model, usage: res.usage, latencyMs: Date.now() - t0, visitorId, email: sess.email as string | undefined })
  const text = res.content.find((b) => b.type === 'text')
  const reply = text && text.type === 'text' ? text.text : ''
  const newCount = count + 1
  await db.from('demo_sessions').update({ message_count: newCount, updated_at: new Date().toISOString() }).eq('id', sess.id)

  return NextResponse.json({ reply, used: newCount, remaining: Math.max(0, FREE - newCount), gateNext: newCount >= 1 && !sess.email })
}
