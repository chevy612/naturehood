'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Avatar } from './Avatar'
import { PillTag } from '@/app/components/ui/tags'
import type { AiStructuredWorkout, AiStructuredExercise } from '@/lib/types'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type WorkoutCardLog = {
  id: string
  title: string
  logged_date: string
  duration_minutes: number | null
  workout_types: string[] | null
  workout_log: string | null
  is_public?: boolean
  ai_structured?: AiStructuredWorkout | null
  ai_formatted_at?: string | null
}

export type WorkoutCardProfile = {
  name: string
  username: string | null
  avatar_url: string | null
}

type WorkoutCardProps = {
  log: WorkoutCardLog
  variant?: 'feed' | 'account' | 'grid'
  profile?: WorkoutCardProfile
  showEdit?: boolean
  showAnalyze?: boolean
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatExerciseMetrics(ex: AiStructuredExercise): string {
  const parts: string[] = []
  if (ex.sets && ex.reps) parts.push(`${ex.sets} × ${ex.reps}`)
  else if (ex.sets) parts.push(`${ex.sets} sets`)
  else if (ex.reps) parts.push(`${ex.reps} reps`)
  if (ex.weight_kg) parts.push(`${ex.weight_kg} kg`)
  if (ex.distance_km) parts.push(`${ex.distance_km} km`)
  if (ex.duration_seconds) parts.push(`${Math.round(ex.duration_seconds / 60)} min`)
  return parts.join(' · ')
}

const TRUNCATE_LENGTH = 120
const INTENSITY_PILL_VARIANT: Record<string, 'ghost-green' | 'ghost-dark'> = {
  high: 'ghost-green',
  moderate: 'ghost-dark',
  low: 'ghost-dark',
}

// ─────────────────────────────────────────────
// AI SECTION — shared between both variants
// ─────────────────────────────────────────────

function AiSection({ ai, showExercises }: { ai: AiStructuredWorkout; showExercises: boolean }) {
  const intensityVariant = ai.estimated_intensity
    ? INTENSITY_PILL_VARIANT[ai.estimated_intensity]
    : 'ghost-dark'
  const summary = ai.summary && ai.summary.length > 100
    ? ai.summary.slice(0, 100).trimEnd() + '…'
    : ai.summary

  return (
    <div className="border-t border-[#3A373C] mt-3 pt-3">
      {/* Label row */}
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          AI
        </span>
        {ai.estimated_intensity && (
          <PillTag label={ai.estimated_intensity} variant={intensityVariant} size="sm" />
        )}
        {ai.exercises.length > 0 && (
          <span
            className="text-[11px] text-[#6B6870]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {ai.exercises.length} exercise{ai.exercises.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <p
          className="text-[12px] text-[#6B6870] leading-relaxed italic mb-2"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {summary}
        </p>
      )}

      {/* Exercise list (account only) */}
      {showExercises && ai.exercises.length > 0 && (
        <div className="space-y-1 mt-2">
          {ai.exercises.map((ex, i) => {
            const metrics = formatExerciseMetrics(ex)
            return (
              <div key={i} className="flex items-baseline justify-between gap-4">
                <span
                  className="text-[12px] text-white truncate"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {ex.name}
                </span>
                {metrics && (
                  <span
                    className="text-[12px] text-[#6B6870] shrink-0"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {metrics}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// ANALYZE WITH AI BUTTON
// ─────────────────────────────────────────────

function AnalyzeButton({ id }: { id: string }) {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  const handleAnalyze = async () => {
    setState('loading')
    try {
      const res = await fetch('/api/ai/format-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setState('done')
        router.refresh()
      } else {
        setState('idle')
      }
    } catch {
      setState('idle')
    }
  }

  if (state === 'done') return null

  return (
    <button
      onClick={handleAnalyze}
      disabled={state === 'loading'}
      className="mt-2 text-[11px] font-medium text-[#C8F04D] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {state === 'loading' ? 'Analyzing…' : 'Analyze with AI →'}
    </button>
  )
}

// ─────────────────────────────────────────────
// WORKOUT CARD
// ─────────────────────────────────────────────

export function WorkoutCard({ log, variant = 'feed', profile, showEdit = false, showAnalyze = false }: WorkoutCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // ── Grid variant ──────────────────────────────────────────────────────────
  if (variant === 'grid') {
    const firstType = log.workout_types?.[0] ?? null
    return (
      <Link href={`/record/${log.id}`} className="block aspect-square">
        <div className="h-full border border-[#3A373C] bg-[#1A1719] p-4 hover:border-[#C8F04D]/40 transition-colors flex flex-col justify-between">
          {/* Top: AI indicator + type */}
          <div className="flex items-center justify-between gap-1">
            {firstType && (
              <PillTag label={firstType} variant="ghost-green" size="sm" />
            )}
            {log.ai_structured && (
              <span
                className="text-[9px] font-semibold tracking-[0.25em] uppercase text-[#C8F04D]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                AI
              </span>
            )}
          </div>

          {/* Middle: title */}
          <p
            className="text-[13px] font-semibold text-white leading-snug line-clamp-2 my-2"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}
          >
            {log.title}
          </p>

          {/* Bottom: duration + date */}
          <div className="flex flex-col gap-1">
            {log.duration_minutes && (
              <span
                className="text-[11px] text-[#6B6870]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {log.duration_minutes} min
              </span>
            )}
            <span
              className="text-[10px] text-[#6B6870]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {formatDate(log.logged_date)}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  // ── Feed variant ─────────────────────────────────────────────────────────
  if (variant === 'feed') {
    const displayName = profile?.name ?? profile?.username ?? 'Member'
    const username = profile?.username ?? null
    const isTruncated = (log.workout_log?.length ?? 0) > TRUNCATE_LENGTH

    const logPreview = log.workout_log
      ? isExpanded
        ? log.workout_log
        : log.workout_log.length > TRUNCATE_LENGTH
          ? log.workout_log.slice(0, TRUNCATE_LENGTH).trimEnd() + '…'
          : log.workout_log
      : null

    return (
      <div className="border border-[#3A373C] bg-[#1A1719] p-5">
        {/* Header: avatar + name + date */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar name={displayName} size="sm" photoUrl={profile?.avatar_url ?? null} />
          <div className="flex-1 min-w-0">
            <p
              className="text-[13px] font-semibold text-white leading-tight"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {displayName}
            </p>
            {username && (
              <Link
                href={`/${username}`}
                className="text-[11px] text-[#6B6870] hover:text-[#A09EA3] transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                @{username}
              </Link>
            )}
          </div>
          <span
            className="text-[11px] text-[#6B6870] shrink-0 pt-0.5"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {formatDate(log.logged_date)}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-[15px] font-bold text-white mb-3 leading-snug"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}
        >
          {log.title}
        </h3>

        {/* Pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {log.duration_minutes && (
            <PillTag label={`${log.duration_minutes} min`} variant="ghost-green" size="sm" />
          )}
          {log.workout_types?.map((type) => (
            <PillTag key={type} label={type} variant="ghost-dark" size="sm" />
          ))}
        </div>

        {/* Log preview */}
        {logPreview && (
          <p
            className="text-[13px] text-[#6B6870] leading-relaxed whitespace-pre-line"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {logPreview}
          </p>
        )}

        {isTruncated && (
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="mt-2 text-[11px] font-medium text-[#C8F04D] hover:text-white transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {isExpanded ? 'Show less' : 'See more'}
          </button>
        )}

        {/* AI section */}
        {log.ai_structured && (
          <AiSection ai={log.ai_structured} showExercises={false} />
        )}
      </div>
    )
  }

  // ── Account variant ───────────────────────────────────────────────────────
  return (
    <div className="py-4">
      {/* Title row: title + badges + edit */}
      <div className="flex items-start justify-between gap-4 mb-1">
        <p
          className="text-[14px] font-semibold text-white leading-snug"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {log.title}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {log.is_public === false && (
            <PillTag label="Private" variant="ghost-dark" size="sm" />
          )}
          {log.duration_minutes && (
            <PillTag label={`${log.duration_minutes} min`} variant="ghost-green" size="sm" />
          )}
          {showEdit && (
            <Link
              href={`/record/${log.id}/edit`}
              className="text-[11px] font-medium text-[#6B6870] hover:text-[#C8F04D] transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Date */}
      <p
        className="text-[12px] text-[#6B6870] mb-2"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {formatDate(log.logged_date)}
      </p>

      {/* Workout type pills */}
      {log.workout_types && log.workout_types.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {log.workout_types.map((type) => (
            <PillTag key={type} label={type} variant="ghost-green" size="sm" />
          ))}
        </div>
      )}

      {/* Log preview */}
      {log.workout_log && (
        <p
          className="text-[12px] text-[#6B6870] leading-relaxed whitespace-pre-line"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {log.workout_log.length > TRUNCATE_LENGTH
            ? log.workout_log.slice(0, TRUNCATE_LENGTH).trimEnd() + '…'
            : log.workout_log}
        </p>
      )}

      {/* AI section — full exercise list if structured, button if not */}
      {log.ai_structured ? (
        <AiSection ai={log.ai_structured} showExercises={true} />
      ) : showAnalyze && log.workout_log ? (
        <AnalyzeButton id={log.id} />
      ) : null}
    </div>
  )
}
