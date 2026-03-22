import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PillTag } from '@/app/components/ui/tags'
import WorkoutDetail from './WorkoutDetail'

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
    .select('id, title, logged_date, duration_minutes, workout_types, workout_log, is_public, ai_structured, ai_formatted_at')
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

        {/* Raw workout log */}
        {log.workout_log && (
          <div className="mb-8">
            <p
              className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#6B6870] mb-3"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Workout Log
            </p>
            <div className="bg-[#1A1719] border border-[#3A373C] p-4">
              <pre
                className="text-[13px] text-[#A09EA3] leading-relaxed whitespace-pre-wrap break-words"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {log.workout_log}
              </pre>
            </div>
          </div>
        )}

        {/* Interactive: AI section + Edit/Delete */}
        <WorkoutDetail
          id={log.id}
          hasWorkoutLog={!!log.workout_log}
          aiStructured={log.ai_structured}
        />

      </div>
    </div>
  )
}