import type { Metadata } from 'next'
import AdminShell from '@/components/admin/AdminShell'

/* Admin is private — keep it out of search engines (robots.txt also disallows). */
export const metadata: Metadata = { robots: { index: false, follow: false }, title: 'The5th Workspace' }

/* The single Workspace shell for the entire /admin tree — one login, one
   sidebar, one header, one design system. Every admin module renders inside it. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
