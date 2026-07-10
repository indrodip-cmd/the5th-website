import { redirect } from 'next/navigation'
/* CMS module — being migrated out of Legacy into its own module. */
export default function CmsRedirect() {
  redirect('/admin/legacy')
}
