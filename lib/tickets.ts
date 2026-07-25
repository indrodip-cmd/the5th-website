import { getSupabaseAdmin } from '@/lib/supabase'
import { resolveContact } from '@/lib/crm'
import { sendTicketEmail } from '@/lib/carolina-email'

// Support / bug tickets for the public website. Written from the /help page
// ticket form and from Carolina (the AI concierge) via the report_issue tool.
// The service-role client bypasses RLS; the table has RLS on with no policies.

export const TICKET_CATEGORIES = ['bug', 'question', 'billing', 'account', 'feedback', 'other'] as const
export const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const
export type TicketCategory = (typeof TICKET_CATEGORIES)[number]
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export type Ticket = {
  id: string
  ref: string
  created_at: string
  updated_at: string
  name: string | null
  email: string | null
  category: string
  subject: string | null
  message: string
  page_url: string | null
  user_agent: string | null
  status: string
  priority: string
  source: string
  contact_id: string | null
  admin_notes: string | null
}

function makeRef(): string {
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase()
  const t = Date.now().toString(36).slice(-3).toUpperCase()
  return `TKT-${t}${rnd}`
}

export type NewTicket = {
  message: string
  email?: string | null
  name?: string | null
  subject?: string | null
  category?: string | null
  pageUrl?: string | null
  userAgent?: string | null
  source?: string
  priority?: string
}

export async function createTicket(input: NewTicket): Promise<{ id: string; ref: string }> {
  const message = String(input.message || '').trim()
  if (!message) throw new Error('Message is required')

  const category = TICKET_CATEGORIES.includes(String(input.category) as TicketCategory)
    ? String(input.category)
    : 'other'

  const email = input.email ? String(input.email).trim().toLowerCase() : null

  // Best-effort: link the ticket to an existing CRM contact.
  let contactId: string | null = null
  if (email) {
    try {
      const contact = await resolveContact({ email })
      contactId = (contact?.id as string) || null
    } catch {
      /* non-blocking */
    }
  }

  const sb = getSupabaseAdmin()
  // Retry once on the (extremely unlikely) ref collision.
  for (let attempt = 0; attempt < 3; attempt++) {
    const ref = makeRef()
    const { data, error } = await sb
      .from('support_tickets')
      .insert({
        ref,
        message: message.slice(0, 8000),
        email,
        name: input.name ? String(input.name).trim().slice(0, 160) : null,
        subject: input.subject ? String(input.subject).trim().slice(0, 200) : null,
        category,
        page_url: input.pageUrl ? String(input.pageUrl).slice(0, 500) : null,
        user_agent: input.userAgent ? String(input.userAgent).slice(0, 500) : null,
        source: input.source || 'website',
        priority: input.priority || 'normal',
        contact_id: contactId,
      })
      .select('id, ref')
      .single()

    if (!error && data) {
      // Email the team on every ticket (form + Carolina). Fail-soft.
      try {
        await sendTicketEmail({
          ref: data.ref as string,
          category,
          name: input.name ? String(input.name) : null,
          email,
          subject: input.subject ? String(input.subject) : null,
          message,
          pageUrl: input.pageUrl ? String(input.pageUrl) : null,
          source: input.source || 'website',
        })
      } catch {
        /* non-blocking */
      }
      return { id: data.id as string, ref: data.ref as string }
    }
    // 23505 = unique_violation on ref → try a new ref.
    if (error && (error as { code?: string }).code !== '23505') throw error
  }
  throw new Error('Could not create ticket')
}

export async function listTickets(opts: { status?: string; limit?: number } = {}): Promise<Ticket[]> {
  const sb = getSupabaseAdmin()
  let q = sb.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(opts.limit || 200)
  if (opts.status && TICKET_STATUSES.includes(opts.status as TicketStatus)) q = q.eq('status', opts.status)
  const { data, error } = await q
  if (error) throw error
  return (data || []) as Ticket[]
}

export async function updateTicket(
  id: string,
  patch: { status?: string; priority?: string; admin_notes?: string }
): Promise<void> {
  const sb = getSupabaseAdmin()
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.status && TICKET_STATUSES.includes(patch.status as TicketStatus)) update.status = patch.status
  if (patch.priority) update.priority = patch.priority
  if (typeof patch.admin_notes === 'string') update.admin_notes = patch.admin_notes.slice(0, 4000)
  const { error } = await sb.from('support_tickets').update(update).eq('id', id)
  if (error) throw error
}
