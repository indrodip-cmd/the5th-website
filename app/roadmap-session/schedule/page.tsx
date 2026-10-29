import { Suspense } from 'react'
import Schedule from './Schedule'

export default function SchedulePage() {
  return (
    <Suspense fallback={null}>
      <Schedule />
    </Suspense>
  )
}
