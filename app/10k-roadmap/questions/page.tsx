import { StepFrame, PayGate } from '../ui'
import { getPaidEmail } from '../serverGate'
import Questions from './Questions'

/* Server-gated: without a verified-payment cookie, the deep questions are never
   sent — the PayGate re-checks the DB and unlocks. Blocks direct-URL skipping. */
export default async function QuestionsPage() {
  const email = await getPaidEmail()
  return <StepFrame current={2}>{email ? <Questions /> : <PayGate />}</StepFrame>
}
