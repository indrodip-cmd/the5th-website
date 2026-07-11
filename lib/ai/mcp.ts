/* MCP platform (3I.5) — Model Context Protocol servers are treated as ONE
   integration type among many, registered so their tools can flow into the Tool
   Registry. This module manages the server records + health; it deliberately
   keeps MCP loosely coupled (a provider, not the platform's backbone). */
import { getSupabaseAdmin } from '@/lib/supabase'

type Row = Record<string, unknown>

export async function listMcpServers() {
  const { data } = await getSupabaseAdmin().from('mcp_servers').select('*').order('created_at', { ascending: false })
  return data || []
}
export async function getMcpServer(slug: string) {
  const { data } = await getSupabaseAdmin().from('mcp_servers').select('*').eq('slug', slug).maybeSingle()
  return data
}

export async function upsertMcpServer(input: { slug: string; name: string; url?: string; transport?: string; auth_type?: string; enabled?: boolean }) {
  const { data } = await getSupabaseAdmin().from('mcp_servers').upsert({
    slug: input.slug, name: input.name, url: input.url || null,
    transport: input.transport || 'http', auth_type: input.auth_type || 'none',
    enabled: input.enabled ?? false, updated_at: new Date().toISOString(),
  }, { onConflict: 'slug' }).select('*').single()
  return data
}

export async function setMcpEnabled(slug: string, enabled: boolean) {
  await getSupabaseAdmin().from('mcp_servers').update({ enabled, updated_at: new Date().toISOString() }).eq('slug', slug)
}

/** Real reachability probe for HTTP MCP servers; records status + last error. */
export async function checkMcpHealth(slug: string) {
  const db = getSupabaseAdmin()
  const server = await getMcpServer(slug) as Row | null
  if (!server) return { ok: false, error: 'not found' }
  let status = 'disconnected', lastError: string | null = null
  if (server.url && server.transport === 'http') {
    try {
      const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 5000)
      const r = await fetch(String(server.url), { method: 'GET', signal: ctrl.signal })
      clearTimeout(to)
      status = r.ok || r.status === 401 || r.status === 405 ? 'connected' : 'error'
      if (status === 'error') lastError = `HTTP ${r.status}`
    } catch (e) { status = 'error'; lastError = String(e).slice(0, 200) }
  }
  await db.from('mcp_servers').update({ status, last_error: lastError, last_health_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('slug', slug)
  return { ok: status === 'connected', status, error: lastError }
}
