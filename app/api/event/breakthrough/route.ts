import { NextRequest, NextResponse } from 'next/server'
import { EMAILS } from '@/lib/event-campaign'
import { sendCampaignEmail, enrollBuyer, importRegistrants } from '@/lib/event-enroll'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/* Breakthrough Intensive campaign controller.

   POST actions (all require `secret === CRON_SECRET`, except `enroll` which is
   called server-to-server from the Whop webhook with the same secret):

     { action:'test', to, key? }        → preview: send one (or every) email to `to`
     { action:'enroll', email, name?, source? } → record registrant + send welcome
     { action:'send', key, email, name? }       → send one specific email to one person

   Sending goes through Resend (verified 10kroadmap.org sender). Every real send
   is logged in event_email_log with a unique(email,key) guard so nobody is
   double-emailed even if the cron runs twice. */

const authed = (req: NextRequest, bodySecret?: string) => {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.get('authorization')
  return header === `Bearer ${secret}` || bodySecret === secret
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  const action = String(body.action || '')
  if (!authed(req, typeof body.secret === 'string' ? body.secret : undefined)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    if (action === 'test') {
      const to = String(body.to || '')
      if (!to) return NextResponse.json({ error: 'to required' }, { status: 400 })
      const name = typeof body.name === 'string' ? body.name : 'Indrodip'
      const keys = body.key ? [String(body.key)] : EMAILS.map((e) => e.key)
      const results: Record<string, unknown> = {}
      for (const key of keys) {
        results[key] = await sendCampaignEmail({ key, to, name, log: false, unsubUrl: '#' })
      }
      return NextResponse.json({ ok: true, sentTo: to, results })
    }

    if (action === 'enroll') {
      const email = String(body.email || '')
      if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
      const name = typeof body.name === 'string' ? body.name : null
      const source = typeof body.source === 'string' ? body.source : 'whop'
      const r = await enrollBuyer(email, name, source)
      return NextResponse.json(r, { status: r.ok ? 200 : 500 })
    }

    if (action === 'send') {
      const email = String(body.email || '').trim().toLowerCase()
      const key = String(body.key || '')
      if (!email || !key) return NextResponse.json({ error: 'email + key required' }, { status: 400 })
      const name = typeof body.name === 'string' ? body.name : undefined
      const r = await sendCampaignEmail({ key, to: email, name, log: true })
      return NextResponse.json(r, { status: r.ok ? 200 : 500 })
    }

    if (action === 'import') {
      const list = body.list === 'buyer' ? 'buyer' : 'lead'
      let people: Array<{ email: string; name?: string | null }> = []

      if (body.from === 'crm') {
        // Pull leads straight from the CRM. Optional filters: lifecycle_stage, tag.
        const db = getSupabaseAdmin()
        let q = db.from('crm_contacts').select('email,name,first_name').not('email', 'is', null).limit(10000)
        if (typeof body.lifecycle_stage === 'string') q = q.eq('lifecycle_stage', body.lifecycle_stage)
        if (typeof body.tag === 'string') q = q.contains('tags', [body.tag])
        const { data, error } = await q
        if (error) return NextResponse.json({ error: String(error.message || error) }, { status: 500 })
        people = (data || []).map((r) => ({ email: String(r.email), name: r.name || r.first_name || null }))
      } else if (Array.isArray(body.contacts)) {
        people = (body.contacts as Array<Record<string, unknown>>).map((c) => ({ email: String(c.email || ''), name: (c.name as string) || null }))
      } else if (typeof body.emails === 'string') {
        people = body.emails.split(/[\s,;]+/).filter(Boolean).map((e) => ({ email: e }))
      } else {
        return NextResponse.json({ error: 'provide contacts[], emails string, or from:"crm"' }, { status: 400 })
      }

      const r = await importRegistrants(people, list, typeof body.source === 'string' ? body.source : 'import')
      return NextResponse.json({ ok: true, list, ...r })
    }

    if (action === 'stats') {
      const db = getSupabaseAdmin()
      const reg = db.from('event_registrants')
      const [leads, buyers, unsub, sent] = await Promise.all([
        reg.select('*', { count: 'exact', head: true }).eq('list', 'lead').eq('unsubscribed', false),
        reg.select('*', { count: 'exact', head: true }).eq('list', 'buyer').eq('unsubscribed', false),
        reg.select('*', { count: 'exact', head: true }).eq('unsubscribed', true),
        db.from('event_email_log').select('*', { count: 'exact', head: true }),
      ])
      return NextResponse.json({
        ok: true,
        leads: leads.count || 0,
        buyers: buyers.count || 0,
        unsubscribed: unsub.count || 0,
        emails_sent: sent.count || 0,
      })
    }

    return NextResponse.json({ error: `unknown action: ${action}` }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
