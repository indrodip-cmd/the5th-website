'use client'
import { DIAGRAMS } from './diagrams'
export default function DiagramBody({ k, max }: { k: string; max?: number }) {
  return <div style={{ maxWidth: max, margin: '0 auto' }} dangerouslySetInnerHTML={{ __html: DIAGRAMS[k] }} />
}
