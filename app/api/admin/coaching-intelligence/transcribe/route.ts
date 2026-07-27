import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { transcribeAudio } from '@/lib/coaching-intelligence'

export const maxDuration = 300

// Admin: transcribe an uploaded audio/video recording (multipart) via Whisper.
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof Blob)) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    const name = (file as File).name || 'recording'
    const r = await transcribeAudio(file, name)
    return NextResponse.json(r, { status: r.ok ? 200 : 400 })
  } catch (e) {
    console.error('transcribe error', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
