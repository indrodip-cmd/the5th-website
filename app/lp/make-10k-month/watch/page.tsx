import WatchView from './WatchView'
import { videoConfig, revealSecondsClient, typeformFormId } from '../config'

export default function Make10kWatchPage() {
  const { url } = videoConfig()
  return <WatchView videoUrl={url} revealSeconds={revealSecondsClient()} formId={typeformFormId()} />
}
