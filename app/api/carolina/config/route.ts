import { NextResponse } from 'next/server'
import { loadSettings, loadActiveLeadMagnet, loadAgents } from '@/lib/carolina-config'

export const dynamic = 'force-dynamic'

/* Public, non-sensitive config the widget needs to render. Never exposes the
   knowledge base or persona — only what the browser legitimately shows. */
export async function GET() {
  const settings = await loadSettings()
  const [magnet, agents] = await Promise.all([
    settings.proactive_enabled ? loadActiveLeadMagnet(settings) : Promise.resolve(null),
    loadAgents(),
  ])

  const giftMessage =
    magnet?.popup_message ||
    (magnet?.title
      ? `🎁 I have a free gift for you — my “${magnet.title}”. Want me to send it over?`
      : '🎁 I have a free gift for you — a short PDF showing exactly how to make your first $3K/month in your coaching business. Want me to send it over?')

  const quizMessage =
    'Curious what’s quietly holding your business back? Take our free 60-second assessment — I’ll walk you through it. Ready?'

  return NextResponse.json(
    {
      avatar_url: settings.avatar_url || null,
      greeting: settings.greeting || null,
      agents: agents.map((a) => ({ key: a.key, name: a.name, role: a.role, avatar_url: a.avatar_url })),
      features: { attachments: settings.features?.attachments !== false, booking: settings.features?.booking !== false },
      proactive: {
        enabled: !!settings.proactive_enabled,
        delay: settings.proactive_delay_seconds || 12,
        // First-time visitors get the lead-magnet gift; returning visitors get the quiz.
        gift: { message: giftMessage, magnet_title: magnet?.title || null },
        quiz: { message: quizMessage },
        // legacy field (older widget builds)
        message: giftMessage,
      },
    },
    { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' } }
  )
}
