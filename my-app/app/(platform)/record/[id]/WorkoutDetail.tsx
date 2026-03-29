'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { AiStructuredWorkout, AiStructuredExercise, AthleteSessionLog } from '@/lib/types'
import { SessionResult } from '@/app/components/platform/SessionResult'

function isV2(ai: AiStructuredWorkout | AthleteSessionLog): ai is AthleteSessionLog {
  const s = (ai as AthleteSessionLog).summary
  return s !== null && s !== undefined && typeof s === 'object'
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

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

const INTENSITY_COLOR: Record<string, string> = {
  high: '#C8F04D',
  moderate: '#A09EA3',
  low: '#A09EA3',
}

// ─────────────────────────────────────────────
// SHARED AI ANALYSIS HELPER
// ─────────────────────────────────────────────

async function runAiAnalysis(id: string): Promise<boolean> {
  const res = await fetch('/api/ai/format-workout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  return res.ok
}

// ─────────────────────────────────────────────
// ANALYZE BUTTON
// ─────────────────────────────────────────────

function AnalyzeButton({ id }: { id: string }) {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  const handleAnalyze = async () => {
    setState('loading')
    try {
      const ok = await runAiAnalysis(id)
      if (ok) {
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
      className="px-5 py-2.5 bg-[#C8F04D] text-[#141115] text-[12px] font-bold uppercase tracking-[0.15em] hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {state === 'loading' ? 'Analyzing…' : 'Analyze with AI'}
    </button>
  )
}

// ─────────────────────────────────────────────
// STALE BANNER
// ─────────────────────────────────────────────

function StaleBanner({ id }: { id: string }) {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'loading'>('idle')

  const handleReanalyze = async () => {
    setState('loading')
    try {
      const ok = await runAiAnalysis(id)
      if (ok) {
        router.refresh()
      } else {
        setState('idle')
      }
    } catch {
      setState('idle')
    }
  }

  return (
    <div
      className="flex items-start justify-between gap-4 border border-[#5C4A1E] bg-[#2A1F0A] px-4 py-3"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <p className="text-[12px] text-[#F0B429] leading-snug">
        Your workout log was edited. This AI report may be outdated.
      </p>
      <button
        onClick={handleReanalyze}
        disabled={state === 'loading'}
        className="shrink-0 text-[11px] font-bold uppercase tracking-[0.15em] text-[#F0B429] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {state === 'loading' ? 'Analysing…' : 'Re-analyse'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// AI SECTION
// ─────────────────────────────────────────────

function AiSection({ ai }: { ai: AiStructuredWorkout }) {
  const intensityColor = ai.estimated_intensity
    ? INTENSITY_COLOR[ai.estimated_intensity]
    : '#A09EA3'

  return (
    <div className="border border-[#3A373C] bg-[#1A1719] p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          AI Analysis
        </span>
        {ai.estimated_intensity && (
          <span
            className="text-[11px] font-medium uppercase tracking-[0.1em]"
            style={{ fontFamily: "'DM Sans', sans-serif", color: intensityColor }}
          >
            {ai.estimated_intensity} intensity
          </span>
        )}
      </div>

      {/* Summary */}
      {ai.summary && (
        <p
          className="text-[13px] text-[#A09EA3] leading-relaxed italic mb-4"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {ai.summary}
        </p>
      )}

      {/* Exercises */}
      {(ai.exercises ?? []).length > 0 && (
        <div className="space-y-2">
          {ai.exercises.map((ex, i) => {
            const metrics = formatExerciseMetrics(ex)
            return (
              <div key={i} className="flex items-baseline justify-between gap-4 py-2 border-t border-[#3A373C]">
                <span
                  className="text-[13px] text-white"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {ex.name}
                </span>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  {metrics && (
                    <span
                      className="text-[12px] text-[#6B6870]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {metrics}
                    </span>
                  )}
                  {ex.notes && (
                    <span
                      className="text-[11px] text-[#6B6870] italic"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {ex.notes}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// WORKOUT DETAIL (interactive actions)
// ─────────────────────────────────────────────

type Props = {
  id: string
  hasWorkoutLog: boolean
  aiStructured: AiStructuredWorkout | AthleteSessionLog | null
  aiNeedsRefresh: boolean
}

export default function WorkoutDetail({ id, hasWorkoutLog, aiStructured, aiNeedsRefresh }: Props) {
  return (
    <div className="space-y-4">
      {/* Stale banner — shown when workout_log was edited after AI analysis */}
      {aiStructured && aiNeedsRefresh && (
        <StaleBanner id={id} />
      )}

      {/* AI section */}
      {aiStructured ? (
        isV2(aiStructured)
          ? <SessionResult session={aiStructured} />
          : <AiSection ai={aiStructured} />
      ) : hasWorkoutLog ? (
        <div>
          <p
            className="text-[12px] text-[#6B6870] mb-3"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            No AI analysis yet.
          </p>
          <AnalyzeButton id={id} />
        </div>
      ) : null}

      {/* Re-review AI report */}
      {aiStructured && (
        <Link
          href={`/record/${id}/ai-report`}
          className="inline-block text-[12px] font-medium text-[#C8F04D] hover:text-white transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Edit AI report →
        </Link>
      )}
    </div>
  )
}