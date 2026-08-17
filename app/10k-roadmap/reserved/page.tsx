import { Suspense } from 'react'
import Reserved from './Reserved'

export default function ReservedPage() {
  return <Suspense fallback={null}><Reserved /></Suspense>
}
