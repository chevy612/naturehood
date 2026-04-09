'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { AiStructuredWorkout, AthleteSessionLog } from '@/lib/types'
import { persistNormalizedSession } from '@/lib/services/session-persist'

export async function getUserWorkoutTypes(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) return []

  const { data: rows } = await supabase
    .from('training_logs')
    .select('workout_types')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .not('workout_types', 'is', null)

  if (!rows) return []

  const all = rows.flatMap((row) => row.workout_types ?? [])
  return [...new Set(all)].sort()
}

export async function saveWorkout(
  formData: FormData
): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect('/login')

  const title = (formData.get('title') as string | null)?.trim() ?? ''
  if (!title) return { error: 'Workout title is required.' }

  const loggedDate = (formData.get('logged_date') as string | null) ?? new Date().toISOString().split('T')[0]
  const durationRaw = formData.get('duration_minutes') as string | null
  const durationMinutes = durationRaw ? parseInt(durationRaw, 10) : null
  const workoutLog = (formData.get('workout_log') as string | null)?.trim() ?? null
  const isPublic = formData.get('is_public') === 'true'

  let workoutTypes: string[] = []
  try {
    const raw = formData.get('workout_types') as string | null
    if (raw) workoutTypes = JSON.parse(raw)
  } catch {}

  const { data: inserted, error } = await supabase
    .from('training_logs')
    .insert({
      user_id: userId,
      title,
      logged_date: loggedDate,
      duration_minutes: durationMinutes && !isNaN(durationMinutes) ? durationMinutes : null,
      workout_log: workoutLog || null,
      is_public: isPublic,
      workout_types: workoutTypes,
    })
    .select('id')
    .single()

  if (error) return { error: 'Failed to save workout. Please try again.' }

  return { id: inserted.id }
}

export async function updateWorkout(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect('/login')

  const title = (formData.get('title') as string | null)?.trim() ?? ''
  if (!title) return { error: 'Workout title is required.' }

  const loggedDate = (formData.get('logged_date') as string | null) ?? new Date().toISOString().split('T')[0]
  const durationRaw = formData.get('duration_minutes') as string | null
  const durationMinutes = durationRaw ? parseInt(durationRaw, 10) : null
  const workoutLog = (formData.get('workout_log') as string | null)?.trim() ?? null
  const isPublic = formData.get('is_public') === 'true'

  let workoutTypes: string[] = []
  try {
    const raw = formData.get('workout_types') as string | null
    if (raw) workoutTypes = JSON.parse(raw)
  } catch {}

  // Pre-flight read: check if ai_structured exists and if workout_log actually changed
  const { data: current } = await supabase
    .from('training_logs')
    .select('ai_structured, workout_log')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  const workoutLogChanged = (workoutLog ?? '').trim() !== (current?.workout_log ?? '').trim()
  const needsAiRefresh = !!current?.ai_structured && workoutLogChanged

  const { error } = await supabase
    .from('training_logs')
    .update({
      title,
      logged_date: loggedDate,
      duration_minutes: durationMinutes && !isNaN(durationMinutes) ? durationMinutes : null,
      workout_log: workoutLog || null,
      is_public: isPublic,
      workout_types: workoutTypes,
      ai_needs_refresh: needsAiRefresh,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)  // ownership check

  if (error) return { error: 'Failed to update workout. Please try again.' }

  redirect('/account')
}

export async function updateAiStructured(
  id: string,
  structured: AiStructuredWorkout | AthleteSessionLog
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect('/login')

  const { error } = await supabase
    .from('training_logs')
    .update({
      ai_structured: structured,
      ai_formatted_at: new Date().toISOString(),
      ai_needs_refresh: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return { error: 'Failed to save workout report.' }

  // Sync to normalized tables (V2 only)
  if ('parser_version' in structured) {
    await persistNormalizedSession(supabase, id, userId, structured as AthleteSessionLog)
  }

  redirect('/account')
}

export async function deleteWorkout(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect('/login')

  const { error } = await supabase
    .from('training_logs')
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return { error: 'Failed to delete workout.' }

  redirect('/account')
}
