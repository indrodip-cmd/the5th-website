/* Shared loaders for Carolina's admin-managed settings + lead magnets. */
import { getSupabaseAdmin } from '@/lib/supabase'

export interface LeadMagnet {
  id: string
  title: string
  description: string | null
  pdf_url: string | null
  hook: string | null
  popup_message: string | null
  selling_points: string[] | null
  active: boolean
}

export interface CarolinaSettings {
  avatar_url: string | null
  greeting: string | null
  knowledge_base: string | null
  persona: string | null
  proactive_enabled: boolean
  proactive_delay_seconds: number
  active_lead_magnet: string | null
}

const DEFAULT_GREETING =
  "Hi, I'm Carolina 👋 I help women 40+ turn their expertise into income with The5th. Curious about our programs, or want to book a quick call with the team?"

export async function loadSettings(): Promise<CarolinaSettings> {
  try {
    const { data } = await getSupabaseAdmin()
      .from('carolina_settings')
      .select('*')
      .eq('id', 1)
      .single()
    if (data) return data as CarolinaSettings
  } catch (e) {
    console.error('loadSettings failed', e)
  }
  return {
    avatar_url: null,
    greeting: DEFAULT_GREETING,
    knowledge_base: null,
    persona: null,
    proactive_enabled: true,
    proactive_delay_seconds: 12,
    active_lead_magnet: null,
  }
}

export async function loadActiveLeadMagnet(settings: CarolinaSettings): Promise<LeadMagnet | null> {
  try {
    const db = getSupabaseAdmin()
    // Prefer the explicitly-selected magnet, else the most recent active one.
    if (settings.active_lead_magnet) {
      const { data } = await db.from('carolina_lead_magnets').select('*').eq('id', settings.active_lead_magnet).single()
      if (data && data.active) return data as LeadMagnet
    }
    const { data } = await db
      .from('carolina_lead_magnets')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
    return data && data[0] ? (data[0] as LeadMagnet) : null
  } catch (e) {
    console.error('loadActiveLeadMagnet failed', e)
    return null
  }
}
