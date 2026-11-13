'use client'

/* Progressive reveal over the shared VideoWall: starts at 12 clips (the
   first screenful), "View more" loads the remaining 12 — the full 24-clip
   library every other page uses, just not all dumped on screen at once. */
import React, { useState } from 'react'
import VideoWall, { VIDEO_REVIEWS } from '@/components/VideoWall'

const STAGES = [12, VIDEO_REVIEWS.length]

export default function VideoReveal({ columns = 3 }: { columns?: number }) {
  const [stage, setStage] = useState(0)
  const shown = STAGES[stage]
  const done = stage >= STAGES.length - 1
  return (
    <>
      <VideoWall columns={columns} limit={shown} />
      {!done && (
        <div className="video-reveal__cta">
          <button type="button" className="btn btn--quiet" onClick={() => setStage((s) => s + 1)}>
            View more
          </button>
        </div>
      )}
    </>
  )
}
