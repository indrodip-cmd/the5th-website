import { NextResponse } from 'next/server'
import { loadSettings, loadActiveLeadMagnet } from '@/lib/carolina-config'

export const dynamic = 'force-dynamic'

/* Public, non-sensitive config the widget needs to render. Never exposes the
   knowledge base or persona — only what the browser legitimately shows. */
export async function GET() {
  const settings = await loadSettings()
  const magnet = settings.proactive_enabled ? await loadActiveLeadMagnet(settings) : null

  return NextResponse.json(
    {
      avatar_url: settings.avatar_url || null,
      greeting: settings.greeting || null,
      proactive: {
        enabled: !!settings.proactive_enabled,
        delay: settings.proactive_delay_seconds || 12,
        message:
          magnet?.popup_message ||
          (magnet?.title ? `Want my free ${magnet.title}? I can send it over 👇` : null) ||
          'Not sure where to start? I can point you to the right next step — want a hand?',
      },
    },
    { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' } }
  )
}
