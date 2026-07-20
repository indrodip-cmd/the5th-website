// lib/platform/email.ts
// Platform email control — the founder's control surface over (a) every
// automated email flow the platform sends (pause/live/suspend + content
// override) and (b) one-off/scheduled broadcasts to community members.
// All sending goes through Resend via the shared provider layer. Server-only.

import { getSupabaseAdmin } from '@/lib/supabase'
import { getProvider } from '@/lib/comm/providers'

const sb = () => getSupabaseAdmin()
const FROM = process.env.PLATFORM_EMAIL_FROM || 'The5th <noreply@10kroadmap.org>'
/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Automated flows ──────────────────────────────────────────────────
export async function listFlows() {
  const { data } = await sb().from('platform_email_flows').select('*').order('category', { ascending: true }).order('name', { ascending: true })
  return data || []
}
export async function setFlowStatus(key: string, status: 'live' | 'paused' | 'suspended', actor?: string) {
  if (!['live', 'paused', 'suspended'].includes(status)) throw new Error('invalid status')
  const { error } = await sb().from('platform_email_flows').update({ status, updated_at: new Date().toISOString(), updated_by: actor || null }).eq('key', key)
  if (error) throw new Error(error.message)
  return { ok: true }
}
export async function saveFlowOverride(key: string, subject_override: string | null, body_override: string | null, actor?: string) {
  const { error } = await sb().from('platform_email_flows').update({ subject_override: subject_override || null, body_override: body_override || null, updated_at: new Date().toISOString(), updated_by: actor || null }).eq('key', key)
  if (error) throw new Error(error.message)
  return { ok: true }
}

// ── Audience resolution ──────────────────────────────────────────────
const AUDIENCE_TIERS: Record<string, string[] | null> = {
  all: null, // any active member
  paid: ['member_monthly', 'member_yearly', 'admin'],
  ai: ['ai_only', 'ai_trial'],
  members: ['member_monthly', 'member_yearly'],
  trial: ['ai_trial'],
}
export const AUDIENCES = Object.keys(AUDIENCE_TIERS)

async function audienceRecipients(audience: string) {
  let q = sb().from('members').select('email,full_name,tier,email_notifications,is_active').eq('is_active', true)
  const tiers = AUDIENCE_TIERS[audience]
  if (tiers) q = q.in('tier', tiers)
  const { data } = await q
  // Respect opt-out; skip rows without an email.
  return (data || []).filter((m: any) => m.email && m.email_notifications !== false)
}

// Basic branded wrapper so pasted content looks intentional.
function shell(subject: string, bodyHtml: string) {
  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e;line-height:1.6">
  <div style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#2E1A35;margin-bottom:16px">The5th</div>
  ${bodyHtml}
  <div style="margin-top:28px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#8A8075">You're receiving this as a member of The5th. <a href="{{unsub}}" style="color:#8A8075">Unsubscribe</a>.</div>
</div>`
}

async function sendOne(to: string, subject: string, bodyHtml: string) {
  const provider = getProvider('resend')
  if (!provider) return { ok: false, error: 'resend provider missing' }
  const unsub = `https://the5th.consulting/unsubscribe?email=${encodeURIComponent(to)}`
  const html = shell(subject, bodyHtml).replace('{{unsub}}', unsub)
  return provider.send({ from: FROM, to, subject, html, listUnsubscribe: unsub } as any)
}

// ── Broadcasts ───────────────────────────────────────────────────────
export async function listBroadcasts() {
  const { data } = await sb().from('platform_email_broadcasts').select('*').order('created_at', { ascending: false }).limit(50)
  return data || []
}

export async function createBroadcast(p: { subject: string; body: string; audience: string; scheduled_at?: string | null; actor?: string }) {
  const status = p.scheduled_at ? 'scheduled' : 'draft'
  const { data, error } = await sb().from('platform_email_broadcasts')
    .insert({ subject: p.subject, body: p.body, audience: AUDIENCES.includes(p.audience) ? p.audience : 'all', status, scheduled_at: p.scheduled_at || null, created_by: p.actor || null })
    .select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function pauseBroadcast(id: string) {
  await sb().from('platform_email_broadcasts').update({ status: 'paused' }).eq('id', id).eq('status', 'scheduled')
  return { ok: true }
}
export async function resumeBroadcast(id: string) {
  await sb().from('platform_email_broadcasts').update({ status: 'scheduled' }).eq('id', id).eq('status', 'paused')
  return { ok: true }
}
export async function cancelBroadcast(id: string) {
  await sb().from('platform_email_broadcasts').update({ status: 'canceled' }).eq('id', id).in('status', ['draft', 'scheduled', 'paused'])
  return { ok: true }
}

export async function sendTest(to: string, subject: string, body: string) {
  const r = await sendOne(to, `[TEST] ${subject}`, body)
  if (!r.ok) throw new Error(r.error || 'send failed')
  return { ok: true }
}

// Send a broadcast now (also used by the cron for scheduled ones).
export async function sendBroadcast(id: string) {
  const s = sb()
  const { data: b } = await s.from('platform_email_broadcasts').select('*').eq('id', id).single()
  if (!b) throw new Error('broadcast not found')
  if (b.status === 'sent' || b.status === 'sending' || b.status === 'canceled') return { ok: true, skipped: b.status }
  const recipients = await audienceRecipients(b.audience)
  await s.from('platform_email_broadcasts').update({ status: 'sending', total: recipients.length }).eq('id', id)
  let sent = 0
  for (const m of recipients) {
    const r = await sendOne(m.email, b.subject, b.body)
    if (r.ok) sent++
    if (sent % 25 === 0) await s.from('platform_email_broadcasts').update({ sent_count: sent }).eq('id', id)
  }
  await s.from('platform_email_broadcasts').update({ status: 'sent', sent_count: sent, sent_at: new Date().toISOString() }).eq('id', id)
  return { ok: true, sent, total: recipients.length }
}

// Cron entry: dispatch any scheduled broadcast whose time has arrived.
export async function dispatchScheduled() {
  const { data } = await sb().from('platform_email_broadcasts').select('id').eq('status', 'scheduled').lte('scheduled_at', new Date().toISOString())
  let ran = 0
  for (const row of data || []) { await sendBroadcast(row.id); ran++ }
  return { dispatched: ran }
}

// Live audience size preview for the composer.
export async function audienceCount(audience: string) {
  return (await audienceRecipients(audience)).length
}
