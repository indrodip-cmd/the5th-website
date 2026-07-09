import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeText } from '@/lib/validation'
import { getSlots, createBooking, CAL_PUBLIC_LINK } from '@/lib/calcom'
import { sendAppointmentEmail } from '@/lib/carolina-email'
import { loadSettings, loadActiveLeadMagnet, loadAgents, type LeadMagnet } from '@/lib/carolina-config'
import { type Source } from '@/lib/retrieval'
import { orchestrate, persistTurn } from '@/lib/orchestrator'
import { logActivity } from '@/lib/crm'

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

export const AGENT_KEYS = ['carolina', 'natasha', 'benjamin'] as const
type AgentKey = (typeof AGENT_KEYS)[number]

const AGENTS: Record<AgentKey, { name: string; scope: string; routing: string; canBook: boolean }> = {
  carolina: {
    name: 'Carolina',
    scope:
      'You handle SALES: the programs (Fast Forward, The Collective, The5th AI), the free assessment/quiz, lead magnets, pricing at a high level, and booking calls.',
    routing:
      'If the visitor asks a general or customer-success question that is NOT about buying or booking (how things work, what to expect, membership, logistics), hand off to Natasha. If something is broken, or they have a technical, billing, or account-access problem, hand off to Benjamin.',
    canBook: true,
  },
  natasha: {
    name: 'Natasha',
    scope:
      'You handle GENERAL and CUSTOMER-SUCCESS questions: how things work, what to expect, membership and logistics — anything that is not a direct sale and not a technical problem.',
    routing:
      'If the visitor wants to buy, discuss pricing, or book a call, hand off to Carolina. If something is broken, or they have a technical, billing, or account-access problem, hand off to Benjamin.',
    canBook: false,
  },
  benjamin: {
    name: 'Benjamin',
    scope:
      'You handle SUPPORT: account access, billing questions, technical issues, and fixing things that have gone wrong.',
    routing:
      'If the visitor wants to buy or book a call, hand off to Carolina. If it becomes a general "how does it work" question, hand off to Natasha.',
    canBook: false,
  },
}

function baseRules(canBook: boolean): string {
  return `PERSONALITY: You are a calm, confident, professional business advisor — like an elite consultant, not a support bot or a hype machine. Warm and friendly, never robotic, never over-enthusiastic, never childish. Use emojis sparingly, only when they genuinely add warmth.

BE PROACTIVE: Don't just wait for instructions — guide the visitor. Understand their goal, then point them to the best next step. End substantial answers with a clear, contextual recommendation or one gentle follow-up question. Recommend a program or a call only when it genuinely fits — never push.

SHARED RULES:
- You are a concierge for marketing, sales, service and support — NOT a coach. Never give detailed business strategies, tactics, or "how to" teaching; there is no knowledge base of tactics. Warmly redirect such requests to the free quiz or a call.
- Only discuss The5th's offers, service, support, booking and scheduling. Politely decline anything off-topic.
- ETHICS: Never invent company policies, features, testimonials, availability, or pricing. Do not quote exact prices — the team covers pricing and fit on a call. Never promise income, results, or guarantees. If you don't know something, say so and offer to connect them with the team.
- HUMAN HANDOFF: If you cannot confidently help, offer to bring in the team — book a call, or hand off to a colleague.
- ATTACHMENTS: Visitors may upload images (e.g. screenshots) or documents. Only engage with a file IN THE CONTEXT OF THE5TH — their business situation as it relates to working with us, our programs, or their question about us. If a file is unrelated to The5th (random images, someone else's material, code, homework, general tasks, document analysis, transcription, etc.), politely say you can only look at things related to The5th and their business with us, then steer back. Never perform general-purpose file analysis or tasks outside sales, service and support. Do not describe explicit, personal, or sensitive content.
- Keep replies short and human: 2-4 sentences, first person, warm. One question at a time.
- When you describe a program (Fast Forward, The5th AI, The Collective) or invite them to book, call show_card to render a rich card instead of listing details in prose — then keep your text brief.
- Capture the visitor's first name and email early via save_lead.
${canBook ? '- You CAN book calls: use get_availability, then book_appointment after they confirm a specific time.' : '- You do NOT book calls yourself — if they want to book, hand off to Carolina.'}
- If booking is unavailable, share this scheduling link: ${CAL_PUBLIC_LINK}`
}

