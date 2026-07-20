import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import { EMAIL_BY_KEY, FROM } from '@/lib/event-campaign'

/* Server-side send + enrollment helpers for the Breakthrough Intensive.
   Shared by the campaign API route and the Whop payment webhook. Every real
   send is logged (unique(email,email_key)) so retries never double-email. */

export async function sendCampaignEmail(opts: {
  key: string
  to: string
  name?: string
  log?: boolean
  unsubUrl?: string
}): Promise<{ ok: boolean; id?: string | null; error?: string }> {
  const def = EMAIL_BY_KEY[opts.key]
  if (!def) return { ok: false, error: `unknown email key: ${opts.key}` }
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: false, error: 'RESEND_API_KEY missing' }
  const resend = new Resend(key)
  const html = def.build({ name: opts.name, unsubUrl: opts.unsubUrl })
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: def.subject,
    html,
    text: def.preview,
  })
  if (error) return { ok: false, error: String((error as { message?: string }).message || error) }
  if (opts.log) {
    const db = getSupabaseAdmin()
    await db
      .from('event_email_log')
      .insert({ email: opts.to.toLowerCase(), email_key: opts.key, provider_id: data?.id || null })
      .then(() => {}, () => {})
  }
  return { ok: true, id: data?.id || null }
}

/** Record a buyer and send the welcome once. Safe to call repeatedly. */
export async function enrollBuyer(email: string, name?: string | null, source = 'whop') {
  const e = email.trim().toLowerCase()
  if (!e || !e.includes('@')) return { ok: false, error: 'invalid email' }
  const db = getSupabaseAdmin()
  await db
    .from('event_registrants')
    .upsert({ email: e, name: name || null, list: 'buyer', source, event_key: 'breakthrough' }, { onConflict: 'email' })
    .then(() => {}, () => {})
  const { data: seen } = await db.from('event_email_log').select('id').eq('email', e).eq('email_key', 'welcome').maybeSingle()
  if (seen) return { ok: true, welcome: 'already_sent' as const }
  const r = await sendCampaignEmail({ key: 'welcome', to: e, name: name || undefined, log: true })
  return { ok: r.ok, welcome: r }
}
