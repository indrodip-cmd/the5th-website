'use client'
/* Widget registry + shared data provider (3I.4).

   Every dashboard card is an independent component that self-registers here.
   The dashboard composes itself from the registry + the user's saved layout, so
   future modules (Finance, Marketing OS, …) add widgets without touching the
   dashboard core. A single provider fetches the common data bundles on a poll
   so the grid stays fast regardless of widget count. */
import React, { createContext, useContext, useEffect, useState } from 'react'

export type WidgetSize = 1 | 2 | 3 | 4
export interface WidgetDef {
  id: string
  title: string
  category: 'revenue' | 'crm' | 'meetings' | 'marketing' | 'analytics' | 'ai' | 'content' | 'product' | 'ops'
  defaultW: WidgetSize
  defaultH: 'sm' | 'md' | 'lg'
  Component: React.FC
}

const REGISTRY = new Map<string, WidgetDef>()
export function registerWidget(def: WidgetDef) { REGISTRY.set(def.id, def) }
export function getWidget(id: string): WidgetDef | undefined { return REGISTRY.get(id) }
export function allWidgets(): WidgetDef[] { return [...REGISTRY.values()] }

// ── Shared data ──
export interface WidgetData {
  cc: Record<string, unknown> | null
  revenue: Record<string, unknown> | null
  dashboard: Record<string, unknown> | null
  analytics: Record<string, unknown> | null
  activity: { items: Record<string, unknown>[] } | null
  loading: boolean
}
const Ctx = createContext<WidgetData>({ cc: null, revenue: null, dashboard: null, analytics: null, activity: null, loading: true })
export function useWidgetData() { return useContext(Ctx) }

async function j(url: string) { try { const r = await fetch(url); return r.ok ? await r.json() : null } catch { return null } }

export function WidgetDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<WidgetData>({ cc: null, revenue: null, dashboard: null, analytics: null, activity: null, loading: true })
  useEffect(() => {
    let alive = true
    const load = async () => {
      const [cc, revenue, dashboard, analytics, activity] = await Promise.all([
        j('/api/admin/command-center'), j('/api/admin/revenue'), j('/api/admin/crm/dashboard'),
        j('/api/admin/analytics'), j('/api/admin/activity'),
      ])
      if (alive) setData({ cc, revenue, dashboard, analytics, activity, loading: false })
    }
    load()
    const t = setInterval(load, 30000) // fast-poll "real-time"
    return () => { alive = false; clearInterval(t) }
  }, [])
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>
}
