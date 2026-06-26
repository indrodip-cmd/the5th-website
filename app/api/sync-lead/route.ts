import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ATTIO_API_KEY = process.env.ATTIO_API_KEY
const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

async function syncToAttio(lead: {
  name: string
  email: string
  stage: string
  goal: string
  hours: string
  video_assigned: string
  quiz_answers: Record<string, string>
}) {
  if (!ATTIO_API_KEY) return null
  try {
    // Upsert person in Attio
    const personRes = await fetch('https://api.attio.com/v2/objects/people/records', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ATTIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          values: {
            email_addresses: [{ email_address: lead.email }],
            name: [{ full_name: lead.name }],
          }
        },
        matching_attribute: 'email_addresses',
      })
    })
    const person = await personRes.json()
    const personId = person?.data?.id?.record_id

    if (!personId) return null

    // Add note with quiz details
    await fetch('https://api.attio.com/v2/notes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ATTIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          parent_object: 'people',
          parent_record_id: personId,
          title: 'Quiz Funnel Lead',
          content: `Stage: ${lead.stage}\nGoal: ${lead.goal}\nHours/week: ${lead.hours}\nVideo assigned: ${lead.video_assigned}\n\nQuiz answers:\n${Object.entries(lead.quiz_answers).map(([k, v]) => `${k}: ${v}`).join('\n')}`,
          format: 'plaintext',
        }
      })
    })

    return personId
  } catch (err) {
    console.error('Attio sync error:', err)
    return null
  }
}

async function syncToBeehiiv(lead: {
  name: string
  email: string
  stage: string
}) {
  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) return null
  try {
    const firstName = lead.name.split(' ')[0]
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: lead.email,
          first_name: firstName,
          utm_source: 'quiz-funnel',
          utm_medium: 'quiz',
          utm_campaign: lead.stage,
          status: 'active',
          send_welcome_email: false,
          custom_fields: [
            { name: 'stage', value: lead.stage },
          ]
        })
      }
    )
    const data = await res.json()
    return data?.data?.id || null
  } catch (err) {
    console.error('Beehiiv sync error:', err)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, stage, goal, hours, video_assigned, quiz_answers } = body

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const [attioId, beehiivId] = await Promise.all([
      syncToAttio({ name, email, stage, goal, hours, video_assigned, quiz_answers }),
      syncToBeehiiv({ name, email, stage })
    ])

    return NextResponse.json({
      success: true,
      attio_id: attioId,
      beehiiv_id: beehiivId,
    })
  } catch (err) {
    console.error('Sync lead error:', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
