// lib/platform/admin.ts
// Server-only data layer for the Platform Super Admin module, ported from
// ~/the5th-platform's embedded AdminPanel. All reads/writes use the shared
// Supabase project via the service-role key. Never import into a client
// component. Every caller (API route) must first pass the adminEmail() gate.

import { getSupabaseAdmin } from '@/lib/supabase'

const sb = () => getSupabaseAdmin()

// Tiers that may be assigned via the panel. 'admin' is deliberately excluded —
// it can never be set through the API (matches the platform's guard).
export const SAFE_TIERS = ['free', 'book_only', 'course_only', 'member_monthly', 'member_yearly', 'ai_only', 'ai_trial'] as const
export const TIER_LABEL: Record<string, string> = {
  free: 'Free', book_only: 'Book Access', course_only: 'Course Access',
  member_monthly: 'Monthly Member', member_yearly: 'Yearly Member',
  admin: 'Admin', ai_only: 'The5th AI', ai_trial: 'Free Trial',
}

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Members ──────────────────────────────────────────────────────────
export async function listMembers() {
  const { data } = await sb()
    .from('members')
    .select('id,full_name,email,tier,is_active,joined_at,whop_customer_id,permanent_credits')
    .order('joined_at', { ascending: false })
  return data || []
}

export async function createMember(full_name: string, email: string, rawTier: string) {
  const tier = SAFE_TIERS.includes(rawTier as any) ? rawTier : 'free'
  const s = sb()
  // Create the auth user (idempotent-ish — ignore "already registered")
  try { await s.auth.admin.createUser({ email, email_confirm: true }) } catch { /* may already exist */ }
  const { data, error } = await s
    .from('members')
    .upsert({ full_name, email: email.toLowerCase(), tier, is_active: true }, { onConflict: 'email' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateMember(id: string, updates: Record<string, any>) {
  if (updates.tier === 'admin') delete updates.tier // never promote to admin via API
  const { data, error } = await sb().from('members').update(updates).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function deactivateMember(id: string) {
  await sb().from('members').update({ is_active: false }).eq('id', id)
  return { ok: true }
}

// ── Credits ──────────────────────────────────────────────────────────
export async function grantCredits(memberId: string, amount: number) {
  const s = sb()
  const { data: m } = await s.from('members').select('permanent_credits,email,full_name').eq('id', memberId).single()
  const newTotal = Number(m?.permanent_credits || 0) + amount
  const { error } = await s.from('members').update({ permanent_credits: newTotal }).eq('id', memberId)
  if (error) throw new Error(error.message)
  return { balance: newTotal, email: m?.email as string | undefined, name: m?.full_name as string | undefined }
}

// ── Security ─────────────────────────────────────────────────────────
export async function getSecurity() {
  const s = sb()
  const [blocked, events] = await Promise.all([
    s.from('blocked_accounts').select('*').eq('is_active', true).order('blocked_at', { ascending: false }),
    s.from('security_events').select('*').order('created_at', { ascending: false }).limit(50),
  ])
  return { blocked: blocked.data || [], events: events.data || [] }
}

export async function unblockAccount(targetUserId: string, targetEmail: string) {
  const s = sb()
  await s.from('blocked_accounts').update({ is_active: false }).eq('user_id', targetUserId)
  await s.from('user_sessions').delete().eq('user_id', targetUserId)
  await s.from('security_events').insert({ user_id: targetUserId, email: targetEmail, event_type: 'admin_unblock', created_at: new Date().toISOString() })
  return { ok: true }
}

// ── Training (AI coaching brain) ─────────────────────────────────────
export async function getTraining() {
  const s = sb()
  const [patterns, prompt, calls, docs] = await Promise.all([
    s.from('ai_training_data').select('id', { count: 'exact', head: true }),
    s.from('ai_prompt_versions').select('version_number').eq('is_active', true).single(),
    s.from('coaching_calls').select('id', { count: 'exact', head: true }).not('transcript', 'is', null),
    s.from('coaching_calls').select('id,fathom_id,title,date,transcript').order('date', { ascending: false }),
  ])
  return {
    patterns: patterns.count || 0,
    activeVersion: prompt.data?.version_number ?? null,
    callsWithTranscript: calls.count || 0,
    docs: (docs.data || []).map((d: any) => ({ id: d.id, fathom_id: d.fathom_id, title: d.title, date: d.date, hasTranscript: !!d.transcript })),
  }
}

export async function saveTranscript(title: string, content: string, date?: string) {
  const { error } = await sb().from('coaching_calls').insert({
    title, transcript: content, date: date || new Date().toISOString().split('T')[0],
    fathom_id: `manual-${Date.now()}`,
  })
  if (error) throw new Error(error.message)
  return { ok: true }
}

export async function deleteTranscript(id: string, fathomId?: string) {
  const s = sb()
  if (fathomId) await s.from('ai_training_data').delete().eq('source_id', fathomId)
  if (id) await s.from('coaching_calls').delete().eq('id', id)
  return { ok: true }
}

// ── Platform settings (pricing / zoom / onboarding) ──────────────────
export async function getSetting(key: string) {
  const { data } = await sb().from('platform_settings').select('value').eq('key', key).single()
  return data?.value ?? null
}
export async function saveSetting(key: string, value: any) {
  const { error } = await sb().from('platform_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw new Error(error.message)
  return { ok: true }
}

// ── Courses (CMS) ────────────────────────────────────────────────────
export async function listCourses() {
  const { data } = await sb().from('platform_courses').select('*').order('created_at', { ascending: true })
  return data || []
}
export async function createCourse(c: any) {
  const id = c.id || `course-${Date.now()}`
  const { error } = await sb().from('platform_courses').insert({
    id, title: c.title, description: c.description || '', tag: c.tag || 'Course',
    color: c.color || '#1C4A32', cover_image: c.cover_image || '', instructor: 'Indrodip Ghosh',
    enrolled_count: 0, published: false,
    access_tiers: c.access_tiers?.length ? c.access_tiers : ['member_yearly'],
    standalone_price: Number(c.standalone_price) || 27, modules: c.modules || [],
  })
  if (error) throw new Error(error.message)
  return { id }
}
export async function updateCourse(id: string, updates: Record<string, any>) {
  const { error } = await sb().from('platform_courses')
    .update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  return { ok: true }
}
export async function deleteCourse(id: string) {
  await sb().from('platform_courses').delete().eq('id', id)
  return { ok: true }
}
