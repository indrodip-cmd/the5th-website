import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'

function getAnthropicClient() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }) }

export async function POST(req: NextRequest) {
  try {
    const { email, message } = await req.json()
    if (!email || !message) return NextResponse.json({ error: 'Email and message required' }, { status: 400 })

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
