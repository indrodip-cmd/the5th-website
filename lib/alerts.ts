/* Threshold alerts (3I.5) — run from the daily cron. Emits notifications (→ the
   topbar bell) when spend or reliability thresholds are crossed. Fail-soft. */
import { getSupabaseAdmin } from '@/lib/supabase'
import { aiCostSummary } from '@/lib/ai-usage'
import { getCostSettings } from '@/lib/cost-guard'
import { notify } from '@/lib/notifications'

export async function runHealthAlerts(): Promise<{ alerts: string[] }> {
  const alerts: string[] = []
  try {
    const db = getSupabaseAdmin()
    const [cost, settings] = await Promise.all([aiCostSummary(), getCostSettings()])

    if (settings.dailyBudget > 0 && cost.today > settings.dailyBudget) {
      await notify('ai_budget', 'AI daily budget exceeded', `Today: $${cost.today.toFixed(2)} of $${settings.dailyBudget}`); alerts.push('daily_budget')
    }
    if (settings.monthlyBudget > 0 && cost.month > settings.monthlyBudget) {
      await notify('ai_budget', 'AI monthly budget exceeded', `Month: $${cost.month.toFixed(2)} of $${settings.monthlyBudget}`); alerts.push('monthly_budget')
    }

    const since = new Date(Date.now() - 26 * 3600000).toISOString()
    const [{ count: failedWebhooks }, { count: failedJobs }] = await Promise.all([
      db.from('integration_webhooks').select('id', { count: 'exact', head: true }).eq('status', 'error').gte('received_at', since),
      db.from('crm_integration_syncs').select('id', { count: 'exact', head: true }).eq('status', 'error').gte('started_at', since),
    ])
    if ((failedWebhooks || 0) > 0) { await notify('webhook_failure', 'Webhook failures (24h)', `${failedWebhooks} failed webhook deliveries`); alerts.push('webhooks') }
    if ((failedJobs || 0) > 0) { await notify('job_failure', 'Sync job failures (24h)', `${failedJobs} failed sync jobs`); alerts.push('jobs') }
  } catch (e) { console.error('runHealthAlerts failed', e) }
  return { alerts }
}