function buildSystem(opts: {
  agent: AgentKey
  personas: Record<string, string | null>
  kb: string | null
  magnet: LeadMagnet | null
  timeZone: string
  handoff: boolean
  context?: string | null
}): string {
  const a = AGENTS[opts.agent]
  const persona = opts.personas[opts.agent] || null
  const parts: string[] = []
  parts.push(
    `You are ${a.name}, part of The5th AI — the business-growth advisor team at The5th Consulting, a company that helps women over 40 turn their expertise into a profitable online business. You work alongside your colleagues: Carolina (sales), Natasha (customer success) and Benjamin (support). You are an advisor and concierge, never "support" or a help desk.`
  )
  parts.push(`YOUR ROLE: ${a.scope}`)
  if (persona) parts.push(`PERSONA: ${persona}`)
  parts.push(
    `SALES-CONCIERGE FRAMEWORK: Guide every conversation through — understand their situation → educate → build trust (the guarantee and real client outcomes, never fabricated) → recommend the right fit → invite the natural next step (usually the free assessment or a strategy call) → keep helping. Discover their business, goal and where they are now conversationally (never a form) and save it with save_lead as you learn it. Only suggest a call at genuine high-intent moments (comparing options, fit/implementation questions, ready to move) — never pushy, never mid-thought. Keep everything INSIDE this chat: use show_card for programs and booking rather than sending them to the website.`
  )
  if (opts.context) parts.push(`CURRENT CONTEXT: The visitor is viewing "${opts.context}" inside the chat. Answer questions about it directly without asking what they're referring to.`)
  if (opts.kb) parts.push(opts.kb)
  if (opts.magnet && a.canBook) {
    const pts = Array.isArray(opts.magnet.selling_points) ? opts.magnet.selling_points.join('; ') : ''
    parts.push(
      `ACTIVE FREE RESOURCE you may offer to capture leads:\n` +
        `- Title: ${opts.magnet.title}\n` +
        (opts.magnet.description ? `- What it is: ${opts.magnet.description}\n` : '') +
        (opts.magnet.hook ? `- Hook: ${opts.magnet.hook}\n` : '') +
        (pts ? `- Selling points: ${pts}\n` : '') +
        `Offer it naturally when it fits. After they give their email (save_lead), call get_lead_magnet and share the link. Write your OWN persuasive, on-brand copy.`
    )
  }
  parts.push(
    `WHEN TO HAND OFF: ${a.routing}\n` +
      `To hand off: say ONE short, warm sentence telling the visitor you're bringing in a colleague who understands this better, THEN call transfer_conversation with the colleague's key and the visitor's first name if you know it. Only hand off when the question clearly belongs to a colleague, and never hand off the same question twice.`
  )
  parts.push(baseRules(a.canBook))
  if (opts.handoff) {
    parts.push(
      `NOTE: You have JUST joined this conversation after a colleague handed it to you. The visitor has already been greeted and told you're catching up — do NOT greet again or reintroduce yourself. Read the conversation and answer their latest question directly, warmly, and helpfully.`
    )
  }
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
  {
    name: 'show_card',
    description: 'Display a rich card inline in the chat to support your reply. Use when you describe a program or invite the visitor to book. Call it alongside your short text reply — do not repeat the card details in prose.',
    input_schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['program', 'booking'] },
        program: { type: 'string', enum: ['fastforward', 'ai', 'collective'], description: 'Required when type is "program".' },
      },
      required: ['type'],
    },
  },
  {
    name: 'transfer_conversation',
    description: "Hand this conversation to a colleague who is better suited to help. First say one short, warm sentence to the visitor, then call this.",
    input_schema: {
      type: 'object',
      properties: {
        to: { type: 'string', enum: ['carolina', 'natasha', 'benjamin'], description: 'Which colleague should take over.' },
        reason: { type: 'string', description: 'Why you are handing off.' },
        user_name: { type: 'string', description: "The visitor's first name, if known." },
      },
      required: ['to'],
    },
  },
]

