import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeText } from '@/lib/validation'
import { getSlots, createBooking, CAL_PUBLIC_LINK } from '@/lib/calcom'
import { sendAppointmentEmail } from '@/lib/carolina-email'

export const maxDuration = 45

const MODEL = 'claude-sonnet-4-6'

function anthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

/* ── Guardrails: Carolina is a sales + booking concierge ONLY. ── */
const SYSTEM = `You are Carolina, the friendly virtual concierge for The5th Consulting — a company that helps women over 40 turn their expertise into a profitable online business.

YOUR JOB, and nothing else:
1. Warmly greet visitors and understand what they're looking for.
2. Explain, at a HIGH LEVEL only, what The5th offers: the programs "Fast Forward", "The Collective", and "The5th AI", and the free business assessment quiz.
3. Collect the visitor's first name and email early in the conversation.
4. Book them a free call with the team when they're interested.
5. Keep them in the loop and make them feel looked after.

STRICT RULES:
- You are a marketing, sales, and scheduling assistant. You are NOT a coach.
- NEVER give detailed business advice, strategies, step-by-step instructions, tactics, "how to" answers, or any teaching. There is no knowledge base to draw from.
- If asked for advice or specifics ("how do I get clients", "what should my offer be", "how does the method work in detail"), warmly redirect: that is exactly what a call with the team is for — offer to find a time.
- Only speak about The5th's offers, value, booking, and scheduling. Politely decline anything off-topic (news, general knowledge, personal opinions, other companies, medical/legal/financial advice).
- NEVER promise income, results, or guarantees. Do not quote exact prices; say the team covers pricing and fit on the call.
- Do not invent facts, testimonials, features, or availability. If you don't know, say the team will cover it on the call.
- Keep replies short and human: 2-4 sentences, first person, warm, lightly enthusiastic. One question at a time.

TOOLS:
- Call save_lead as soon as you have BOTH a first name and a valid email (and again to update notes/interest as you learn more).
- Call get_availability before you propose specific times, so you offer real open slots.
- Only call book_appointment after the visitor has clearly confirmed ONE specific time, and you already have their name and email. After booking succeeds, confirm warmly and tell them a confirmation email is on the way.

If booking is unavailable for any reason, share this scheduling link instead: ${CAL_PUBLIC_LINK}`

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'save_lead',
    description: 'Save or update the visitor as a lead. Call as soon as you have a first name and valid email.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Visitor first name (or full name).' },
        email: { type: 'string', description: 'Visitor email address.' },
        phone: { type: 'string', description: 'Optional phone number.' },
        business_stage: { type: 'string', description: 'Where they are in their business, if mentioned.' },
        interest: { type: 'string', description: 'Which program or outcome they are interested in.' },
        notes: { type: 'string', description: 'Short summary of their goal / situation.' },
      },
      required: ['name', 'email'],
    },
  },
  {
    name: 'get_availability',
    description: 'Fetch real open call slots from the calendar. Call before proposing specific times.',
    input_schema: {
      type: 'object',
      properties: {
        timeZone: { type: 'string', description: 'IANA timezone of the visitor, e.g. America/New_York.' },
      },
      required: ['timeZone'],
    },
  },
  {
    name: 'book_appointment',
    description: 'Create the confirmed booking. Only after the visitor confirms one specific slot and you have their name and email.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        start: { type: 'string', description: 'ISO 8601 start time of the chosen slot, exactly as returned by get_availability.' },
        timeZone: { type: 'string', description: 'IANA timezone, e.g. America/New_York.' },
        notes: { type: 'string', description: 'Optional context for the call.' },
      },
      required: ['name', 'email', 'start', 'timeZone'],
    },
  },
]

type LeadPatch = Record<string, unknown>

async function upsertLead(email: string, patch: LeadPatch) {
  try {
    await getSupabaseAdmin()
      .from('carolina_leads')
      .upsert(
        { email: email.toLowerCase(), ...patch, updated_at: new Date().toISOString() },
        { onConflict: 'email' }
      )
  } catch (e) {
    // Table may not exist yet — never let persistence break the chat.
    console.error('carolina upsertLead failed', e)
  }
}

