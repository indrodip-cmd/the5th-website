'use client'
/* Workspace settings — CRM settings live here plus future workspace config. */
import Link from 'next/link'
import { T, Card, Button, PageHeader } from '@/components/admin/ui'

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Workspace configuration" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 6 }}>CRM</h3>
          <p style={{ fontSize: 13, color: T.sub, marginBottom: 14 }}>Pipeline stages, tags and custom fields.</p>
          <Link href="/admin/crm/settings"><Button variant="ghost">Open CRM settings →</Button></Link>
        </Card>
        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 6 }}>Integrations</h3>
          <p style={{ fontSize: 13, color: T.sub, marginBottom: 14 }}>Connect payment, analytics and meeting providers.</p>
          <Link href="/admin/integrations"><Button variant="ghost">Open integrations →</Button></Link>
        </Card>
        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 6 }}>Legacy tools</h3>
          <p style={{ fontSize: 13, color: T.sub, marginBottom: 14 }}>Carolina config, CMS, automations & playbook (being migrated).</p>
          <Link href="/admin/legacy"><Button variant="ghost">Open legacy →</Button></Link>
        </Card>
      </div>
    </>
  )
}
