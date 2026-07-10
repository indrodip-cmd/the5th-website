import AdminShell from '@/components/admin/AdminShell'

/* The single Workspace shell for the entire /admin tree — one login, one
   sidebar, one header, one design system. Every admin module renders inside it. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
