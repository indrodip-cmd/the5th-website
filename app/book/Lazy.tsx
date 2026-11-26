'use client'
/* Below-the-fold blocks, code-split and mounted only near the viewport. */
import { lazy } from 'react'
import Defer from './Defer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyC = React.ComponentType<any>
function mk<P extends object = object>(load: () => Promise<{ default: AnyC }>, minHeight: number, margin?: string) {
  const C = lazy(load)
  return function Lazy(p: P) { return <Defer minHeight={minHeight} margin={margin}><C {...p} /></Defer> }
}
const IB = () => import('./InteractiveBelow')
const GB = () => import('./GraphicsBelow')
export const PainCheck = mk(() => IB().then(m => ({ default: m.PainCheck })), 420)
export const ChapterExplorer = mk(() => IB().then(m => ({ default: m.ChapterExplorer })), 520)
export const Flipbook = mk(() => IB().then(m => ({ default: m.Flipbook })), 560)
export const SlideToBuy = mk(() => IB().then(m => ({ default: m.SlideToBuy })), 120)
export const RoadmapBuilder = mk(() => IB().then(m => ({ default: m.RoadmapBuilder })), 520)
export const LeadMagnet = mk(() => IB().then(m => ({ default: m.LeadMagnet })), 360)
export const HourMath = mk(() => GB().then(m => ({ default: m.HourMath })), 420)
export const TryChapter = mk(() => GB().then(m => ({ default: m.TryChapter })), 420)
export const TwoPaths = mk(() => GB().then(m => ({ default: m.TwoPaths })), 420)
export const Timeline30 = mk(() => GB().then(m => ({ default: m.Timeline30 })), 420)
export const Objections = mk(() => GB().then(m => ({ default: m.Objections })), 420)
export const Diagram = mk<{ k: string; max?: number }>(() => import('./DiagramBody'), 260)
export const CheckoutPanel = mk(() => import('./CheckoutPanel'), 620, '1400px')