async function runTool(name: string, input: Record<string, unknown>): Promise<string> {
  if (name === 'save_lead') {
    const email = String(input.email || '').trim().toLowerCase()
    const nm = sanitizeText(input.name, 120)
    if (!isValidEmail(email) || !nm) return JSON.stringify({ ok: false, error: 'Need a valid name and email.' })
    await upsertLead(email, {
      name: nm,
      phone: sanitizeText(input.phone, 40) || null,
      business_stage: sanitizeText(input.business_stage, 200) || null,
      interest: sanitizeText(input.interest, 200) || null,
      notes: sanitizeText(input.notes, 1000) || null,
    })
    return JSON.stringify({ ok: true, saved: true })
  }

  if (name === 'get_availability') {
    const tz = sanitizeText(input.timeZone, 60) || 'UTC'
    const slots = await getSlots(tz, 10, 3)
    if (!slots.length) {
      return JSON.stringify({ ok: false, slots: [], fallback_link: CAL_PUBLIC_LINK, note: 'No live slots available — offer the scheduling link.' })
    }
    // Return human-readable labels alongside the raw ISO the model must echo back.
    const labeled = slots.map((s) => ({
      start: s.start,
      label: new Intl.DateTimeFormat('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: tz,
      }).format(new Date(s.start)),
    }))
    return JSON.stringify({ ok: true, timeZone: tz, slots: labeled })
  }

  if (name === 'book_appointment') {
    const email = String(input.email || '').trim().toLowerCase()
    const nm = sanitizeText(input.name, 120)
    const start = String(input.start || '')
    const tz = sanitizeText(input.timeZone, 60) || 'UTC'
    const notes = sanitizeText(input.notes, 800)
    if (!isValidEmail(email) || !nm || !start) {
      return JSON.stringify({ ok: false, error: 'Missing name, email, or time.' })
    }
    const booking = await createBooking({ startISO: start, name: nm, email, timeZone: tz, notes })
    if (!booking.ok) {
      return JSON.stringify({ ok: false, error: 'booking_failed', fallback_link: CAL_PUBLIC_LINK })
    }
    const emailed = await sendAppointmentEmail({
      name: nm, email, startISO: booking.start || start, timeZone: tz, meetingUrl: booking.meetingUrl,
    })
    await upsertLead(email, {
      name: nm, call_booked: true, booking_start: booking.start || start, timezone: tz,
    })
    return JSON.stringify({ ok: true, booked: true, email_sent: emailed, meeting_url: booking.meetingUrl || null })
  }

  return JSON.stringify({ ok: false, error: 'unknown tool' })
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req)
    const rl = await limit(`carolina:ip:${ip}`, 40, 600)
    if (!rl.ok) {
      return NextResponse.json({ error: "You're sending messages a little fast — give me a sec!" }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
    }

    const body = await req.json().catch(() => null)
    const incoming: Array<{ role: string; content: string }> = Array.isArray(body?.messages) ? body.messages : []
    const timeZone = sanitizeText(body?.timeZone, 60) || 'UTC'
    if (!incoming.length) return NextResponse.json({ error: 'No message provided.' }, { status: 400 })

    // Normalise + cap history to the last 20 turns for cost/safety.
    const messages: Anthropic.MessageParam[] = incoming
      .slice(-20)
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: sanitizeText(m.content, 2000) }))

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'Expected a user message.' }, { status: 400 })
    }

    // Nudge the model with the visitor timezone so scheduling is correct.
    const system = `${SYSTEM}\n\nThe visitor's timezone is ${timeZone}. Today is ${new Date().toISOString().slice(0, 10)}.`

    const client = anthropic()
    let booked = false

    // Agentic loop: allow up to 4 tool rounds per turn.
    for (let round = 0; round < 5; round++) {
      const res = await client.messages.create({
        model: MODEL,
        max_tokens: 700,
        system,
        tools: TOOLS,
        messages,
      })

      const toolUses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')

      if (toolUses.length === 0 || res.stop_reason !== 'tool_use') {
        const text = res.content.filter((b) => b.type === 'text').map((b) => (b as Anthropic.TextBlock).text).join('\n').trim()
        return NextResponse.json({ reply: text || "I'm here — how can I help you today?", booked })
      }

      // Execute tools and feed results back.
      messages.push({ role: 'assistant', content: res.content })
      const results: Anthropic.ToolResultBlockParam[] = []
      for (const tu of toolUses) {
        const out = await runTool(tu.name, (tu.input || {}) as Record<string, unknown>)
        if (tu.name === 'book_appointment') {
          try { booked = JSON.parse(out)?.booked === true } catch {}
        }
        results.push({ type: 'tool_result', tool_use_id: tu.id, content: out })
      }
      messages.push({ role: 'user', content: results })
    }

    // Safety valve if the model never stopped tool-calling.
    return NextResponse.json({ reply: 'Let me get the team to follow up with you — could you share the best email to reach you?', booked })
  } catch (err) {
    console.error('carolina route error', err)
    return NextResponse.json({ error: "Sorry, I hit a snag. Mind trying that again?" }, { status: 500 })
  }
}
