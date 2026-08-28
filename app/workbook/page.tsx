import Workbook from './Workbook'

/* Server component. The Whop plan id is env-driven so it can change without a
   deploy, falling back to the live "THE KNOWLEDGE ASSET" plan ($7.93 one-time,
   product prod_N6s0DPIc5sQAA). The page itself is static + fast; the Whop
   embedded checkout mounts client-side in the checkout section. */
export default function WorkbookPage() {
  const planId = process.env.NEXT_PUBLIC_WHOP_WORKBOOK_PLAN_ID || 'plan_9p1vwkc9eoH2H'
  return <Workbook planId={planId} />
}
