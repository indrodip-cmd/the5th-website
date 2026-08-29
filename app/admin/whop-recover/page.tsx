'use client'
/* Whop Recovery — one-click replay of Whop events that were dropped while the
   webhook was failing signature verification. Reads the stored payloads from
   integration_webhooks and re-runs them through the live fulfillment path
   (revenue + CRM + enrollments). Idempotent; safe to run more than once. */
import { useState } from 'react'
import { T, Card, PageHeader, EmptyState, ErrorState, useAdminFetch, adminSend } from '@/components/admin/ui'

type Preview = { pending: number; by: Record<string, number> }

export default function WhopRecoverPage() {
  const { data, loading, error, reload } = useAdminFetch<Preview>('/api/admin/whop-recover')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function recover() {
    if (!confirm('Replay all dropped Whop events now? This records revenue, updates the CRM, and sends the welcome/confirmation emails those paying buyers never received. It is idempotent (safe to run again).')) return
    setRunning(true); setResult(null)
    try {
      const r = await adminSend('/api/admin/whop-recover', 'POST', { limit: 2000 })
      setResult(`✓ Recovered ${r.recovered} event(s)${r.errors ? `, ${r.errors} error(s)` : ''}. ${r.remaining ? r.remaining + ' still pending — run again.' : 'None remaining.'}`)
      reload()
    } catch (e) { setResult(`Recovery failed: ${String(e)}`) }
    finally { setRunning(false) }
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '4px 4px 60px' }}>
      <PageHeader title="Whop Recovery" subtitle="Replay purchases that were dropped while the webhook signature was failing" actions={<button className="a-btn a-btn-ghost" onClick={reload}>Refresh</button>} />

      <Card pad={16} style={{ marginBottom: 16, background: '#fffbeb', border: '1px solid #fde68a' }}>
        <div style={{ fontSize: 13.5, color: '#92400e', lineHeight: 1.6 }}>
          <b>Fix the webhook secret first.</b> Only run recovery once new Whop events are verifying (<code style={{ background: '#fef3c7', padding: '1px 6px', borderRadius: 5 }}>status=processed</code>). Recovery re-runs the exact fulfillment logic on stored payloads and is idempotent, so running it twice will not double-charge, double-enroll, or double-send.
        </div>
      </Card>

      {result && (
        <Card pad={12} style={{ marginBottom: 16, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 13.5, color: '#166534' }}>{result}</div>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="skeleton" style={{ height: 120 }} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data || data.pending === 0 ? (
          <EmptyState icon="✓" title="Nothing to recover" hint="No dropped Whop events are waiting. Once the webhook is verifying, this stays empty." />
        ) : (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 4 }}>{data.pending} dropped event{data.pending === 1 ? '' : 's'} ready to recover</div>
            <div style={{ fontSize: 13, color: T.sub, marginBottom: 16 }}>These paid/subscription events were rejected on signature and never fulfilled. Replaying restores revenue, CRM records, and buyer emails.</div>
            <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
              {Object.entries(data.by).sort((a, b) => b[1] - a[1]).map(([k, n]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13.5 }}>
                  <span style={{ fontFamily: 'monospace', color: T.text }}>{k}</span>
                  <b style={{ color: T.ink }}>{n}</b>
                </div>
              ))}
            </div>
            <button className="a-btn" style={{ width: 'auto', padding: '12px 24px' }} disabled={running} onClick={recover}>
              {running ? 'Recovering…' : `Recover ${data.pending} event${data.pending === 1 ? '' : 's'} now`}
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
