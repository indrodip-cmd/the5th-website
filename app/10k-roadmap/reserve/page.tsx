import Reserve from './Reserve'
import { auditPlanId } from '../config'

export default function ReservePage() {
  return <Reserve planId={auditPlanId()} />
}
