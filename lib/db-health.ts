/* Database health (3I.5) — live catalog stats via the system_db_health RPC
   (PostgREST can't read pg_catalog directly). Read-only, aggregate only. */
import { getSupabaseAdmin } from '@/lib/supabase'

type Row = Record<string, unknown>

export async function dbHealth() {
  try {
    const { data, error } = await getSupabaseAdmin().rpc('system_db_health')
    if (error || !data) return { ok: false, error: error?.message || 'no data' }
    const d = data as Row
    return {
      ok: true,
      dbSizeBytes: Number(d.db_size || 0),
      connections: Number(d.connections || 0),
      activeConnections: Number(d.active_connections || 0),
      hasVector: !!d.has_vector,
      migrationCount: Number(d.migration_count || 0),
      lastMigration: (d.last_migration as string) || null,
      topTables: ((d.top_tables as Row[]) || []).map((t) => ({ name: t.name as string, bytes: Number(t.bytes || 0), rows: Number(t.rows || 0) })),
    }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
