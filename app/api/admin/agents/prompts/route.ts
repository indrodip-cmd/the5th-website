import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { listPromptKeys, getPromptVersions, savePromptDraft, publishPrompt } from '@/lib/ai/prompts'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'

/* GET — versioned prompt keys, or ?key=<k> for its version history. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const key = new URL(req.url).searchParams.get('key')
  if (key) return NextResponse.json({ versions: await getPromptVersions(key) })
  return NextResponse.json({ keys: await listPromptKeys() })
}

/* POST { action:'save'|'publish', key, content?, version?, label?, notes? } */
export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const key = String(b?.key || '').trim()
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })
  if (b?.action === 'publish') return NextResponse.json({ ok: true, prompt: await publishPrompt(key, Number(b?.version), actor) })
  const content = sanitizeText(b?.content, 20000)
  return NextResponse.json({ ok: true, prompt: await savePromptDraft(key, content, actor, b?.label, b?.notes) })
}
