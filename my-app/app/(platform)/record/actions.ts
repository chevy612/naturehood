'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function saveWorkout(
  formData: FormData
): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = (formData.get('title') as string | null)?.trim() ?? ''
  if (!title) return { error: 'Workout title is required.' }

  const loggedDate = (formData.get('logged_date') as string | null) ?? new Date().toISOString().split('T')[0]
  const durationRaw = formData.get('duration_minutes') as string | null
  const durationMinutes = durationRaw ? parseInt(durationRaw, 10) : null
  const workoutLog = (formData.get('workout_log') as string | null)?.trim() ?? null
  const isPublic = formData.get('is_public') === 'true'

  const { data, error } = await supabase
    .from('training_logs')
    .insert({
      user_id: user.id,
      title,
      logged_date: loggedDate,
      duration_minutes: durationMinutes && !isNaN(durationMinutes) ? durationMinutes : null,
      workout_log: workoutLog || null,
      is_public: isPublic,
    })
    .select('id')
    .single()

  if (error) return { error: 'Failed to save workout. Please try again.' }

  return { id: data.id }
}
