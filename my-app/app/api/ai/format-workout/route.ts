import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { formatWorkoutWithAI } from '@/lib/services/ai-workout'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id } = body as { id?: string }

  if (!id) {
    return NextResponse.json({ error: 'Missing workout id' }, { status: 400 })
  }

  // Fetch the workout — ownership enforced via RLS (user_id = auth.uid())
  const { data: log, error: fetchError } = await supabase
    .from('training_logs')
    .select('id, workout_log, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !log) {
    return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
  }

  if (!log.workout_log?.trim()) {
    return NextResponse.json({ error: 'No workout log text to format' }, { status: 422 })
  }

  const structured = await formatWorkoutWithAI(log.workout_log)

  if (!structured) {
    return NextResponse.json({ error: 'AI formatting failed' }, { status: 500 })
  }

  // Write result back to the row
  const { error: updateError } = await supabase
    .from('training_logs')
    .update({
      ai_structured: structured,
      ai_formatted_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save AI result' }, { status: 500 })
  }

  return NextResponse.json({ structured })
}