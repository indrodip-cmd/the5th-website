import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/validation'
import { adminEmail } from '@/lib/session'
import { createTicket, listTickets, updateTicket, TICKET_STATUSES } from '@/lib/tickets'
import { notify } from '@/lib/notifications'
import { emitEvent } from '@/lib/events'

// Public: file a support / bug ticket from the /support page.
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`ticket:ip:${ip}`, 8, 600)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  try {
    const body = await req.json().catch(() => ({}))
    const message = String(body?.message || '').trim()
    if (message.length < 5) {
      return NextResponse.json({ error: 'Please describe the issue in a little more detail.' }, { status: 400 })
    }
    const email = body?.email ? String(body.email).trim() : ''
    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: 'That email does not look right.' }, { status: 400 })
    }

    const { ref } = await createTicket({
      message,
      email: email || null,
      name: body?.name || null,
      subject: body?.subject || null,
      category: body?.category || null,
      pageUrl: body?.pageUrl || req.headers.get('referer') || null,
      userAgent: req.headers.get('user-agent') || null,
      source: body?.source === 'carolina' ? 'carolina' : 'website',
    })

    notify('ticket', `New ${body?.category || 'support'} ticket ${ref}`, message.slice(0, 240), {
      ref,
      email: email || null,
      category: body?.category || 'other',
    }).catch(() => {})
    emitEvent('ticket_created', { ref, category: body?.category || 'other', email: email || null }).catch(() => {})

    return NextResponse.json({ ok: true, ref })
  } catch (e) {
    console.error('ticket create error:', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Something went wrong. Please email support@10kroadmap.org.' }, { status: 500 })
  }
}

// Admin: list tickets.
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const status = new URL(req.url).searchParams.get('status') || undefined
  try {
    const tickets = await listTickets({ status })
    return NextResponse.json({ tickets })
  } catch (e) {
    console.error('ticket list error:', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Failed to load tickets' }, { status: 500 })
  }
}

// Admin: update a ticket (status / priority / notes).
export async function PATCH(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json().catch(() => ({}))
    const id = String(body?.id || '')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    if (body?.status && !TICKET_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    await updateTicket(id, { status: body?.status, priority: body?.priority, admin_notes: body?.admin_notes })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('ticket update error:', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}
