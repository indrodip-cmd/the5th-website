/* AI Campaign Builder (3I.8A.4) — the flagship. Turns a plain-English brief
   ("a 21-day nurture for quiz-completers who haven't booked") into a real,
   editable email sequence: AI plans the audience + steps, then generates an
   actual branded email design for each step and wires it into the drip engine. */
import { anthropic, modelFor } from '@/lib/ai/router'
import { logAiEvent } from '@/lib/ai-usage'
import { generateEmailDesign } from '@/lib/email/ai'
import { renderEmail, type Brand } from '@/lib/email/render'
import { getSupabaseAdmin } from '@/lib/supabase'

type Row = Record<string, unknown>
function extract(t: string): Row | null { try { return JSON.parse(t) } catch {}; const m = t.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]) } catch {} } return null }
async function getBrand(): Promise<Brand> {
  const { data } = await getSupabaseAdmin().from('email_brand').select('*').eq('id', 1).maybeSingle()
  return (data as unknown as Brand) || ({ company_name: 'The5th', primary_color: '#3D2645', secondary_color: '#160D1A', accent_color: '#C9A84C', text_color: '#2b2530', bg_color: '#f4f2f6', radius: 12, font: 'Inter, Arial, sans-serif', width: 600 } as Brand)
}

const PLAN_SYSTEM = `You are a senior lifecycle-marketing strategist for The5th (helps women 40+ turn expertise into income; calm, confident, premium). Turn the brief into an email nurture sequence. Return ONLY minified JSON:
{"name":"campaign name","goal":"the objective","audience":{"tags":[],"lifecycle_stage":"","pipeline_stage":"","min_score":0},"steps":[{"delay_hours":<wait before THIS email>,"subject":"subject line","brief":"exactly what this email should say and its CTA"}]}
Rules: 3-6 steps spread across the timeframe in the brief (delay_hours is the wait before each step; step 1 is usually 0). Omit audience fields you can't infer. Each step has a distinct purpose (welcome → value → proof → objection → offer). Briefs are specific and on-brand — no lorem.`

export async function generateCampaign(brief: string, actor?: string): Promise<Row> {
  const ai = anthropic(); if (!ai) return { ok: false, error: 'AI not configured' }
  const db = getSupabaseAdmin()
  const model = modelFor('chat'); const t0 = Date.now()
  const msg = await ai.messages.create({ model, max_tokens: 1500, system: PLAN_SYSTEM, messages: [{ role: 'user', content: brief.slice(0, 1500) }] })
  await logAiEvent({ endpoint: 'ai_campaign_plan', model, usage: msg.usage, latencyMs: Date.now() - t0, email: actor })
  const b = msg.content.find((x) => x.type === 'text') as { text?: string } | undefined
  const plan = extract(b?.text || ''); if (!plan?.steps) return { ok: false, error: 'Could not plan the campaign. Try rephrasing.' }

  const brand = await getBrand()
  const { data: seq } = await db.from('comm_sequences').insert({ name: String(plan.name || 'AI campaign'), description: (plan.goal as string) || null, goal: (plan.goal as string) || null, status: 'draft', audience: plan.audience || {}, created_by: actor }).select('id,name').single()
  if (!seq) return { ok: false, error: 'Could not create sequence' }

  const steps = ((plan.steps as Row[]) || []).slice(0, 5)
  let order = 0
  for (const st of steps) {
    let templateId: string | null = null
    let subject = String(st.subject || '')
    const gen = await generateEmailDesign(`Subject: ${st.subject}. ${st.brief}`, actor).catch(() => ({ ok: false }))
    if ((gen as Row).ok && (gen as Row).template) {
      const tplGen = (gen as Row).template as Row
      const html = renderEmail(tplGen.design as { blocks?: never[] }, brand)
      subject = (tplGen.subject as string) || subject
      const { data: tpl } = await db.from('comm_templates').insert({ name: `${seq.name} · Step ${order + 1}`, channel: 'email', category: 'sequence', subject, design: tplGen.design, body: html, status: 'published', created_by: actor }).select('id').single()
      templateId = (tpl?.id as string) || null
    }
    await db.from('comm_sequence_steps').insert({ sequence_id: seq.id, step_order: order, template_id: templateId, subject, delay_hours: Number(st.delay_hours) || 24 })
    order++
  }
  return { ok: true, sequence_id: seq.id, name: seq.name, goal: plan.goal, audience: plan.audience, steps: steps.length }
}
