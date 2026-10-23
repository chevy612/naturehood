'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Avatar } from './Avatar'
import { Tag } from '@/app/components/ui/tags'
import { Button } from '@/app/components/ui/buttons'
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

// ─────────────────────────────────────────────
// AI SECTION — shared between both variants
// ─────────────────────────────────────────────

function AiSection({ ai, showExercises }: { ai: AiStructuredWorkout; showExercises: boolean }) {
  const summary = ai.summary && ai.summary.length > 100
    ? ai.summary.slice(0, 100).trimEnd() + '…'
    : ai.summary

  return (
    <div className="border-t border-[#3A373C] mt-3 pt-3">
      {/* Label row */}
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#F5F5F5]"
          style={{ fontFamily: "'Sk Modernist', sans-serif" }}
        >
          AI
        </span>
        {ai.estimated_intensity && (
          <Tag variant={ai.estimated_intensity === 'high' ? 'destructive' : 'secondary'} size="sm">
            {ai.estimated_intensity} intensity
          </Tag>
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
// WORKOUT CARD
// ─────────────────────────────────────────────

export function WorkoutCard({ log, variant = 'feed', profile, showEdit = false }: WorkoutCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // ── Grid variant ──────────────────────────────────────────────────────────
  if (variant === 'grid') {
    const firstType = log.workout_types?.[0] ?? null
    return (
      <Link href={`/record/${log.id}`} className="block aspect-square">
        <div className="h-full border border-[#3A373C] bg-[#1A1719] p-4 rounded-lg hover:border-[#F5F5F5]/40 transition-colors flex flex-col justify-between">
          {/* Top: AI indicator + type */}
          <div className="flex items-center justify-between gap-1">
            {firstType && (
              <Tag variant="green" size="sm">{firstType}</Tag>
            )}
            {log.ai_structured && (
              <span
                className="text-[9px] font-semibold tracking-[0.25em] uppercase text-[#F5F5F5]"
                style={{ fontFamily: "'Sk Modernist', sans-serif" }}
              >
                AI
              </span>
            )}
          </div>

          {/* Middle: title */}
          <p
            className="text-[13px] font-semibold text-white leading-snug line-clamp-2 my-2"
            style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em' }}
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
      <div className="border border-[#3A373C] bg-[#1A1719] p-5 rounded-lg">
        {/* Header: avatar + name + date */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar name={displayName} size="sm" photoUrl={profile?.avatar_url ?? null} />
          <div className="flex-1 min-w-0">
            <p
              className="text-[13px] font-semibold text-white leading-tight"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
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
          style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em' }}
        >
          {log.title}
        </h3>

        {/* Pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {log.workout_types?.map((type) => (
            <Tag key={type} variant="green">{type}</Tag>
          ))}
          {log.duration_minutes && (
            <Tag variant="secondary">{log.duration_minutes} min</Tag>
          )}
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
          <Button variant="link" onClick={() => setIsExpanded((v) => !v)} className="mt-2">
            {isExpanded ? 'Show less' : 'See more'}
          </Button>
        )}

        {/* AI section */}
        {log.ai_structured && (
          <AiSection ai={log.ai_structured} showExercises={false} />
        )}
      </div>
    )
  }

  // ── Account variant — mirrors mobile WorkoutCard (compact · detailed) ────
  const ai = log.ai_structured
  const aiSummary = ai?.summary as unknown
  const description =
    typeof aiSummary === 'string'
      ? aiSummary.trim() || null
      : (aiSummary as { session_notes?: string | null } | undefined)?.session_notes?.trim() || null
  const exercises = Array.isArray(ai?.exercises) ? ai.exercises : []
  const loggedDate = new Date(log.logged_date + 'T00:00:00')
  const isoDate = `${loggedDate.getFullYear()}-${String(loggedDate.getMonth() + 1).padStart(2, '0')}-${String(loggedDate.getDate()).padStart(2, '0')}`
  const weekday = loggedDate.toLocaleDateString('en-US', { weekday: 'short' })

  const content = (
    <>
      {/* Date + day */}
      <div className="mb-1.5 flex justify-between text-[12px] tracking-wide text-[#847E89]">
        <span>{isoDate}</span>
        <span>{weekday}</span>
      </div>

      {/* Title */}
      <p className="mb-2 text-[24px] font-bold leading-tight tracking-tight text-white">{log.title}</p>

      {/* Tags */}
      {((log.workout_types?.length ?? 0) > 0 || log.duration_minutes != null || ai?.estimated_intensity || log.is_public === false) && (
        <div className="mb-2 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {log.workout_types?.map((type) => (
            <Tag key={type} variant="green">{type}</Tag>
          ))}
          {log.duration_minutes != null && (
            <Tag variant="secondary">{log.duration_minutes} min</Tag>
          )}
          {ai?.estimated_intensity && (
            <Tag variant={ai.estimated_intensity === 'high' ? 'destructive' : 'secondary'}>
              {ai.estimated_intensity} intensity
            </Tag>
          )}
          {log.is_public === false && (
            <Tag variant="secondary">Private</Tag>
          )}
        </div>
      )}

      {/* Description */}
      {description && <p className="text-[14px] leading-relaxed text-[#847E89]">{description}</p>}

      {/* Exercises */}
      {exercises.length > 0 && (
        <div className="mt-5 flex flex-col gap-1 border-t border-[#3D3940] pt-5">
          {exercises.map((ex, i) => (
            <p key={i} className="text-[14px] leading-relaxed text-[#847E89]">· {ex.name}</p>
          ))}
        </div>
      )}
    </>
  )

  return (
    <div className="rounded-2xl bg-[#201D22] p-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {showEdit ? (
        <Link href={`/record/${log.id}`} className="block transition-opacity hover:opacity-90">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  )
}
