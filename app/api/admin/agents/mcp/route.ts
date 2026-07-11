import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { listMcpServers, upsertMcpServer, setMcpEnabled, checkMcpHealth } from '@/lib/ai/mcp'

export const dynamic = 'force-dynamic'

/* GET — registered MCP servers. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ servers: await listMcpServers() })
}

/* POST { action:'save'|'enable'|'health', ... } — manage MCP servers. */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const action = String(b?.action || 'save')
  if (action === 'enable') { await setMcpEnabled(String(b?.slug || ''), !!b?.enabled); return NextResponse.json({ ok: true }) }
  if (action === 'health') return NextResponse.json(await checkMcpHealth(String(b?.slug || '')))
  const slug = String(b?.slug || '').trim(); const name = String(b?.name || '').trim()
  if (!slug || !name) return NextResponse.json({ error: 'slug and name required' }, { status: 400 })
  return NextResponse.json({ ok: true, server: await upsertMcpServer({ slug, name, url: b?.url, transport: b?.transport, auth_type: b?.auth_type, enabled: b?.enabled }) })
}
