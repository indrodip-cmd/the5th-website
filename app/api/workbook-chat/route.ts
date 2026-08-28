import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { limit, clientIp } from '@/lib/rateLimit'

/* Dedicated, self-contained sales concierge for the /workbook landing page.
   Small + focused: it knows the book, the price, the $5K guarantee, the
   bonuses, and its one job is to answer objections and move the visitor to
   check out. Graceful fallback if the model/key is unavailable so the widget
   never breaks the page. */

export const maxDuration = 30
const MODEL = 'claude-sonnet-4-6'

const CHECKOUT_URL = 'https://whop.com/checkout/plan_9p1vwkc9eoH2H'

const SYSTEM = `You are "Ivy", the warm, sharp concierge for THE KNOWLEDGE ASSET — a $7.93 digital workbook by Indrodip Ghosh & Christinee Mathison, part of The5th Consulting.

YOUR JOB: help the visitor decide, answer objections honestly, and move them to buy. Be human, brief, and confident. Never pushy or hypey. You are chatting in a small widget, so keep replies to 1–3 short sentences. Ask one question at a time. Use the visitor's words back to them.

THE PRODUCT:
- The Knowledge Asset: a build-as-you-go workbook. You don't just read it — you build your product, offer, audience, content, and launch inside it.
- 9 chapters + "Your Next 24 Hours" finale, interactive exercises, worksheets, the $7 → $10K product ladder.
- Price: $7.93, one time, lifetime access. Instant digital delivery.
- 4 bonuses included: (1) FLAGSHIP — a 7-day FREE trial of The5th AI (an AI business co-pilot that builds your product/offer/content with you), (2) 90-Day Content Calendar, (3) Product Blueprint Template, (4) Offer Stack Builder.
- Authors: Indrodip Ghosh (digital product strategist; guided 20+ clients to their first $10K months) and Christinee Mathison (mindset coach).

THE GUARANTEE (lead with this on price objections):
- The $5K Promise: work through the workbook, do the exercises, and if you don't build toward $5,000/month, you get a full refund — every penny. 365-day window. It removes all the risk from the visitor.

WHO IT'S FOR: coaches, consultants, healers, creators, experts, and service providers who are tired of trading time for money and want to package what they know into a digital product.

HOW TO CLOSE:
- When the visitor is warm or asks how to buy, give them the checkout link: ${CHECKOUT_URL} (or tell them to tap the green "Get the book — $7.93" button on the page).
- If they hesitate, find the ONE thing holding them back and address just that.
- Common objections: "no time" → it's build-as-you-go, one exercise at a time; "will it work for me?" → the $5K promise means zero risk; "is it just another book?" → no, it's a workbook you build a real product inside; "$10k realistic?" → it's a roadmap/target, not a promise; results depend on the work.

RULES: Be truthful. Never invent testimonials, numbers, or claims beyond the above. Never promise guaranteed income — the $5K promise is a money-back guarantee on the purchase, not a guarantee of business results. Keep it short.`

const FALLBACK = "I'm just stepping away for a sec — but here's the short version: The Knowledge Asset is $7.93, comes with a 7-day free trial of The5th AI plus 3 more bonuses, and it's protected by our $5K promise (build toward $5,000/month or a full refund). Tap the green “Get the book” button to start. Anything you want to know?"

type Msg = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req)
    const rl = await limit(`workbook-chat:${ip}`, 30, 60)
    if (!rl.ok) return NextResponse.json({ reply: "You're going quick! Give me a few seconds and try again." }, { status: 200 })

    const body = await req.json().catch(() => ({}))
    const raw: Msg[] = Array.isArray(body?.messages) ? body.messages : []
    const messages = raw
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return NextResponse.json({ reply: FALLBACK }, { status: 200 })
    }
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ reply: FALLBACK }, { status: 200 })

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 320,
      system: SYSTEM,
      messages,
    })
    const reply = resp.content.filter((b) => b.type === 'text').map((b) => (b as { text: string }).text).join('').trim()
    return NextResponse.json({ reply: reply || FALLBACK }, { status: 200 })
  } catch {
    return NextResponse.json({ reply: FALLBACK }, { status: 200 })
  }
}
