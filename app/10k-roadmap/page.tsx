import Landing from './Landing'
import { videoUrl } from './config'

/* Server component: reads the env-driven video URL and hands it to the client
   landing page. Keeps secrets/config server-side; the page itself is static
   and fast (the VSL lazy-loads on play). */
export default function RoadmapAuditPage() {
  return <Landing videoUrl={videoUrl()} />
}
