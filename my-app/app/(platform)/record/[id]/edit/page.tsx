import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditForm from './EditForm'
import { getUserWorkoutTypes } from '../../actions'

// ─────────────────────────────────────────────
// EDIT WORKOUT PAGE
// ─────────────────────────────────────────────

export default async function EditWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: log } = await supabase
    .from('training_logs')
    .select('id, title, logged_date, duration_minutes, workout_types, workout_log, is_public')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!log) redirect('/account')

  const previousTypes = await getUserWorkoutTypes()

  return (
    <div className="min-h-screen bg-[#141115] px-6 py-10">
      <div className="max-w-xl mx-auto">
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-8"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Edit Workout
        </p>
        <EditForm
          id={log.id}
          initialTitle={log.title}
          initialDate={log.logged_date}
          initialDuration={log.duration_minutes?.toString() ?? ''}
          initialWorkoutTypes={log.workout_types ?? []}
          initialWorkoutLog={log.workout_log ?? ''}
          initialIsPublic={log.is_public}
          previousTypes={previousTypes}
        />
      </div>
    </div>
  )
}
