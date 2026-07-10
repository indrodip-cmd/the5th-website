import AdminShell from '@/components/admin/AdminShell'

/* The Integration Center renders inside the shared Workspace shell. */
export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
