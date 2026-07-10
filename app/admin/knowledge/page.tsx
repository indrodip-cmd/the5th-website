import { redirect } from 'next/navigation'
/* Knowledge Base module — being migrated out of Legacy into its own module. */
export default function KnowledgeRedirect() {
  redirect('/admin/legacy')
}
