import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeText } from '@/lib/validation'
import { getSlots, createBooking, CAL_PUBLIC_LINK } from '@/lib/calcom'
import { sendAppointmentEmail } from '@/lib/carolina-email'
import { loadSettings, loadActiveLeadMagnet, type LeadMagnet } from '@/lib/carolina-config'

export const maxDuration = 45

const MODEL = 'claude-sonnet-4-6'

function anthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

/* Pages Carolina may guide visitors to. */
const PAGES: Record<string, string> = {
  quiz: '/quiz',
  fast_forward: '/fast-forward',
  collective: '/collective',
  ai: '/ai',
  call: '/call',
  home: '/',
}

const BASE_RULES = `STRICT RULES:
- You are a marketing, sales, and scheduling assistant. You are NOT a coach.
- NEVER give detailed business advice, strategies, step-by-step instructions, tactics, or "how to" answers. There is no knowledge base of tactics to draw from.
- If asked for advice or specifics, warmly redirect: that is exactly what the free quiz or a call with the team is for.
- Only speak about The5th's offers, value, resources, booking, and scheduling. Politely decline anything off-topic.
- NEVER promise income, results, or guarantees. Do not quote exact prices; the team covers pricing and fit on the call.
- Do not invent facts, testimonials, features, or availability.
- Keep replies short and human: 2-4 sentences, first person, warm. One question at a time.
- Aim to: understand their goal → capture first name + email (call save_lead) → guide them to the right next step.

TOOLS:
- save_lead: call as soon as you have a first name AND a valid email.
- navigate_user: when the visitor would be better served on another page (e.g. send someone unsure to the quiz), take them there and offer to guide them through it. Keep chatting after — the conversation continues on the new page.
- get_lead_magnet: after you have their email, call this to fetch the free resource link and share it.
- get_availability: call before proposing specific call times so you offer real open slots.
- book_appointment: only after the visitor confirms ONE specific time and you have their name + email. Confirm warmly afterwards and mention a confirmation email is on the way.

If booking is unavailable for any reason, share this scheduling link instead: ${CAL_PUBLIC_LINK}`

function buildSystem(opts: {
  kb: string | null
  persona: string | null
  magnet: LeadMagnet | null
  timeZone: string
}): string {
  const parts: string[] = []
  parts.push(
    `You are Carolina, the friendly virtual concierge for The5th Consulting — a company that helps women over 40 turn their expertise into a profitable online business.`
  )
  if (opts.persona) parts.push(`PERSONA:\n${opts.persona}`)
  if (opts.kb) parts.push(opts.kb)
  if (opts.magnet) {
    const pts = Array.isArray(opts.magnet.selling_points) ? opts.magnet.selling_points.join('; ') : ''
    parts.push(
      `ACTIVE FREE RESOURCE you may offer to capture leads:\n` +
        `- Title: ${opts.magnet.title}\n` +
        (opts.magnet.description ? `- What it is: ${opts.magnet.description}\n` : '') +
        (opts.magnet.hook ? `- Hook: ${opts.magnet.hook}\n` : '') +
        (pts ? `- Selling points: ${pts}\n` : '') +
        `Offer it naturally when it fits. After they give their email (save_lead), call get_lead_magnet and share the link. Write your OWN persuasive, on-brand copy — do not read these notes verbatim.`
    )
  }
  parts.push(BASE_RULES)
  parts.push(`The visitor's timezone is ${opts.timeZone}. Today is ${new Date().toISOString().slice(0, 10)}.`)
  return parts.join('\n\n')
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'save_lead',
    description: 'Save or update the visitor as a lead. Call as soon as you have a first name and valid email.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        business_stage: { type: 'string' },
        interest: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['name', 'email'],
    },
  },
  {
    name: 'navigate_user',
    description: 'Take the visitor to a more useful page. The chat continues on the new page.',
    input_schema: {
      type: 'object',
      properties: {
        page: { type: 'string', enum: Object.keys(PAGES), description: 'Which page to open.' },
        reason: { type: 'string', description: 'Short reason shown to the visitor.' },
      },
      required: ['page'],
    },
  },
  {
    name: 'get_lead_magnet',
    description: 'Fetch the active free resource (title + download link) so you can share it after collecting the email.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'get_availability',
    description: 'Fetch real open call slots from the calendar. Call before proposing specific times.',
    input_schema: {
      type: 'object',
      properties: { timeZone: { type: 'string', description: 'IANA timezone, e.g. America/New_York.' } },
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
        start: { type: 'string', description: 'ISO 8601 start time, exactly as returned by get_availability.' },
        timeZone: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['name', 'email', 'start', 'timeZone'],
    },
  },
]

