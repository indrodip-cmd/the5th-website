import { StepFrame, PayGate } from '../ui'
import { getPaidEmail } from '../serverGate'
import Schedule from './Schedule'

/* Server-gated: the calendar is only rendered for a verified-paid session. */
export default async function SchedulePage() {
  const email = await getPaidEmail()
  return <StepFrame current={3} wide>{email ? <Schedule /> : <PayGate />}</StepFrame>
}
