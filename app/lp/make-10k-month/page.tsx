import FunnelView from './OptInView'
import { videoConfig, revealSecondsClient, typeformFormId } from './config'

export default function Make10kOptInPage() {
  const { url } = videoConfig()
  return <FunnelView videoUrl={url} revealSeconds={revealSecondsClient()} formId={typeformFormId()} />
}
