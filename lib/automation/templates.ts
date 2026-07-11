/* Professionally-designed workflow templates (3I.6). One-click starting points
   that showcase the AI node, approvals and deep CRM/revenue integration. */
type Row = Record<string, unknown>
const n = (id: string, type: string, config: Row = {}): Row => ({ id, type, config })

export interface Template { key: string; name: string; description: string; category: string; icon: string; trigger: Row; graph: { nodes: Row[] } }

export const TEMPLATES: Template[] = [
  {
    key: 'strategy_call', name: 'New Strategy Call → Meeting Brief', category: 'meetings', icon: '📅',
    description: 'When someone books a strategy call, generate a meeting brief and notify the team.',
    trigger: { type: 'appointment_booked', config: {} },
    graph: { nodes: [
      n('t', 'trigger'),
      n('ai', 'ai', { prompt: 'Write a concise pre-call brief for a strategy call with {{name}} ({{email}}). Include likely goals, what to ask, and one tailored recommendation.', task: 'chat', output: 'brief' }),
      n('note', 'action', { action: 'add_note', params: { body: 'Meeting brief:\n{{brief}}' } }),
      n('notify', 'notify', { title: 'New strategy call booked', body: '{{name}} booked a call. Brief is ready in the CRM.' }),
      n('end', 'end'),
    ] },
  },
  {
    key: 'fast_forward_purchase', name: 'Fast Forward Purchase → Onboarding', category: 'sales', icon: '🚀',
    description: 'On a Fast Forward purchase: create the customer, tag them, generate a welcome, and open an onboarding task.',
    trigger: { type: 'purchase_recorded', config: {} },
    graph: { nodes: [
      n('t', 'trigger'),
      n('c', 'action', { action: 'create_contact', params: { source: 'fast-forward' } }),
      n('tag', 'action', { action: 'add_tag', params: { tag: 'Fast Forward' } }),
      n('ai', 'ai', { prompt: 'Write a warm, on-brand welcome message for {{name}} who just joined Fast Forward.', task: 'cheap', output: 'welcome' }),
      n('note', 'action', { action: 'add_note', params: { body: '{{welcome}}' } }),
      n('task', 'action', { action: 'create_task', params: { title: 'Onboard {{name}} into Fast Forward', due_in_days: 1 } }),
      n('end', 'end'),
    ] },
  },
  {
    key: 'refund_churn', name: 'Refund → Churn-Risk Review', category: 'revenue', icon: '↩️',
    description: 'On a refund: notify admin and have AI assess churn risk and a save play.',
    trigger: { type: 'refund_recorded', config: {} },
    graph: { nodes: [
      n('t', 'trigger'),
      n('notify', 'notify', { title: 'Refund recorded', body: 'A refund was recorded for {{email}}.' }),
      n('ai', 'ai', { prompt: 'A customer ({{email}}) requested a refund of {{amount}}. Assess likely churn reason and suggest one concrete save/win-back play.', task: 'chat', output: 'analysis' }),
      n('note', 'action', { action: 'add_note', params: { body: 'Churn review:\n{{analysis}}' } }),
      n('end', 'end'),
    ] },
  },
  {
    key: 'whop_sale', name: 'Whop Sale → CRM + Command AI', category: 'revenue', icon: '🟣',
    description: 'On a Whop payment: upsert the customer, tag, and log for the revenue dashboard.',
    trigger: { type: 'revenue_recorded', config: {} },
    graph: { nodes: [
      n('t', 'trigger'),
      n('c', 'action', { action: 'create_contact', params: { source: 'whop' } }),
      n('tag', 'action', { action: 'add_tag', params: { tag: 'Customer' } }),
      n('log', 'action', { action: 'log', params: { message: 'Whop sale recorded for {{email}}' } }),
      n('end', 'end'),
    ] },
  },
  {
    key: 'hot_lead_approval', name: 'Hot Lead → AI Follow-up (with approval)', category: 'sales', icon: '🔥',
    description: 'When a lead gets hot, AI drafts a follow-up that waits for your approval before anything is logged.',
    trigger: { type: 'lead_score_changed', config: { conditions: [{ field: 'lead_score', op: 'gte', value: '70' }], match: 'all' } },
    graph: { nodes: [
      n('t', 'trigger'),
      n('cond', 'condition', { conditions: [{ field: 'lead_score', op: 'gte', value: '70' }], match: 'all' }),
      n('ai', 'ai', { prompt: 'Draft a short, warm follow-up message to {{name}} ({{email}}) who is now a hot lead (score {{lead_score}}). Reference their interest: {{interest}}.', task: 'chat', output: 'draft' }),
      n('appr', 'approval', { title: 'Approve follow-up for {{name}}', note: '{{draft}}' }),
      n('note', 'action', { action: 'add_note', params: { body: 'Approved follow-up:\n{{draft}}' } }),
      n('task', 'action', { action: 'create_task', params: { title: 'Send approved follow-up to {{name}}', due_in_days: 0 } }),
      n('end', 'end'),
    ] },
  },
]

export function templateByKey(key: string): Template | undefined { return TEMPLATES.find((t) => t.key === key) }
