/* Email Design Studio — AI template generator + design-quality reviewer (3I.8A.2).
   Command AI drafts a full block-based email from a prompt and scores designs on
   hierarchy, brand, CTA, accessibility, mobile and balance before they ship. */
import { anthropic, modelFor } from '@/lib/ai/router'
import { logAiEvent } from '@/lib/ai-usage'
import { BLOCK_DEFS, defaultBlock, type Block } from '@/lib/email/render'

type Row = Record<string, unknown>
function extract(text: string): Row | null { try { return JSON.parse(text) } catch {}; const m = text.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]) } catch {} } return null }

const TYPES = BLOCK_DEFS.map((b) => `${b.type}(${Object.keys(b.defaults).join(',') || 'no props'})`).join('; ')

const GEN_SYSTEM = `You design marketing/lifecycle emails for The5th (helps professionals 40+ turn expertise into income; calm, confident, premium, never hypey). Return ONLY minified JSON:
{"name":"template name","subject":"subject line (may use {{first_name}})","design":{"blocks":[{"type":"...","props":{...}}]}}
Valid block types and their prop keys: ${TYPES}.
Rules: open with a heading, keep it skimmable, one clear primary CTA (button or cta block), personalize with {{first_name}}. 6-12 blocks. Use premium blocks (cta, pricing, testimonial, guarantee, product) where they fit. Copy must be specific and on-brand, never placeholder lorem.`

export async function generateEmailDesign(prompt: string, actor?: string): Promise<{ ok: boolean; template?: Row; error?: string }> {
  const ai = anthropic(); if (!ai) return { ok: false, error: 'AI not configured' }
  const model = modelFor('chat'); const t0 = Date.now()
  const msg = await ai.messages.create({ model, max_tokens: 2000, system: GEN_SYSTEM, messages: [{ role: 'user', content: prompt.slice(0, 1500) }] })
  await logAiEvent({ endpoint: 'email_generate', model, usage: msg.usage, latencyMs: Date.now() - t0, email: actor })
  const text = msg.content.find((b) => b.type === 'text')
  const parsed = extract(text && text.type === 'text' ? text.text : '')
  if (!parsed?.design) return { ok: false, error: 'Could not generate. Try rephrasing.' }
  const valid = new Set(BLOCK_DEFS.map((b) => b.type))
  const blocks: Block[] = (((parsed.design as Row).blocks as Row[]) || []).filter((b) => valid.has(b.type as string)).map((b) => ({ ...defaultBlock(b.type as string), props: { ...(defaultBlock(b.type as string).props), ...(b.props as Row) } }))
  if (!blocks.length) return { ok: false, error: 'No usable blocks generated.' }
  return { ok: true, template: { name: String(parsed.name || 'Generated email'), subject: String(parsed.subject || ''), channel: 'email', design: { blocks }, status: 'draft' } }
}

const REVIEW_SYSTEM = `You are a senior email designer reviewing a marketing email for The5th before it ships. Score 0-100 and return ONLY minified JSON:
{"score":<0-100>,"breakdown":{"visual_hierarchy":<0-100>,"brand_consistency":<0-100>,"cta_clarity":<0-100>,"accessibility":<0-100>,"mobile":<0-100>,"content_balance":<0-100>},"summary":"one line","suggestions":["specific, actionable improvement", ...]}
Judge hierarchy, a single clear CTA, brand tone, alt text / contrast / heading order (accessibility), mobile friendliness, and image/text balance. Be specific; 3-6 suggestions.`

export async function reviewDesign(input: { subject?: string; blocks: Block[] }, actor?: string): Promise<{ ok: boolean; review?: Row; error?: string }> {
  const ai = anthropic(); if (!ai) return { ok: false, error: 'AI not configured' }
  const model = modelFor('chat'); const t0 = Date.now()
  const digest = `Subject: ${input.subject || '(none)'}\nBlocks:\n` + input.blocks.map((b, i) => `${i + 1}. ${b.type} ${JSON.stringify(b.props).slice(0, 160)}`).join('\n')
  const msg = await ai.messages.create({ model, max_tokens: 800, system: REVIEW_SYSTEM, messages: [{ role: 'user', content: digest.slice(0, 6000) }] })
  await logAiEvent({ endpoint: 'email_review', model, usage: msg.usage, latencyMs: Date.now() - t0, email: actor })
  const text = msg.content.find((b) => b.type === 'text')
  const parsed = extract(text && text.type === 'text' ? text.text : '')
  if (!parsed) return { ok: false, error: 'Review failed.' }
  return { ok: true, review: parsed }
}