type LeadPatch = Record<string, unknown>
type ClientAction = { type: string; url?: string }

async function upsertLead(email: string, patch: LeadPatch) {
  try {
    await getSupabaseAdmin()
      .from('carolina_leads')
      .upsert({ email: email.toLowerCase(), ...patch, updated_at: new Date().toISOString() }, { onConflict: 'email' })
  } catch (e) {
    console.error('carolina upsertLead failed', e)
  }
}

async function runTool(
  name: string,
  input: Record<string, unknown>,
  ctx: { magnet: LeadMagnet | null; actions: ClientAction[]; booked: { v: boolean } }
): Promise<string> {
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

  if (name === 'navigate_user') {
    const page = String(input.page || '')
    const url = PAGES[page]
    if (!url) return JSON.stringify({ ok: false, error: 'unknown page' })
    ctx.actions.push({ type: 'navigate', url })
    return JSON.stringify({ ok: true, navigated_to: url, note: 'The visitor is now heading to this page. Continue guiding them.' })
  }

  if (name === 'get_lead_magnet') {
    if (!ctx.magnet || !ctx.magnet.pdf_url) {
      return JSON.stringify({ ok: false, note: 'No downloadable resource is available right now — offer the quiz or a call instead.' })
    }
    return JSON.stringify({ ok: true, title: ctx.magnet.title, url: ctx.magnet.pdf_url })
  }

  if (name === 'get_availability') {
    const tz = sanitizeText(input.timeZone, 60) || 'UTC'
    const slots = await getSlots(tz, 10, 3)
    if (!slots.length) {
      return JSON.stringify({ ok: false, slots: [], fallback_link: CAL_PUBLIC_LINK, note: 'No live slots — offer the scheduling link.' })
    }
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
    if (!isValidEmail(email) || !nm || !start) return JSON.stringify({ ok: false, error: 'Missing name, email, or time.' })
    const booking = await createBooking({ startISO: start, name: nm, email, timeZone: tz, notes })
    if (!booking.ok) return JSON.stringify({ ok: false, error: 'booking_failed', fallback_link: CAL_PUBLIC_LINK })
    const emailed = await sendAppointmentEmail({
      name: nm, email, startISO: booking.start || start, timeZone: tz, meetingUrl: booking.meetingUrl,
    })
    await upsertLead(email, { name: nm, call_booked: true, booking_start: booking.start || start, timezone: tz })
    ctx.booked.v = true
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

    const messages: Anthropic.MessageParam[] = incoming
      .slice(-20)
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: sanitizeText(m.content, 2000) }))

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'Expected a user message.' }, { status: 400 })
    }

    const settings = await loadSettings()
    const magnet = await loadActiveLeadMagnet(settings)
    const system = buildSystem({ kb: settings.knowledge_base, persona: settings.persona, magnet, timeZone })

    const client = anthropic()
    const ctx = { magnet, actions: [] as ClientAction[], booked: { v: false } }

    for (let round = 0; round < 5; round++) {
      const res = await client.messages.create({ model: MODEL, max_tokens: 700, system, tools: TOOLS, messages })
      const toolUses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')

      if (toolUses.length === 0 || res.stop_reason !== 'tool_use') {
        const text = res.content.filter((b) => b.type === 'text').map((b) => (b as Anthropic.TextBlock).text).join('\n').trim()
        return NextResponse.json({ reply: text || "I'm here — how can I help you today?", booked: ctx.booked.v, actions: ctx.actions })
      }

      messages.push({ role: 'assistant', content: res.content })
      const results: Anthropic.ToolResultBlockParam[] = []
      for (const tu of toolUses) {
        const out = await runTool(tu.name, (tu.input || {}) as Record<string, unknown>, ctx)
        results.push({ type: 'tool_result', tool_use_id: tu.id, content: out })
      }
      messages.push({ role: 'user', content: results })
    }

    return NextResponse.json({ reply: 'Let me get the team to follow up — what is the best email to reach you?', booked: ctx.booked.v, actions: ctx.actions })
  } catch (err) {
    console.error('carolina route error', err)
    return NextResponse.json({ error: 'Sorry, I hit a snag. Mind trying that again?' }, { status: 500 })
  }
}
