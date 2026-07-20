import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { listCourses, createCourse, updateCourse, deleteCourse } from '@/lib/platform/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ courses: await listCourses() })
}

export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  if (!b.title) return NextResponse.json({ error: 'title required' }, { status: 400 })
  try { return NextResponse.json(await createCourse(b)) }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, ...updates } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  try { return NextResponse.json(await updateCourse(id, updates)) }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  return NextResponse.json(await deleteCourse(id))
}
