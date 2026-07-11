/* Tool Registry (3I.5) — the single catalog of tools the AI platform may invoke.
   The AI never calls an API directly; it calls a registered tool. Every tool
   declares metadata (risk, category, whether it mutates data) so the approval
   engine can gate execution. Read tools come from lib/ai/tools.ts (Command AI's
   grounded read layer); this module adds mutating ACTION tools on top. */
import type Anthropic from '@anthropic-ai/sdk'
import { TOOLS as READ_TOOLS, type Tool } from '@/lib/ai/tools'
import { createTask, addNote, updateContact, resolveContact } from '@/lib/crm'

type Row = Record<string, unknown>
export type Risk = 'low' | 'medium' | 'high'

export interface RegisteredTool extends Tool {
  risk: Risk
  category: string
  mutating: boolean
  provider?: string        // 'internal' | 'mcp:<slug>' | ...
}

const j = (v: unknown) => JSON.stringify(v)

// Category for each grounded read tool (all low-risk, read-only).
const READ_CATEGORY: Record<string, string> = {
  search_contacts: 'crm', get_contact_360: 'crm', list_members: 'crm', list_tasks: 'crm',
  revenue_metrics: 'revenue', pipeline_stats: 'sales', business_snapshot: 'analytics',
  search_meetings: 'meetings', get_meeting_detail: 'meetings',
  coaching_trends: 'coaching', recent_coaching_calls: 'coaching', search_knowledge: 'knowledge',
}

// ── Mutating action tools (gated by the approval engine) ──
const ACTION_TOOLS: RegisteredTool[] = [
  {
    risk: 'medium', category: 'crm', mutating: true, provider: 'internal',
    def: {
      name: 'create_task', description: 'Create a CRM follow-up task. Optionally attach it to a contact (by id or email).',
      input_schema: { type: 'object', properties: { title: { type: 'string' }, due_date: { type: 'string', description: 'YYYY-MM-DD' }, contact_id_or_email: { type: 'string' }, description: { type: 'string' } }, required: ['title'] },
    },
    run: async (i: Row) => {
      let contactId: string | null = null
      const key = String(i.contact_id_or_email || '')
      if (key) { const c = await resolveContact(key.includes('@') ? { email: key } : { id: key }); contactId = (c?.id as string) || null }
      const t = await createTask({ contactId, title: String(i.title || 'Follow up'), description: i.description ? String(i.description) : undefined, dueDate: (i.due_date as string) || null, kind: 'task' })
      return j({ ok: true, task_id: t?.id, title: t?.title })
    },
  },
  {
    risk: 'medium', category: 'crm', mutating: true, provider: 'internal',
    def: {
      name: 'add_contact_note', description: 'Add a note to a contact (by id or email). Use for logging insights, next steps or context.',
      input_schema: { type: 'object', properties: { contact_id_or_email: { type: 'string' }, body: { type: 'string' } }, required: ['contact_id_or_email', 'body'] },
    },
    run: async (i: Row) => {
      const key = String(i.contact_id_or_email || '')
      const c = await resolveContact(key.includes('@') ? { email: key } : { id: key })
      if (!c) return j({ error: 'contact not found' })
      const n = await addNote(c.id as string, String(i.body || ''), { author: 'agent' })
      return j({ ok: true, note_id: n?.id })
    },
  },
  {
    risk: 'high', category: 'crm', mutating: true, provider: 'internal',
    def: {
      name: 'update_contact_stage', description: 'Move a contact to a different pipeline stage. High-risk: changes CRM records and pipeline reporting.',
      input_schema: { type: 'object', properties: { contact_id_or_email: { type: 'string' }, pipeline_stage: { type: 'string' } }, required: ['contact_id_or_email', 'pipeline_stage'] },
    },
    run: async (i: Row) => {
      const key = String(i.contact_id_or_email || '')
      const c = await resolveContact(key.includes('@') ? { email: key } : { id: key })
      if (!c) return j({ error: 'contact not found' })
      const updated = await updateContact(c.id as string, { pipeline_stage: String(i.pipeline_stage || '') }, 'agent')
      return j({ ok: !!updated, contact_id: c.id, pipeline_stage: updated?.pipeline_stage })
    },
  },
  {
    risk: 'medium', category: 'sales', mutating: true, provider: 'internal',
    def: {
      name: 'draft_message', description: 'Draft an outbound message (email/DM) for review. Does NOT send — the draft is returned and stored on the execution for a human to send.',
      input_schema: { type: 'object', properties: { to: { type: 'string' }, subject: { type: 'string' }, body: { type: 'string' } }, required: ['body'] },
    },
    run: async (i: Row) => j({ ok: true, draft: { to: i.to || null, subject: i.subject || null, body: String(i.body || '') } }),
  },
]

// Read tools decorated with metadata → registered tools.
const READ_REGISTERED: RegisteredTool[] = READ_TOOLS.map((t) => ({
  ...t, risk: 'low' as Risk, category: READ_CATEGORY[t.def.name] || 'general', mutating: false, provider: 'internal',
}))

export const REGISTRY: RegisteredTool[] = [...READ_REGISTERED, ...ACTION_TOOLS]

export function getRegistered(name: string): RegisteredTool | undefined { return REGISTRY.find((t) => t.def.name === name) }
export function riskOf(name: string): Risk { return getRegistered(name)?.risk || 'high' }
export function isMutating(name: string): boolean { return !!getRegistered(name)?.mutating }

/** Anthropic tool defs for a set of allowed tool names (unknown names dropped). */
export function toolDefsFor(names: string[]): Anthropic.Tool[] {
  return REGISTRY.filter((t) => names.includes(t.def.name)).map((t) => t.def)
}

/** Metadata catalog for the admin UI. */
export function listRegistry() {
  return REGISTRY.map((t) => ({ name: t.def.name, description: t.def.description, risk: t.risk, category: t.category, mutating: t.mutating, provider: t.provider }))
}
