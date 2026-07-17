/* AI communication writer (3I.8A.4) — drafts emails / SMS / subject lines
   grounded in the contact's CRM 360 (profile, activity, meetings, notes).
   Used from the CRM Communication tab. Never invents facts. */
import { anthropic, modelFor } from '@/lib/ai/router'
import { logAiEvent } from '@/lib/ai-usage'
import { contactContext } from '@/lib/ai-coach'

type Row = Record<string, unknown>
function extract(t: string): Row | null { try { return JSON.parse(t) } catch {}; const m = t.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]) } catch {} } return null }
async function ctxFor(contactId: string): Promise<string> { try { return JSON.stringify(await contactContext(contactId)).slice(0, 6000) } catch { return '' } }
const text = (m: { content: Array<{ type: string }> }) => { const b = m.content.find((x) => x.type === 'text') as { text?: string } | undefined; return b?.text || '' }

const BRAND = 'The5th helps professionals 40+ turn their expertise into income. Voice: calm, confident, warm, specific — never hypey, never pushy, never fabricate results.'

export async function writeEmail(contactId: string, brief: string, actor?: string): Promise<Row> {
  const ai = anthropic(); if (!ai) return { ok: false, error: 'AI not configured' }
  const model = modelFor('chat'); const t0 = Date.now()
  const msg = await ai.messages.create({ model, max_tokens: 900, system: `${BRAND}\nWrite a personalized email. Return ONLY minified JSON {"subject":"...","body":"text or simple HTML with {{first_name}}"}. One clear CTA. Ground everything in the provided customer context; if you lack a fact, keep it general rather than inventing.`, messages: [{ role: 'user', content: `Customer context:\n${await ctxFor(contactId)}\n\nWrite: ${brief}` }] })
  await logAiEvent({ endpoint: 'crm_ai_email', model, usage: msg.usage, latencyMs: Date.now() - t0, email: actor })
  const p = extract(text(msg)); if (!p) return { ok: false, error: 'generation failed' }
  return { ok: true, subject: p.subject || '', body: p.body || '' }
}

export async function writeSms(contactId: string, brief: string, actor?: string): Promise<Row> {
  const ai = anthropic(); if (!ai) return { ok: false, error: 'AI not configured' }
  const model = modelFor('cheap'); const t0 = Date.now()
  const msg = await ai.messages.create({ model, max_tokens: 300, system: `${BRAND}\nWrite ONE concise SMS (<= 320 chars), friendly, with a clear next step. Return ONLY minified JSON {"text":"..."} — may use {{first_name}}.`, messages: [{ role: 'user', content: `Customer context:\n${await ctxFor(contactId)}\n\nWrite: ${brief}` }] })
  await logAiEvent({ endpoint: 'crm_ai_sms', model, usage: msg.usage, latencyMs: Date.now() - t0, email: actor })
  const p = extract(text(msg)); if (!p) return { ok: false, error: 'generation failed' }
  return { ok: true, text: p.text || '' }
}

export async function subjectLines(topic: string, actor?: string): Promise<Row> {
  const ai = anthropic(); if (!ai) return { ok: false, error: 'AI not configured' }
  const model = modelFor('chat'); const t0 = Date.now()
  const msg = await ai.messages.create({ model, max_tokens: 700, system: `${BRAND}\nGenerate 10 subject lines for the topic. Return ONLY minified JSON {"subjects":[{"text":"...","open_prediction":<0-100>,"curiosity":<0-100>,"spam_risk":<0-100>}]}. Vary curiosity/urgency/personalization; keep spam risk low.`, messages: [{ role: 'user', content: topic.slice(0, 500) }] })
  await logAiEvent({ endpoint: 'crm_ai_subjects', model, usage: msg.usage, latencyMs: Date.now() - t0, email: actor })
  const p = extract(text(msg)); if (!p?.subjects) return { ok: false, error: 'generation failed' }
  return { ok: true, subjects: p.subjects }
}
