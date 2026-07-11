'use client'
/* CMS hub — entry point for content management. Homepage Promotions live in
   their own premium manager; long-form content still lives in Legacy tools
   during migration. */
import Link from 'next/link'
import { T, Card, PageHeader } from '@/components/admin/ui'

const TILES = [
  { href: '/admin/cms/promos', icon: '✦', title: 'Homepage Promotions', desc: 'Premium product cards, announcements & banners — edit copy, CTAs and artwork without code.' },
  { href: '/admin/knowledge', icon: '📚', title: 'Knowledge & Content', desc: 'Articles, case studies and resources that power the site and the concierge.' },
  { href: '/admin/legacy', icon: '◲', title: 'Legacy CMS', desc: 'Long-form content tools being migrated into dedicated modules.' },
]

export default function CmsHub() {
  return (
    <>
      <PageHeader title="Content" subtitle="Manage everything visitors see" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} style={{ textDecoration: 'none' }}>
            <Card pad={22} style={{ cursor: 'pointer', height: '100%' }}>
              <div style={{ fontSize: 26, marginBottom: 12 }}>{t.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginBottom: 6 }}>{t.title}</div>
              <div style={{ fontSize: 13.5, color: T.sub, lineHeight: 1.5 }}>{t.desc}</div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}
