import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const getResend = () => {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY not configured')
  return new Resend(key)
}

const buildRoadmapHtml = (roadmap: string): string => {
  const lines = roadmap.split('\n')
  let html = ''
  let inList = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (inList) { html += '</ul>'; inList = false }
      html += '<div style="height:8px"></div>'
      continue
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false }
      const title = trimmed.replace('## ', '')
      html += `
        <div style="margin-top:28px;margin-bottom:10px;padding-top:20px;
          border-top:2px solid #eaf4ee;">
          <div style="font-size:10px;font-weight:700;letter-spacing:2px;
            color:#1d5c3a;text-transform:uppercase;margin-bottom:6px;
            font-family:sans-serif;">
            ${title}
          </div>
        </div>`
      continue
    }
    if (trimmed.startsWith('# ')) continue
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) { html += '<ul style="margin:8px 0;padding-left:0;list-style:none;">'; inList = true }
      const item = trimmed.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      html += `<li style="padding:4px 0 4px 16px;position:relative;
        font-size:13px;color:#3d3d3d;line-height:1.65;font-family:sans-serif;
        border-left:2px solid #1d5c3a;margin-bottom:4px;">
        ${item}</li>`
      continue
    }
    if (inList) { html += '</ul>'; inList = false }
    const formatted = trimmed
      .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#0a0a0a;">$1</strong>')
    html += `<p style="margin:6px 0;font-size:13px;color:#3d3d3d;
      line-height:1.75;font-family:sans-serif;">${formatted}</p>`
  }
  if (inList) html += '</ul>'
  return html
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, roadmap, stage, goal, hours, videoSlug, archetype, personality } = body

    const personalityLabels: Record<string, string> = {
      'action': 'The Driver',
      'connection': 'The Flow Worker',
      'ideas': 'The Deep Thinker',
      'meaning': 'The Gentle Builder',
    }
    const personalityLabel = personalityLabels[personality as string] || 'The Driver'
    const archetypeLabel = (archetype as string) || 'The Pioneer'

    if (!name || !email || !roadmap) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const firstName = name.split(' ')[0]
    const videoUrl = `https://quiz.the5th.consulting/video/${videoSlug || 'v1'}`

    // Generate PDF via Render microservice
    const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'https://the5th-pdf-service.onrender.com'
    let pdfAttachment: Array<{ filename: string; content: string }> | undefined = undefined

    try {
      // Wake up Render service (free tier cold-starts up to 30s)
      fetch(`${PDF_SERVICE_URL}/health`).catch(() => {})
      await new Promise(r => setTimeout(r, 5000))

      const pdfRes = await fetch(`${PDF_SERVICE_URL}/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          stage: stage || 'launched',
          goal: goal || '$5K-$10K / month',
          hours: hours || '10-20',
          video_url: videoUrl,
          roadmap,
          archetype: archetypeLabel,
          personality: personalityLabel,
        }),
        signal: AbortSignal.timeout(90000),
      })
      if (pdfRes.ok) {
        const pdfBytes = await pdfRes.arrayBuffer()
        const pdfBase64 = Buffer.from(pdfBytes).toString('base64')
        pdfAttachment = [{ filename: `${firstName}-blueprint.pdf`, content: pdfBase64 }]
        console.log('PDF received, size:', pdfBytes.byteLength)
      } else {
        console.error('PDF service error:', pdfRes.status, await pdfRes.text())
      }
    } catch (err) {
      console.error('PDF generation failed, sending without attachment:', err)
    }

    const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${firstName}, your personalised blueprint is ready</title>
</head>
<body style="margin:0;padding:0;background:#f6f4f0;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4f0;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr><td style="background:#060a07;padding:24px 40px;border-radius:12px 12px 0 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="color:#ffffff;font-weight:700;font-size:13px;
          letter-spacing:2px;font-family:sans-serif;">
          THE5TH CONSULTING
        </td>
        <td align="right" style="color:#3a9a64;font-size:10px;
          font-weight:700;letter-spacing:1px;font-family:sans-serif;">
          PERSONALISED BLUEPRINT
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top:4px;color:#4a7a5a;
          font-size:11px;font-family:sans-serif;">
          quiz.the5th.consulting
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- HERO -->
  <tr><td style="background:#ffffff;padding:40px 40px 32px;
    border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
    <div style="font-size:10px;font-weight:700;letter-spacing:2px;
      color:#1d5c3a;text-transform:uppercase;margin-bottom:12px;
      font-family:sans-serif;">
      YOUR EXPERT ARCHETYPE BLUEPRINT
    </div>
    <div style="font-size:28px;font-weight:700;color:#0a0a0a;
      line-height:1.2;margin-bottom:4px;font-family:Georgia,serif;">
      ${firstName}, you are
    </div>
    <div style="font-size:28px;font-weight:700;color:#1c4a32;
      font-style:italic;line-height:1.2;margin-bottom:8px;
      font-family:Georgia,serif;">
      ${archetypeLabel}.
    </div>
    <div style="display:inline-block;background:#8b7fcf;color:#fff;
      font-size:11px;font-weight:700;letter-spacing:1.5px;
      text-transform:uppercase;padding:6px 16px;border-radius:50px;
      margin-bottom:20px;font-family:sans-serif;">
      ${personalityLabel}
    </div>
    <p style="font-size:14px;color:#6b6b6b;line-height:1.65;
      margin:0 0 28px;font-family:sans-serif;">
      Here is the strategy built specifically for your personality type.
      Your full personalised report is below.
    </p>
    <!-- Stat pills -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f6f4f0;border-top:2px solid #1d5c3a;">
      <tr>
        <td style="padding:12px 16px;border-right:1px solid #e0e0e0;">
          <div style="font-size:9px;font-weight:700;color:#888;
            letter-spacing:1px;text-transform:uppercase;
            margin-bottom:4px;font-family:sans-serif;">ARCHETYPE</div>
          <div style="font-size:13px;font-weight:700;color:#1c4a32;
            font-family:sans-serif;">${archetypeLabel}</div>
        </td>
        <td style="padding:12px 16px;border-right:1px solid #e0e0e0;">
          <div style="font-size:9px;font-weight:700;color:#888;
            letter-spacing:1px;text-transform:uppercase;
            margin-bottom:4px;font-family:sans-serif;">PERSONALITY</div>
          <div style="font-size:13px;font-weight:700;color:#8b7fcf;
            font-family:sans-serif;">${personalityLabel}</div>
        </td>
        <td style="padding:12px 16px;">
          <div style="font-size:9px;font-weight:700;color:#888;
            letter-spacing:1px;text-transform:uppercase;
            margin-bottom:4px;font-family:sans-serif;">6-MONTH GOAL</div>
          <div style="font-size:13px;font-weight:700;color:#9a7a1a;
            font-family:sans-serif;">${goal || '$5K-$10K / month'}</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="height:1px;background:#e0e0e0;
    border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
  </td></tr>

  <!-- ROADMAP CONTENT -->
  <tr><td style="background:#ffffff;padding:32px 40px;
    border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
    ${buildRoadmapHtml(roadmap)}
  </td></tr>

  <!-- BOOKING CTA -->
  <tr><td style="background:#060a07;padding:48px 40px;
    border-top:2px solid #1d5c3a;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <div style="font-size:9px;font-weight:700;letter-spacing:2px;
          color:#3a9a64;text-transform:uppercase;margin-bottom:12px;
          font-family:sans-serif;">YOUR NEXT STEP</div>
        <div style="font-size:22px;font-weight:700;color:#ffffff;
          margin-bottom:12px;font-family:Georgia,serif;">
          Let's build this together.
        </div>
        <p style="font-size:13px;color:#8ab49a;line-height:1.75;
          margin:0 0 28px;font-family:sans-serif;max-width:420px;">
          Your blueprint shows you <em>what</em> to do. A 60-minute call with Indrodip shows you
          <em>exactly how</em> to do it — in your business, at your stage, with your constraints.
          No pitch. No pressure. Just clarity on your next move.
        </p>
        <a href="https://cal.com/indrodip-ghosh-ut1vxh/60min"
          style="display:inline-block;background:#8b7fcf;color:#ffffff;
          text-decoration:none;padding:16px 40px;font-weight:700;
          font-size:15px;border-radius:50px;font-family:sans-serif;
          letter-spacing:0.3px;">
          Book Your Free 60-Min Strategy Call &#8594;
        </a>
        <p style="color:#4a6a54;font-size:11px;margin:16px 0 0;
          font-family:sans-serif;text-align:center;">
          Free &nbsp;·&nbsp; 60 minutes &nbsp;·&nbsp; No obligation
        </p>
        <div style="margin-top:28px;padding-top:20px;
          border-top:1px solid #1a2a1e;">
          <p style="color:#4a6a54;font-size:11px;margin:0;
            font-family:sans-serif;text-align:center;">
            The5th Consulting &nbsp;|&nbsp; support@10kroadmap.org
            &nbsp;|&nbsp; quiz.the5th.consulting
          </p>
        </div>
      </td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

    // Send via Resend
    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: 'Indrodip at The5th <Indrodip@10kroadmap.org>',
      to: email,
      subject: `${firstName}, your ${archetypeLabel} blueprint is ready`,
      html: emailHtml,
      attachments: pdfAttachment,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, emailId: data?.id })

  } catch (err) {
    console.error('PDF route error:', err)
    return NextResponse.json({ error: 'Failed to send blueprint' }, { status: 500 })
  }
}
