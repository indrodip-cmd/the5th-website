import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeText } from '@/lib/validation'
import { sessionEnabled, sessionEmail } from '@/lib/session'

function getAnthropicClient() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }) }

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req)
    const ipLimit = await limit(`coach:ip:${ip}`, 30, 600)
    if (!ipLimit.ok) return NextResponse.json({ error: 'Too many messages. Please slow down.' }, { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfter) } })

    const body = await req.json().catch(() => null)
    const message = sanitizeText(body?.message, 2000)
    // AUTHORIZATION: this returns the lead's private data, so trust the signed session (not body email) when enabled.
    const bodyEmail = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const sessEmail = sessionEmail(req)
    if (sessionEnabled() && !sessEmail) return NextResponse.json({ error: 'Please verify your email to use the coach.' }, { status: 401 })
    const email = sessionEnabled() ? (sessEmail || '') : bodyEmail
    if (!isValidEmail(email) || !message) return NextResponse.json({ error: 'Valid email and message required' }, { status: 400 })

    const emailLimit = await limit(`coach:email:${email}`, 40, 3600)
    if (!emailLimit.ok) return NextResponse.json({ error: 'Message limit reached, please try later.' }, { status: 429 })

    const { data: lead } = await getSupabaseAdmin()
      .from('quiz_leads')
      .select('*')
      .eq('email', email)
      .single()

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const answersStr = lead.answers ? JSON.stringify(lead.answers) : 'No answers on file'
    const systemPrompt = `You are a business coach helping ${lead.name} make their first $5K online. Their situation based on their quiz: ${answersStr}. They are on Day ${lead.current_day || 1} of 15. Give specific actionable advice tailored to their exact situation. Keep it to 2-3 paragraphs max. End with one concrete action they can take today.`

    const msg = await getAnthropicClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    })

    const response = msg.content[0].type === 'text' ? msg.content[0].text : 'Sorry, I could not generate a response.'

    // Save to logs
    await getSupabaseAdmin().from('ai_coaching_logs').insert({
      lead_id: lead.id,
      message,
      response
    })

    return NextResponse.json({ response })
  } catch (err) {
    console.error('ai-coach error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
