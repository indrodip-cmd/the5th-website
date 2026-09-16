import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

/* Private results dashboard for The5th Original Research study.
   Gated by a passcode compared against RESEARCH_STUDY_KEY (set in Vercel).
   Reads aggregates via the service role. Never indexed. */
export const metadata: Metadata = { title: 'Study dashboard', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const C = {
  cream: '#FAF6F0', plum: '#3D2645', plumDark: '#2E1A35', gold: '#C9A84C', goldDeep: '#B0902F',
  ink: '#1A1A2E', inkSoft: '#4a4038', muted: '#8A8075', border: '#E2DCD2', white: '#fff', purple: '#5E2E86',
}
const SERIF = "Georgia, 'Times New Roman', serif"

type Row = { age_band: string | null; ai_use: string | null; reliance_score: number | null; crt_score: number | null; crt_total: number | null; crt_lure: number | null; confidence: number | null; created_at: string }

function mean(xs: number[]) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0 }
function pearson(xs: number[], ys: number[]) {
  const n = xs.length
  if (n < 3) return null
  const mx = mean(xs), my = mean(ys)
  let num = 0, dx = 0, dy = 0
  for (let i = 0; i < n; i++) { const a = xs[i] - mx, b = ys[i] - my; num += a * b; dx += a * a; dy += b * b }
  if (dx === 0 || dy === 0) return null
  return num / Math.sqrt(dx * dy)
}

async function getRows(): Promise<Row[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data } = await supabase
    .from('research_study_responses')
    .select('age_band, ai_use, reliance_score, crt_score, crt_total, crt_lure, confidence, created_at')
    .eq('study', 'critical-thinking-ai')
    .order('created_at', { ascending: false })
    .limit(5000)
  return (data as Row[]) || []
}

