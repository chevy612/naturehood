import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Tag } from '@/app/components/ui/tags'
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
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub as string

  const { data: log } = await supabase
    .from('training_logs')
    .select('id, title, logged_date, duration_minutes, workout_types, workout_log, is_public, ai_structured, ai_formatted_at, ai_needs_refresh')
    .eq('id', id)
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .single()

  if (!log) redirect('/account')

  return (
    <div className="min-h-screen bg-[#141115] px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
      <div className="max-w-2xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Breadcrumb + actions toolbar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-[13px] text-[#847E89]">
            <Link href="/account" className="shrink-0 rounded px-1 -ml-1 hover:text-white transition-colors">
              My training
            </Link>
            <ChevronRight size={14} className="shrink-0 text-[#4A464D]" />
            <span className="min-w-0 truncate px-1 text-[#E8E8E8]">{log.title}</span>
          </nav>
          <WorkoutActions id={log.id} hasAiReport={!!log.ai_structured} />
        </div>

        {/* Title + meta */}
        <h1
          className="text-[22px] font-bold text-white leading-tight"
          style={{ fontFamily: "'Sk Modernist', sans-serif", letterSpacing: '-0.02em' }}
        >
          {log.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-[#847E89]">
          <span>{formatDate(log.logged_date)}</span>
          {log.duration_minutes && (
            <>
              <span className="text-[#4A464D]">·</span>
              <span>{log.duration_minutes} min</span>
            </>
          )}
          {log.workout_types?.map((type: string) => (
            <Tag key={type} variant="secondary" size="sm">{type}</Tag>
          ))}
          {log.is_public === false && (
            <Tag variant="outline" size="sm">Private</Tag>
          )}
        </div>

        {/* AI analysis */}
        <div className="mt-5">
          <WorkoutDetail
            id={log.id}
            hasWorkoutLog={!!log.workout_log}
            aiStructured={log.ai_structured}
            aiNeedsRefresh={log.ai_needs_refresh ?? false}
          />
        </div>

        {/* Training log (collapsible) */}
        {log.workout_log && (
          <div className="mt-10">
            <WorkoutLogToggle workoutLog={log.workout_log} />
          </div>
        )}

      </div>
    </div>
  )
}
