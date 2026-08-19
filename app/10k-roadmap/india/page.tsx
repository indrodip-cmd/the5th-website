import Landing from './Landing'
import { videoUrl } from './config'

/* Server component: reads the India env-driven video URL and hands it to the
   client landing page. Mirrors the parent funnel's page. */
export default function RoadmapAuditIndiaPage() {
  return <Landing videoUrl={videoUrl()} />
}