function Stat({ big, label, color }: { big: string; label: string; color?: string }) {
  return (
    <div style={{ flex: '1 1 160px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 800, color: color || C.plum }}>{big}</div>
      <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{label}</div>
    </div>
  )
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const key = typeof sp.key === 'string' ? sp.key : ''
  const expected = process.env.RESEARCH_STUDY_KEY || ''

  const wrap: React.CSSProperties = { minHeight: '100vh', background: C.cream, color: C.ink, fontFamily: "'Public Sans', system-ui, sans-serif", padding: 'clamp(24px,5vw,52px)' }

  if (!expected) {
    return <div style={wrap}><div style={{ maxWidth: 560, margin: '0 auto' }}><h1 style={{ fontFamily: SERIF, color: C.plumDark }}>Dashboard not configured</h1><p style={{ color: C.inkSoft }}>Set the <code>RESEARCH_STUDY_KEY</code> environment variable in Vercel, then open this page with <code>?key=YOUR_KEY</code>.</p></div></div>
  }
  if (key !== expected) {
    return (
      <div style={wrap}>
        <div style={{ maxWidth: 420, margin: '10vh auto 0' }}>
          <h1 style={{ fontFamily: SERIF, color: C.plumDark, fontSize: 26 }}>Study dashboard</h1>
          <p style={{ color: C.inkSoft, fontSize: 15 }}>Enter the passcode to view results.</p>
          <form method="get" style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <input name="key" type="password" placeholder="Passcode" style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, fontSize: 15 }} />
            <button type="submit" style={{ border: 'none', cursor: 'pointer', background: C.plum, color: '#fff', fontWeight: 700, borderRadius: 10, padding: '12px 20px' }}>View</button>
          </form>
        </div>
      </div>
    )
  }

  const rows = await getRows()
  const n = rows.length
  const withCrt = rows.filter((r) => r.crt_score != null && r.crt_total)
  const accs = withCrt.map((r) => (r.crt_score! / r.crt_total!))
  const meanAcc = mean(accs)
  const conf = rows.filter((r) => r.confidence != null).map((r) => r.confidence! / 100)
  const meanConf = mean(conf)
  const rel = rows.filter((r) => r.reliance_score != null).map((r) => r.reliance_score!)
  const meanRel = mean(rel)

  // reliance vs accuracy correlation (paired)
  const paired = rows.filter((r) => r.reliance_score != null && r.crt_score != null && r.crt_total)
  const r = pearson(paired.map((x) => x.reliance_score!), paired.map((x) => x.crt_score! / x.crt_total!))

  // reliance terciles vs mean accuracy
  const sorted = [...paired].sort((a, b) => a.reliance_score! - b.reliance_score!)
  const third = Math.floor(sorted.length / 3)
  const lowRel = sorted.slice(0, third)
  const highRel = sorted.slice(sorted.length - third)
  const accOf = (g: Row[]) => mean(g.map((x) => x.crt_score! / x.crt_total!))

  const overconf = rows.filter((r) => r.confidence != null && r.crt_score != null && r.crt_total && (r.confidence! / 100) > (r.crt_score! / r.crt_total!) + 0.15).length
  const overconfPct = n ? Math.round((overconf / withCrt.length || 0) * 100) : 0

  const ages: Record<string, number> = {}
  rows.forEach((r) => { if (r.age_band) ages[r.age_band] = (ages[r.age_band] || 0) + 1 })

  return (
    <div style={wrap}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: C.goldDeep, fontWeight: 700 }}>The5th Original Research · live</div>
        <h1 style={{ fontFamily: SERIF, color: C.plumDark, fontSize: 'clamp(26px,4vw,38px)', margin: '8px 0 4px' }}>Critical Thinking × AI Reliance</h1>
        <p style={{ color: C.muted, fontSize: 14, margin: '0 0 24px' }}>{n} anonymous {n === 1 ? 'response' : 'responses'} collected so far.</p>

        {n === 0 ? (
          <p style={{ color: C.inkSoft }}>No responses yet. Share <code>/research/study</code> to start collecting.</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
              <Stat big={String(n)} label="participants" />
              <Stat big={`${Math.round(meanAcc * 100)}%`} label="mean reasoning accuracy" />
              <Stat big={`${Math.round(meanConf * 100)}%`} label="mean confidence" color={C.goldDeep} />
              <Stat big={`${meanConf - meanAcc >= 0 ? '+' : ''}${Math.round((meanConf - meanAcc) * 100)} pts`} label="confidence minus accuracy" color={C.purple} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <Stat big={r == null ? 'n/a' : r.toFixed(2)} label="reliance ↔ accuracy correlation (r)" />
              <Stat big={`${Math.round(meanRel * 100)}%`} label="mean AI-reliance score" />
              <Stat big={`${overconfPct}%`} label="clearly overconfident" color={C.goldDeep} />
              <Stat big={lowRel.length >= 3 ? `${Math.round(accOf(lowRel) * 100)}% vs ${Math.round(accOf(highRel) * 100)}%` : 'n/a'} label="accuracy: low vs high reliance" color={C.purple} />
            </div>

            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontFamily: SERIF, fontSize: 18, color: C.plumDark, marginBottom: 14 }}>Participants by age</div>
              {Object.entries(ages).sort().map(([a, c]) => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 90, fontSize: 13, color: C.inkSoft }}>{a}</div>
                  <div style={{ flex: 1, background: C.cream, borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${(c / n) * 100}%`, minWidth: 2, height: 18, background: C.purple, borderRadius: 6 }} />
                  </div>
                  <div style={{ width: 30, fontSize: 13, color: C.muted, textAlign: 'right' }}>{c}</div>
                </div>
              ))}
            </div>

            <p style={{ color: C.muted, fontSize: 12.5, marginTop: 18, lineHeight: 1.6 }}>
              Notes: “confidence minus accuracy” above zero means the group felt more sure than it was (overconfidence).
              A negative reliance-to-accuracy correlation (r) is the pattern the published literature predicts. Low-vs-high
              reliance compares the bottom and top third of participants by AI-reliance score. These update live as
              responses arrive.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
