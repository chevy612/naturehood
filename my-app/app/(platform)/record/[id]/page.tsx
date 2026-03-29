import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PillTag } from '@/app/components/ui/tags'
import WorkoutDetail from './WorkoutDetail'
import WorkoutLogToggle from './WorkoutLogToggle'
import WorkoutActions from './WorkoutActions'

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ─────────────────────────────────────────────
// WORKOUT DETAIL PAGE
// ─────────────────────────────────────────────

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: log } = await supabase
    .from('training_logs')
    .select('id, title, logged_date, duration_minutes, workout_types, workout_log, is_public, ai_structured, ai_formatted_at, ai_needs_refresh')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .single()

  if (!log) redirect('/account')

  return (
    <div className="min-h-screen bg-[#141115] px-6 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <Link
          href="/account"
          className="inline-flex items-center gap-1 text-[11px] text-[#6B6870] hover:text-white transition-colors mb-8"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          ← My Training
        </Link>

        {/* Title */}
        <h1
          className="text-[22px] font-bold text-white leading-tight mb-2"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
        >
          {log.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span
            className="text-[12px] text-[#6B6870]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {formatDate(log.logged_date)}
          </span>
          {log.duration_minutes && (
            <PillTag label={`${log.duration_minutes} min`} variant="ghost-green" size="sm" />
          )}
          {log.is_public === false && (
            <PillTag label="Private" variant="ghost-dark" size="sm" />
          )}
          {log.workout_types?.map((type: string) => (
            <PillTag key={type} label={type} variant="ghost-dark" size="sm" />
          ))}
        </div>

        {/* AI analysis */}
        <WorkoutDetail
          id={log.id}
          hasWorkoutLog={!!log.workout_log}
          aiStructured={log.ai_structured}
          aiNeedsRefresh={log.ai_needs_refresh ?? false}
        />

        {/* Training log (collapsible) */}
        {log.workout_log && (
          <div className="mb-6">
            <WorkoutLogToggle workoutLog={log.workout_log} />
          </div>
        )}

        {/* Edit / Delete */}
        <WorkoutActions id={log.id} />

      </div>
    </div>
  )
}