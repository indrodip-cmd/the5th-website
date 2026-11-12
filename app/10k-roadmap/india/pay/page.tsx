import { Suspense } from 'react'
import Pay from './Pay'
import { auditIndiaPlanId } from '../config'

export default function PayIndiaPage() {
  return <Suspense fallback={null}><Pay planId={auditIndiaPlanId()} /></Suspense>
}
