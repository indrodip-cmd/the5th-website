'use client'

/* Shared video-testimonial wall — used on /results and /chose-your-time.
   Single source of truth for the client review clips (Wistia + Facebook). */
import React from 'react'

export interface VideoReview { src: string; w: number; h: number }

export const VIDEO_REVIEWS: VideoReview[] = [
  { src: 'https://fast.wistia.net/embed/iframe/5yh07cwlui?seo=true&videoFoam=false', w: 560, h: 315 },
  { src: 'https://fast.wistia.net/embed/iframe/tnorqgs7dj?seo=true&videoFoam=false', w: 560, h: 315 },
  { src: 'https://fast.wistia.net/embed/iframe/yz9coq1jwd?seo=true&videoFoam=false', w: 560, h: 315 },
  { src: 'https://fast.wistia.net/embed/iframe/ukn3ruu2nr?seo=true&videoFoam=false', w: 560, h: 315 },
  { src: 'https://fast.wistia.net/embed/iframe/tikovukneu?seo=true&videoFoam=false', w: 560, h: 315 },
  { src: 'https://fast.wistia.net/embed/iframe/oni4jy3cuf?seo=true&videoFoam=false', w: 560, h: 315 },
  { src: 'https://fast.wistia.net/embed/iframe/tcqebjpgyk?seo=true&videoFoam=false', w: 560, h: 315 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1628699258559837%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F2068186330612350%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1041170600725458%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1340424980399186%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1002983741962578%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1000671825545007%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F2214638572292265%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1185750126579075%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1837980330329319%2F&show_text=false&width=269&t=0', w: 269, h: 476 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1696526020989444%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F660960940097323%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F9605505709570127%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F635711518831315%2F&show_text=false&width=267&t=0', w: 267, h: 476 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1468194697216348%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=316&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F471183985565185%2F&show_text=false&width=560&t=0', w: 560, h: 316 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F450258107449460%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
]

function VideoReviewCard({ review, index }: { review: VideoReview; index: number }) {
  return (
    <figure className="vw-card" style={{ breakInside: 'avoid', marginBottom: 20, background: '#231029', borderRadius: 16, overflow: 'hidden', boxShadow: '0 14px 34px -30px rgba(46,26,53,.6)' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: `${review.w} / ${review.h}` }}>
        <iframe
          src={review.src}
          title={`Client review ${index + 1}`}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    </figure>
  )
}

/** Masonry wall of video testimonials. Provide your own heading around it. */
export default function VideoWall({ columns = 3 }: { columns?: number }) {
  return (
    <>
      <style>{`
        .vw-masonry{column-count:${columns};column-gap:20px}
        .vw-card{transition:transform .2s ease, box-shadow .2s ease}
        .vw-card:hover{transform:translateY(-3px);box-shadow:0 22px 46px -30px rgba(46,26,53,.6)}
        @media(max-width:900px){.vw-masonry{column-count:2}}
        @media(max-width:560px){.vw-masonry{column-count:1}}
      `}</style>
      <div className="vw-masonry">
        {VIDEO_REVIEWS.map((r, i) => <VideoReviewCard key={r.src} review={r} index={i} />)}
      </div>
    </>
  )
}