type LeadPatch = Record<string, unknown>
type ClientAction = { type: string; url?: string }
type ChatCard = { type: string; program?: string }

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
  ctx: { magnet: LeadMagnet | null; actions: ClientAction[]; cards: ChatCard[]; booked: { v: boolean }; email: { v: string | null }; recommended: string[] }
): Promise<string> {
  if (name === 'show_card') {
    const type = String(input.type || '')
    if (type === 'program') {
      const pg = String(input.program || '')
      if (['fastforward', 'ai', 'collective'].includes(pg)) { ctx.cards.push({ type: 'program', program: pg }); ctx.recommended.push(pg) }
    } else if (type === 'booking') {
      ctx.cards.push({ type: 'booking' }); ctx.recommended.push('strategy_call')
    }
    return JSON.stringify({ ok: true, shown: true })
  }

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
    ctx.email.v = email
    logActivity(email, 'chat', 'Captured in chat', sanitizeText(input.interest, 200) || sanitizeText(input.notes, 200) || undefined)
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

    // Attach files (images / PDFs) to the current turn only. Guardrail lives
    // in the system prompt: the AI only engages with them in a The5th context.
    const IMG_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    const rawAtts: Array<{ kind?: string; media_type?: string; data?: string }> = Array.isArray(body?.attachments) ? body.attachments : []
    const attBlocks: Anthropic.ContentBlockParam[] = []
    for (const a of rawAtts.slice(0, 5)) {
      const data = typeof a?.data === 'string' ? a.data : ''
      if (!data || data.length > 9_500_000) continue // ~7MB file
      if (a.kind === 'image' && IMG_TYPES.includes(String(a.media_type))) {
        attBlocks.push({ type: 'image', source: { type: 'base64', media_type: a.media_type as 'image/png', data } })
      } else if (a.kind === 'pdf') {
        attBlocks.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } })
      }
    }
    if (attBlocks.length) {
      const last = messages[messages.length - 1]
      const text = typeof last.content === 'string' ? last.content : ''
      last.content = [{ type: 'text', text: text || 'Please take a look at what I attached.' }, ...attBlocks]
    }

    const agentKey: AgentKey = AGENT_KEYS.includes(body?.agent) ? body.agent : 'carolina'
    const handoff = body?.handoff === true
    const context = sanitizeText(body?.context, 300) || null

    const settings = await loadSettings()
    const [magnet, agents] = await Promise.all([loadActiveLeadMagnet(settings), loadAgents()])
    const personas: Record<string, string | null> = {}
    for (const a of agents) personas[a.key] = a.persona
    if (settings.persona && !personas.carolina) personas.carolina = settings.persona

    let system = buildSystem({ agent: agentKey, personas, kb: settings.knowledge_base, magnet, timeZone, handoff, context })

    // ── AI Brain: intent, state, lead scoring, planning, memory + RAG ──
    const t0 = Date.now()
    const conversationId = sanitizeText(body?.conversationId, 80) || `ip:${ip}`
    const lastUser = incoming.filter((m) => m.role === 'user').pop()
    const lastText = lastUser ? sanitizeText(lastUser.content, 500) : ''
    let sources: Source[] = []
    let brainIntent = 'general', brainState = 'general', brainScore = 0
    try {
      const brain = await orchestrate({ conversationId, lastUserText: lastText, viewContext: context, handoff })
      sources = brain.sources; brainIntent = brain.intent; brainState = brain.state; brainScore = brain.score
      if (brain.context) system += `\n\n${brain.context}`
    } catch (e) {
      console.error('orchestrate failed', e)
    }

    const client = anthropic()
    const ctx = { magnet, actions: [] as ClientAction[], cards: [] as ChatCard[], booked: { v: false }, email: { v: null as string | null }, recommended: [] as string[] }

    // Persist session memory + one observability event (once per user turn).
    const finishTurn = () => {
      if (handoff) return
      persistTurn({
        conversationId, agent: agentKey, intent: brainIntent, state: brainState, score: brainScore,
        sources: sources.length, booked: ctx.booked.v, latencyMs: Date.now() - t0,
        email: ctx.email.v, recommended: ctx.recommended,
      })
    }

    for (let round = 0; round < 5; round++) {
      const res = await client.messages.create({ model: MODEL, max_tokens: 700, system, tools: TOOLS, messages })
      const toolUses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
      const text = res.content.filter((b) => b.type === 'text').map((b) => (b as Anthropic.TextBlock).text).join('\n').trim()

      // Handoff to a colleague — short-circuit and let the client play the human transfer.
      const transfer = toolUses.find((t) => t.name === 'transfer_conversation')
      if (transfer) {
        const input = (transfer.input || {}) as Record<string, unknown>
        const to = AGENT_KEYS.includes(input.to as AgentKey) ? (input.to as AgentKey) : 'benjamin'
        const userName = sanitizeText(input.user_name, 60) || null
        const fallback = `Let me bring in my colleague ${AGENTS[to].name} — they can help you with this properly.`
        finishTurn()
        return NextResponse.json({
          reply: text || fallback,
          agent: agentKey,
          transfer: { to, user_name: userName, agent_name: AGENTS[to].name },
          booked: ctx.booked.v,
          actions: ctx.actions,
          sources,
        })
      }

      if (toolUses.length === 0 || res.stop_reason !== 'tool_use') {
        finishTurn()
        return NextResponse.json({ reply: text || "I'm here — how can I help you today?", agent: agentKey, booked: ctx.booked.v, actions: ctx.actions, cards: ctx.cards, sources })
      }

      messages.push({ role: 'assistant', content: res.content })
      const results: Anthropic.ToolResultBlockParam[] = []
      for (const tu of toolUses) {
        const out = await runTool(tu.name, (tu.input || {}) as Record<string, unknown>, ctx)
        results.push({ type: 'tool_result', tool_use_id: tu.id, content: out })
      }
      messages.push({ role: 'user', content: results })
    }

    finishTurn()
    return NextResponse.json({ reply: 'Let me get the team to follow up — what is the best email to reach you?', agent: agentKey, booked: ctx.booked.v, actions: ctx.actions, sources })
  } catch (err) {
    console.error('carolina route error', err)
    return NextResponse.json({ error: 'Sorry, I hit a snag. Mind trying that again?' }, { status: 500 })
  }
}
