'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteWorkout } from '../actions'
import type { AiStructuredWorkout, AiStructuredExercise } from '@/lib/types'

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
// ANALYZE BUTTON
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
      className="px-5 py-2.5 bg-[#C8F04D] text-[#141115] text-[12px] font-bold uppercase tracking-[0.15em] hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {state === 'loading' ? 'Analyzing…' : 'Analyze with AI'}
    </button>
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
      {ai.exercises.length > 0 && (
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
  aiStructured: AiStructuredWorkout | null
}

export default function WorkoutDetail({ id, hasWorkoutLog, aiStructured }: Props) {
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    const result = await deleteWorkout(id)
    if (result?.error) {
      setDeleteError(result.error)
      setDeleting(false)
    }
    // redirect happens inside the server action on success
  }

  return (
    <div className="space-y-6">
      {/* AI section */}
      {aiStructured ? (
        <AiSection ai={aiStructured} />
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

      {/* Action buttons */}
      <div className="flex items-center gap-4 pt-2 border-t border-[#3A373C]">
        <Link
          href={`/record/${id}/edit`}
          className="px-5 py-2.5 border border-[#3A373C] text-white text-[12px] font-semibold uppercase tracking-[0.1em] hover:border-[#C8F04D]/40 hover:text-[#C8F04D] transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Edit
        </Link>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-5 py-2.5 border border-[#3A373C] text-[#6B6870] text-[12px] font-semibold uppercase tracking-[0.1em] hover:border-[#FF4D4D]/40 hover:text-[#FF4D4D] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Delete
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span
              className="text-[12px] text-[#FF4D4D]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Are you sure?
            </span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-[12px] font-semibold text-[#FF4D4D] hover:text-white transition-colors disabled:opacity-50"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-[12px] text-[#6B6870] hover:text-white transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {deleteError && (
        <p
          className="text-[12px] text-[#FF4D4D]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {deleteError}
        </p>
      )}
    </div>
  )
}