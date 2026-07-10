/* Fathom — meeting recordings/transcripts/summaries.
   Credential-gated: no-ops until FATHOM_API_KEY is set. Endpoint shapes are
   defensive (Fathom's API evolves); the normalizer tolerates missing fields. */

export function fathomConfigured(): boolean {
  return !!process.env.FATHOM_API_KEY
}

const BASE = 'https://api.fathom.ai/external/v1'

function headers() {
  return { 'X-Api-Key': process.env.FATHOM_API_KEY || '', 'Content-Type': 'application/json' }
}

export interface FathomMeeting {
  id: string
  share_url?: string
  recording_url?: string
  title?: string
  started_at?: string
  attendee_emails: string[]
  transcript?: string
  summary?: string
  action_items: unknown[]
  chapters: unknown[]
  key_topics: unknown[]
  questions: unknown[]
}

function normalize(m: Record<string, unknown>): FathomMeeting {
  const attendees = (m.attendees || m.invitees || []) as Array<Record<string, unknown>>
  return {
    id: String(m.id || m.recording_id || m.uuid || ''),
    share_url: (m.share_url || m.url) as string | undefined,
    recording_url: (m.recording_url || m.video_url) as string | undefined,
    title: (m.title || m.meeting_title) as string | undefined,
    started_at: (m.started_at || m.created_at || m.start_time) as string | undefined,
    attendee_emails: attendees.map((a) => String(a.email || '').toLowerCase()).filter(Boolean),
    transcript: (m.transcript || m.transcript_text) as string | undefined,
    summary: (m.summary || m.ai_summary) as string | undefined,
    action_items: (m.action_items || []) as unknown[],
    chapters: (m.chapters || []) as unknown[],
    key_topics: (m.topics || m.key_topics || []) as unknown[],
    questions: (m.questions || []) as unknown[],
  }
}

/* List recent meetings since an ISO date. */
export async function listRecent(sinceISO: string): Promise<FathomMeeting[]> {
  if (!fathomConfigured()) return []
  try {
    const url = new URL(`${BASE}/meetings`)
    url.searchParams.set('created_after', sinceISO)
    const r = await fetch(url.toString(), { headers: headers(), cache: 'no-store' })
    if (!r.ok) return []
    const j = await r.json()
    const list: Array<Record<string, unknown>> = Array.isArray(j?.items) ? j.items : Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : []
    return list.map(normalize).filter((m) => m.id)
  } catch (e) { console.error('fathom listRecent failed', e); return [] }
}
