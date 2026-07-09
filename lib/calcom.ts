/* ── cal.com integration helpers for the Carolina concierge ──
   Uses the cal.com v2 API. A single cal.com API key (starts with "cal_")
   authenticates via Bearer. Every function fails soft — on any error it
   returns a safe empty/negative result and logs, so the chat never breaks. */

const CAL_BASE = 'https://api.cal.com/v2'
const SLOTS_API_VERSION = '2024-09-04'
const BOOKINGS_API_VERSION = '2024-08-13'

export const CAL_PUBLIC_LINK = 'https://cal.com/indrodip-ghosh-ut1vxh/60min'

export function calKey(): string | null {
  return (
    process.env.CALCOM_API_KEY ||
    process.env.CAL_COM_API_KEY ||
    process.env.CAL_COM ||
    null
  )
}

function headers(apiVersion: string, key: string) {
  return {
    Authorization: `Bearer ${key}`,
    'cal-api-version': apiVersion,
    'Content-Type': 'application/json',
  }
}

export interface Slot {
  /** ISO 8601 start time, e.g. 2026-07-15T14:00:00.000Z */
  start: string
}

let cachedEventTypeId: number | null = null

/** Resolve the event type id to book against. Prefers an explicit env
    override, otherwise discovers the account's first event type. */
export async function getEventTypeId(): Promise<number | null> {
  const override = process.env.CALCOM_EVENT_TYPE_ID
  if (override && /^\d+$/.test(override)) return Number(override)
  if (cachedEventTypeId) return cachedEventTypeId

  const key = calKey()
  if (!key) return null
  try {
    const r = await fetch(`${CAL_BASE}/event-types`, {
      headers: headers('2024-06-14', key),
      cache: 'no-store',
    })
    if (!r.ok) return null
    const j = await r.json()
    const list =
      j?.data?.eventTypeGroups?.flatMap((g: { eventTypes?: unknown[] }) => g.eventTypes || []) ||
      j?.data ||
      []
    // Prefer a ~60 minute event; otherwise take the first one.
    const chosen =
      list.find((e: { lengthInMinutes?: number; length?: number }) => (e.lengthInMinutes || e.length) === 60) ||
      list[0]
    if (chosen?.id) {
      cachedEventTypeId = Number(chosen.id)
      return cachedEventTypeId
    }
    return null
  } catch (e) {
    console.error('calcom getEventTypeId failed', e)
    return null
  }
}

/** Fetch bookable slots between two dates for a given timezone.
    Returns up to `maxPerDay` slots per day, flattened and sorted. */
export async function getSlots(
  timeZone: string,
  daysAhead = 10,
  maxPerDay = 4
): Promise<Slot[]> {
  const key = calKey()
  const eventTypeId = await getEventTypeId()
  if (!key || !eventTypeId) return []

  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() + daysAhead)

  try {
    const url = new URL(`${CAL_BASE}/slots`)
    url.searchParams.set('eventTypeId', String(eventTypeId))
    url.searchParams.set('start', start.toISOString())
    url.searchParams.set('end', end.toISOString())
    url.searchParams.set('timeZone', timeZone || 'UTC')

    const r = await fetch(url.toString(), {
      headers: headers(SLOTS_API_VERSION, key),
      cache: 'no-store',
    })
    if (!r.ok) return []
    const j = await r.json()

    // v2 shape: { data: { "2026-07-15": [{ start }], ... } }
    const byDay: Record<string, Array<{ start: string }>> = j?.data || {}
    const out: Slot[] = []
    for (const day of Object.keys(byDay).sort()) {
      const daySlots = (byDay[day] || []).slice(0, maxPerDay)
      for (const s of daySlots) if (s?.start) out.push({ start: s.start })
    }
    return out
  } catch (e) {
    console.error('calcom getSlots failed', e)
    return []
  }
}

export interface BookingResult {
  ok: boolean
  bookingId?: number | string
  start?: string
  meetingUrl?: string
  error?: string
}

/** Create a confirmed booking for the given attendee at `startISO`. */
export async function createBooking(opts: {
  startISO: string
  name: string
  email: string
  timeZone: string
  notes?: string
}): Promise<BookingResult> {
  const key = calKey()
  const eventTypeId = await getEventTypeId()
  if (!key || !eventTypeId) return { ok: false, error: 'booking_unavailable' }

  try {
    const r = await fetch(`${CAL_BASE}/bookings`, {
      method: 'POST',
      headers: headers(BOOKINGS_API_VERSION, key),
      body: JSON.stringify({
        start: opts.startISO,
        eventTypeId,
        attendee: {
          name: opts.name,
          email: opts.email,
          timeZone: opts.timeZone || 'UTC',
          language: 'en',
        },
        bookingFieldsResponses: opts.notes ? { notes: opts.notes } : undefined,
        metadata: { source: 'carolina-web-concierge' },
      }),
      cache: 'no-store',
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) {
      console.error('calcom createBooking non-ok', r.status, j)
      return { ok: false, error: j?.error?.message || `status_${r.status}` }
    }
    const data = j?.data || {}
    return {
      ok: true,
      bookingId: data.uid || data.id,
      start: data.start || opts.startISO,
      meetingUrl: data.meetingUrl || data.location,
    }
  } catch (e) {
    console.error('calcom createBooking failed', e)
    return { ok: false, error: 'exception' }
  }
}
