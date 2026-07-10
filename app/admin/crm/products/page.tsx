'use client'
/* CRM · Products — the Whop product catalog, synced into the CRM. */
import { useState } from 'react'
import { T, Card, Button, EmptyState, PageHeader, useAdminFetch, adminSend, fmtDate } from '@/components/admin/ui'

type Row = Record<string, unknown>

export default function ProductsPage() {
  const { data, loading, reload } = useAdminFetch<{ products: Row[] }>('/api/admin/crm/products')
  const [syncing, setSyncing] = useState(false)
  const products = data?.products || []
  const sync = async () => { setSyncing(true); try { const r = await adminSend('/api/admin/crm/products', 'POST') as { records?: number }; alert(`Synced ${r?.records ?? 0} products.`); reload() } finally { setSyncing(false) } }
  return (
    <>
      <PageHeader title="Products" subtitle="Whop catalog" actions={<Button variant="ghost" disabled={syncing} onClick={sync}>{syncing ? 'Syncing…' : '↻ Sync from Whop'}</Button>} />
      {loading && !data ? <div className="skeleton" style={{ height: 160, borderRadius: 14 }} />
        : products.length === 0 ? <Card><EmptyState title="No products yet" hint="Click “Sync from Whop” to import your catalog." /></Card>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {products.map((p) => (
              <Card key={p.id as string}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{(p.title as string) || 'Untitled'}</div>
                {p.headline ? <div style={{ fontSize: 13, color: T.green, marginTop: 2 }}>{p.headline as string}</div> : null}
                {p.description ? <div style={{ fontSize: 13, color: T.sub, marginTop: 8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description as string}</div> : null}
                <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 12, color: T.muted, flexWrap: 'wrap' }}>
                  {p.global_affiliate_percentage != null ? <span>Affiliate {Number(p.global_affiliate_percentage)}%</span> : null}
                  {p.product_created_at ? <span>Created {fmtDate(p.product_created_at as string)}</span> : null}
                </div>
              </Card>
            ))}
          </div>
        )}
    </>
  )
}
