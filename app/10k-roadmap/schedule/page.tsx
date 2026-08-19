import { StepFrame } from '../ui'
import Schedule from './Schedule'

/* Step 1 — Pick a Time. The audit is free, so there is no pay gate: the
   calendar renders straight away. cal.com collects name + email at booking. */
export default function SchedulePage() {
  return <StepFrame current={0} wide><Schedule /></StepFrame>
}
