import type { Metadata } from 'next'

/* Checkout — not for the index. */
export const metadata: Metadata = {
  title: 'Checkout | The5th Consulting',
  robots: { index: false, follow: true },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
