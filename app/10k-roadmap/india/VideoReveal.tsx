'use client'

/* Progressive reveal over the shared VideoWall: starts at 4 clips, "View
   more" takes it to 8, "View a few more" takes it to 12 — the same 24-clip
   library every other page uses, just not all dumped on screen at once. */
import React, { useState } from 'react'
import VideoWall from '@/components/VideoWall'

const STAGES = [4, 8, 12]

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
            {stage === 0 ? 'View more' : 'View a few more'}
          </button>
        </div>
      )}
    </>
  )
}
