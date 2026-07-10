import AdminShell from '@/components/admin/AdminShell'

/* The CRM module renders inside the shared Workspace shell (one login, one
   sidebar, one design system). Scoped here so the legacy /admin dashboard is
   untouched while modules migrate into the shell incrementally. */
export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
