import FunnelView from './OptInView'
import { videoConfig } from './config'

export default function Make10kOptInPage() {
  const { url } = videoConfig()
  return <FunnelView videoUrl={url} />
}
