import { redirect } from 'next/navigation'
/* Analytics module — being migrated out of Legacy into its own module. */
export default function AnalyticsRedirect() {
  redirect('/admin/legacy')
}
