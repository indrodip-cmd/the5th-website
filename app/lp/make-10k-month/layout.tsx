import type { Metadata } from 'next'

/* Cold-traffic funnel: keep it out of the index and give it its own metadata.
   No site navigation is rendered anywhere in this route so paid traffic has a
   single path: opt-in → watch → book. */
export const metadata: Metadata = {
  title: 'Free Training: Your First $10K Month | The5th Consulting',
  description:
    'A free training for experts, coaches and consultants over 40 on turning decades of expertise into a predictable $10K a month.',
  robots: { index: false, follow: false },
}

export default function Make10kLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
