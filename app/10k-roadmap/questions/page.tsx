import { StepFrame } from '../ui'
import Questions from './Questions'

/* Step 2 — A Few Questions. The audit is free, so there is no pay gate; the
   deep-diagnostic Typeform renders straight away after the time is picked. */
export default function QuestionsPage() {
  return <StepFrame current={1}><Questions /></StepFrame>
}
