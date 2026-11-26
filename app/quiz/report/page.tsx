import type { Metadata } from 'next'
import { Suspense } from 'react'
import ReportLoader from './ReportLoader'

export const metadata: Metadata = {
  title: 'Your Income Blocker Report | The5th',
  robots: { index: false, follow: false },
}

export default function ReportPage() {
  return <Suspense fallback={null}><ReportLoader /></Suspense>
}
