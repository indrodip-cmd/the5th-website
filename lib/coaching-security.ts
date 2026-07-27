import { getSupabaseAdmin } from '@/lib/supabase'

// Enterprise access control, audit and governance for AI Coaching Intelligence.
// Roles are layered ON TOP of the existing admin cookie: everyone here is
// already an authenticated admin; roles decide who can do what within the module.

export type Role = 'owner' | 'manager' | 'reviewer' | 'viewer'
const RANK: Record<Role, number> = { viewer: 1, reviewer: 2, manager: 3, owner: 4 }
const FOUNDERS = new Set(['indrodip@10kroadmap.org'])

// Capability → minimum role rank required.
export type Cap = 'view' | 'ingest' | 'analyze' | 'roleplay' | 'ask' | 'export' | 'manage_content' | 'actions' | 'success_plan' | 'fathom' | 'delete' | 'manage_settings' | 'manage_roles' | 'retention'
const CAP_MIN: Record<Cap, number> = {
  view: 1, ingest: 2, analyze: 2, roleplay: 2, ask: 2,
  export: 3, manage_content: 3, actions: 3, success_plan: 3, fathom: 3,
  delete: 4, manage_settings: 4, manage_roles: 4, retention: 4,
}

export async function roleOf(actor: string | null | undefined): Promise<Role> {
  const email = (actor || '').toLowerCase()
  if (email && FOUNDERS.has(email)) return 'owner'
  const sb = getSupabaseAdmin()
  const { data: rows } = await sb.from('ci_roles').select('email, role')
  // Bootstrap: if no roles are configured at all, every admin is an owner
  // (so the module is never bricked). Once roles exist, unknown admins are viewers.
  if (!rows || rows.length === 0) return 'owner'
  const mine = rows.find((r) => (r.email as string).toLowerCase() === email)
  return ((mine?.role as Role) || 'viewer')
}

export function can(role: Role, cap: Cap): boolean {
  return RANK[role] >= CAP_MIN[cap]
}
export function capsFor(role: Role): Cap[] {
  return (Object.keys(CAP_MIN) as Cap[]).filter((c) => can(role, c))
}

export async function audit(actor: string | null | undefined, action: string, targetType?: string, targetId?: string, meta?: Record<string, unknown>): Promise<void> {
  try {
    await getSupabaseAdmin().from('ci_audit_log').insert({ actor: actor || null, action, target_type: targetType || null, target_id: targetId || null, meta: meta || null })
  } catch { /* never block on audit */ }
}

export async function listRoles() {
  const { data } = await getSupabaseAdmin().from('ci_roles').select('*').order('created_at', { ascending: true })
  return data || []
}
export async function setRole(email: string, role: Role, by: string) {
  const e = email.trim().toLowerCase()
  if (!e || !RANK[role]) return { ok: false }
  await getSupabaseAdmin().from('ci_roles').upsert({ email: e, role, created_by: by }, { onConflict: 'email' })
  return { ok: true }
}
export async function removeRole(email: string) {
  await getSupabaseAdmin().from('ci_roles').delete().eq('email', email.trim().toLowerCase())
  return { ok: true }
}

export async function getSettings(): Promise<{ retention_days: number; consent_required: boolean }> {
  const { data } = await getSupabaseAdmin().from('ci_settings').select('retention_days, consent_required').eq('id', 1).maybeSingle()
  return { retention_days: Number(data?.retention_days) || 0, consent_required: !!data?.consent_required }
}
export async function updateSettings(patch: { retention_days?: number; consent_required?: boolean }, by: string) {
  const row: Record<string, unknown> = { id: 1, updated_at: new Date().toISOString(), updated_by: by }
  if (patch.retention_days != null) row.retention_days = Math.max(0, Math.floor(patch.retention_days))
  if (patch.consent_required != null) row.consent_required = !!patch.consent_required
  await getSupabaseAdmin().from('ci_settings').upsert(row, { onConflict: 'id' })
  return { ok: true }
}

// Enforce the retention policy: permanently delete meetings + roleplays older
// than retention_days. Returns how many were purged.
export async function applyRetention(): Promise<{ ok: boolean; purged: number }> {
  const { retention_days } = await getSettings()
  if (!retention_days || retention_days <= 0) return { ok: true, purged: 0 }
  const cutoff = new Date(Date.now() - retention_days * 86400000).toISOString()
  const sb = getSupabaseAdmin()
  const { data: del } = await sb.from('ci_meetings').delete().lt('created_at', cutoff).select('id')
  await sb.from('ci_roleplays').delete().lt('created_at', cutoff)
  return { ok: true, purged: (del || []).length }
}

export async function listAudit(limit = 200) {
  const { data } = await getSupabaseAdmin().from('ci_audit_log').select('*').order('at', { ascending: false }).limit(limit)
  return data || []
}
