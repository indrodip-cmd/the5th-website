import { Suspense } from 'react'
import Pay from './Pay'
import { auditPlanId } from '../config'

export default function PayPage() {
  return <Suspense fallback={null}><Pay planId={auditPlanId()} /></Suspense>
}
