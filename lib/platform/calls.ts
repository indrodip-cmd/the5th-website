// lib/platform/calls.ts
// Weekly coaching/community call control — reads/writes call_settings (single
// row id=1) and call_overrides in the shared Supabase project. Server-only.

import { getSupabaseAdmin } from '@/lib/supabase'

const sb = () => getSupabaseAdmin()
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/* eslint-disable @typescript-eslint/no-explicit-any */
export type CallSettings = {
  id: number; link: string | null; label: string | null;
  day_of_week: number | null; hour: number | null; minute: number | null;
  timezone: string | null; active: boolean;
}

export async function getCallConfig() {
  const s = sb()
  const [{ data: settings }, { data: overrides }] = await Promise.all([
    s.from('call_settings').select('*').eq('id', 1).single(),
    s.from('call_overrides').select('*').order('original_date', { ascending: true }),
  ])
  const cfg = (settings || { id: 1, active: true }) as CallSettings
  return { settings: cfg, dowLabel: cfg.day_of_week != null ? DOW[cfg.day_of_week] : null, upcoming: computeUpcoming(cfg, overrides || []) }
}

// Next 8 weekly occurrences from today, with cancel/reschedule overrides merged in.
function computeUpcoming(cfg: CallSettings, overrides: any[]) {
  if (cfg.day_of_week == null || !cfg.active) return []
  const out: any[] = []
  const today = new Date(); today.setUTCHours(0, 0, 0, 0)
  const cur = new Date(today)
  // advance to the next matching weekday (inclusive of today)
  while (cur.getUTCDay() !== cfg.day_of_week) cur.setUTCDate(cur.getUTCDate() + 1)
  for (let i = 0; i < 8; i++) {
    const dateStr = cur.toISOString().split('T')[0]
    const ov = overrides.find((o) => o.original_date === dateStr)
    out.push({
      original_date: dateStr,
      hour: cfg.hour, minute: cfg.minute,
      status: ov?.status || 'scheduled',
      new_date: ov?.new_date || null, new_hour: ov?.new_hour ?? null, new_minute: ov?.new_minute ?? null,
      note: ov?.note || null,
    })
    cur.setUTCDate(cur.getUTCDate() + 7)
  }
  return out
}

export async function saveCallSettings(p: { link?: string; label?: string; day_of_week?: number; hour?: number; minute?: number; timezone?: string }) {
  const { error } = await sb().from('call_settings').upsert({ id: 1, ...p, updated_at: new Date().toISOString() }, { onConflict: 'id' })
  if (error) throw new Error(error.message)
  return { ok: true }
}

export async function setCallActive(active: boolean) {
  const { error } = await sb().from('call_settings').update({ active, updated_at: new Date().toISOString() }).eq('id', 1)
  if (error) throw new Error(error.message)
  return { ok: true, active }
}

export async function cancelOccurrence(originalDate: string, note?: string) {
  const { error } = await sb().from('call_overrides').upsert({ original_date: originalDate, status: 'cancelled', new_date: null, new_hour: null, new_minute: null, note: note || null, updated_at: new Date().toISOString() }, { onConflict: 'original_date' })
  if (error) throw new Error(error.message)
  return { ok: true }
}

export async function rescheduleOccurrence(originalDate: string, newDate: string, newHour: number, newMinute: number, note?: string) {
  const { error } = await sb().from('call_overrides').upsert({ original_date: originalDate, status: 'rescheduled', new_date: newDate, new_hour: newHour, new_minute: newMinute, note: note || null, updated_at: new Date().toISOString() }, { onConflict: 'original_date' })
  if (error) throw new Error(error.message)
  return { ok: true }
}

export async function restoreOccurrence(originalDate: string) {
  const { error } = await sb().from('call_overrides').delete().eq('original_date', originalDate)
  if (error) throw new Error(error.message)
  return { ok: true }
}
