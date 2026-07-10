/* App log store + security event helper (3I.5). Both fail-soft — logging must
   never break a request. Powers the Log Explorer + Security Center. */
import { getSupabaseAdmin } from '@/lib/supabase'

type Row = Record<string, unknown>

export function slog(level: 'info' | 'warn' | 'error', source: string, message: string, meta?: Row, endpoint?: string) {
  ;(async () => {
    try {
      await getSupabaseAdmin().from('system_logs').insert({ level, source, message: String(message).slice(0, 2000), endpoint: endpoint || null, meta: meta || {} })
    } catch (e) { console.error('slog failed', e) }
  })()
}

export function logSecurity(input: {
  event_type: string; attack_type?: string; severity?: string
  ip?: string | null; endpoint?: string | null; email?: string | null; details?: Row
}) {
  ;(async () => {
    try {
      await getSupabaseAdmin().from('security_events').insert({
        event_type: input.event_type, attack_type: input.attack_type || null,
        severity: input.severity || 'low', ip_address: input.ip || null,
        endpoint: input.endpoint || null, email: input.email || null, details: input.details || {},
      })
    } catch (e) { console.error('logSecurity failed', e) }
  })()
}
