/* Default dashboard presets. Each entry is a widget id + column span (1–4).
   Users adopt a preset then customize; layouts persist per admin. */
export interface LayoutItem { id: string; w: number; collapsed?: boolean; pinned?: boolean; hidden?: boolean }
export type Preset = { name: string; layout: LayoutItem[] }

export const PRESETS: Record<string, Preset> = {
  CEO: {
    name: 'CEO', layout: [
      { id: 'kpi-available-balance', w: 1 }, { id: 'kpi-revenue-today', w: 1 }, { id: 'kpi-revenue-month', w: 1 }, { id: 'kpi-revenue-lifetime', w: 1 },
      { id: 'kpi-pipeline-value', w: 1 }, { id: 'kpi-hot-leads', w: 1 }, { id: 'kpi-calls-today', w: 1 }, { id: 'kpi-conversion', w: 1 },
      { id: 'revenue-center', w: 2 }, { id: 'activity-feed', w: 2 },
      { id: 'crm-insights', w: 1 }, { id: 'upcoming-meetings', w: 2 }, { id: 'recently-won', w: 1 },
    ],
  },
  Sales: {
    name: 'Sales', layout: [
      { id: 'kpi-hot-leads', w: 1 }, { id: 'kpi-pipeline-value', w: 1 }, { id: 'kpi-calls-today', w: 1 }, { id: 'kpi-calls-tomorrow', w: 1 },
      { id: 'hot-leads', w: 2 }, { id: 'upcoming-meetings', w: 2 },
      { id: 'overdue-tasks', w: 2 }, { id: 'recently-won', w: 1 }, { id: 'crm-insights', w: 1 },
    ],
  },
  Marketing: {
    name: 'Marketing', layout: [
      { id: 'kpi-visitors', w: 1 }, { id: 'kpi-new-customers', w: 1 }, { id: 'kpi-conversion', w: 1 }, { id: 'kpi-ai-today', w: 1 },
      { id: 'lead-sources', w: 1 }, { id: 'website-analytics', w: 1 }, { id: 'marketing', w: 1 }, { id: 'content-performance', w: 2 },
    ],
  },
  Operations: {
    name: 'Operations', layout: [
      { id: 'kpi-upcoming-meetings', w: 1 }, { id: 'kpi-calls-today', w: 1 }, { id: 'kpi-ai-today', w: 1 }, { id: 'kpi-hot-leads', w: 1 },
      { id: 'activity-feed', w: 2 }, { id: 'upcoming-meetings', w: 2 }, { id: 'overdue-tasks', w: 2 }, { id: 'ai-performance', w: 1 },
    ],
  },
  Content: {
    name: 'Content', layout: [
      { id: 'kpi-visitors', w: 1 }, { id: 'kpi-ai-today', w: 1 },
      { id: 'content-performance', w: 2 }, { id: 'lead-sources', w: 1 }, { id: 'product-analytics', w: 1 },
    ],
  },
}
export const DEFAULT_PRESET = 'CEO'
