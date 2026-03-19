'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, X } from 'lucide-react'
import { updateAiStructured } from '../../actions'
import type { TrainingLog, AiStructuredExercise, AiStructuredWorkout } from '@/lib/types'

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function blankExercise(): AiStructuredExercise {
  return { name: '' }
}

const INTENSITY_OPTIONS: AiStructuredWorkout['estimated_intensity'][] = ['low', 'moderate', 'high']

const INTENSITY_COLORS: Record<string, string> = {
  low: 'text-[#6B6870]',
  moderate: 'text-[#A09EA3]',
  high: 'text-[#C8F04D]',
}

// ─────────────────────────────────────────────
// EXERCISE CARD
// ─────────────────────────────────────────────

function ExerciseCard({
  exercise,
  index,
  onChange,
  onDelete,
}: {
  exercise: AiStructuredExercise
  index: number
  onChange: (index: number, updated: AiStructuredExercise) => void
  onDelete: (index: number) => void
}) {
  const set = (field: keyof AiStructuredExercise, value: string) => {
    const numFields = ['sets', 'weight_kg', 'distance_km', 'duration_seconds'] as const
    const updated: AiStructuredExercise = { ...exercise }
    if ((numFields as readonly string[]).includes(field)) {
      const num = parseFloat(value)
      ;(updated as Record<string, unknown>)[field] = value === '' ? undefined : isNaN(num) ? undefined : num
    } else {
      ;(updated as Record<string, unknown>)[field] = value === '' ? undefined : value
    }
    onChange(index, updated)
  }

  const inputClass =
    'bg-transparent border-b border-[#3A373C] focus:border-[#C8F04D] outline-none text-white text-[13px] pb-1 placeholder-[#3A373C] transition-colors duration-150 w-full'

  return (
    <div className="relative border border-[#3A373C] bg-[#1A1719] p-4 rounded-md">
      {/* Delete button */}
      <button
        type="button"
        onClick={() => onDelete(index)}
        className="absolute top-3 right-3 p-1 text-[#6B6870] hover:text-[#FF4D4D] transition-colors"
        aria-label="Remove exercise"
      >
        <X size={14} />
      </button>

      {/* Exercise name */}
      <input
        type="text"
        value={exercise.name}
        onChange={(e) => set('name', e.target.value)}
        placeholder="Exercise name"
        className={`${inputClass} text-[14px] font-semibold mb-4 pr-6`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      />

      {/* Metric fields */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B6870] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Sets</p>
          <input
            type="number"
            value={exercise.sets ?? ''}
            onChange={(e) => set('sets', e.target.value)}
            placeholder="—"
            className={inputClass}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B6870] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Reps</p>
          <input
            type="text"
            value={exercise.reps ?? ''}
            onChange={(e) => set('reps', e.target.value)}
            placeholder="—"
            className={inputClass}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B6870] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Weight (kg)</p>
          <input
            type="number"
            step="0.1"
            value={exercise.weight_kg ?? ''}
            onChange={(e) => set('weight_kg', e.target.value)}
            placeholder="—"
            className={inputClass}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B6870] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Distance (km)</p>
          <input
            type="number"
            step="0.01"
            value={exercise.distance_km ?? ''}
            onChange={(e) => set('distance_km', e.target.value)}
            placeholder="—"
            className={inputClass}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B6870] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Duration (sec)</p>
          <input
            type="number"
            value={exercise.duration_seconds ?? ''}
            onChange={(e) => set('duration_seconds', e.target.value)}
            placeholder="—"
            className={inputClass}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="mt-3">
        <input
          type="text"
          value={exercise.notes ?? ''}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Notes (optional)"
          className={`${inputClass} text-[12px] text-[#A09EA3]`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// AI REPORT FORM
// ─────────────────────────────────────────────

export default function AiReportForm({ workout }: { workout: TrainingLog }) {
  const ai = workout.ai_structured

  const [exercises, setExercises] = useState<AiStructuredExercise[]>(ai?.exercises ?? [])
  const [summary, setSummary] = useState(ai?.summary ?? '')
  const [intensity, setIntensity] = useState<AiStructuredWorkout['estimated_intensity']>(ai?.estimated_intensity)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateExercise = (index: number, updated: AiStructuredExercise) => {
    setExercises((prev) => prev.map((ex, i) => (i === index ? updated : ex)))
  }

  const deleteExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index))
  }

  const addExercise = () => {
    setExercises((prev) => [...prev, blankExercise()])
  }

  const handleConfirm = async () => {
    setSaving(true)
    setError(null)
    const structured: AiStructuredWorkout = {
      exercises,
      summary: summary || undefined,
      estimated_intensity: intensity,
    }
    const result = await updateAiStructured(workout.id, structured)
    if (result?.error) {
      setError(result.error)
      setSaving(false)
    }
    // On success, server action redirects to /account
  }

  // Format date for display
  const formattedDate = workout.logged_date
    ? new Date(workout.logged_date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      })
    : null

  return (
    <div className="space-y-8">

      {/* ── Workout header (read-only) ── */}
      <div className="border border-[#3A373C] bg-[#1A1719] p-5 rounded-md space-y-3">
        <h2
          className="text-[16px] font-bold text-white"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}
        >
          {workout.title}
        </h2>
        <div className="flex flex-wrap gap-4 text-[12px] text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {formattedDate && <span>{formattedDate}</span>}
          {workout.duration_minutes && <span>{workout.duration_minutes} min</span>}
        </div>
        {Array.isArray((workout as Record<string, unknown>)['workout_types']) && ((workout as Record<string, unknown>)['workout_types'] as string[]).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {((workout as Record<string, unknown>)['workout_types'] as string[]).map((t: string) => (
              <span
                key={t}
                className="inline-flex items-center px-3 py-1 text-[11px] font-medium rounded-full border border-[#C8F04D] text-[#C8F04D]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── AI parse fallback ── */}
      {!ai && (
        <div className="border border-[#FF4D4D]/30 bg-[#FF4D4D]/5 p-4 rounded-md">
          <p className="text-[13px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            AI couldn&apos;t structure this log automatically. You can add exercises manually below, or{' '}
            <Link href="/record" className="underline hover:text-white transition-colors">go back</Link>.
          </p>
        </div>
      )}

      {/* ── Intensity selector ── */}
      <div>
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-3"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Intensity
        </p>
        <div className="flex gap-2">
          {INTENSITY_OPTIONS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setIntensity(level === intensity ? undefined : level)}
              className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] rounded-full border transition-colors duration-150 ${
                intensity === level
                  ? 'bg-[#C8F04D] border-[#C8F04D] text-[#141115]'
                  : `border-[#3A373C] ${INTENSITY_COLORS[level!]} hover:border-[#C8F04D]/50`
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary ── */}
      <div>
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-3"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Summary
        </p>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="A brief description of this session…"
          rows={3}
          className="w-full bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-white text-[13px] p-3 rounded-md placeholder-[#3A373C] transition-colors duration-150 resize-none leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>

      {/* ── Exercises ── */}
      <div>
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-4"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Exercises
        </p>

        <div className="space-y-3">
          {exercises.map((ex, i) => (
            <ExerciseCard
              key={i}
              exercise={ex}
              index={i}
              onChange={updateExercise}
              onDelete={deleteExercise}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addExercise}
          className="mt-3 flex items-center gap-2 px-4 py-2 border border-[#3A373C] text-[#6B6870] text-[11px] font-semibold uppercase tracking-[0.15em] hover:border-[#C8F04D] hover:text-[#C8F04D] transition-colors duration-150 rounded-md"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Plus size={12} />
          Add Exercise
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <p className="text-[13px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </p>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/record"
          className="text-[12px] text-[#6B6870] hover:text-white transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          ← Back to log
        </Link>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={saving}
          className="px-8 py-3 bg-[#C8F04D] text-[#141115] text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#b8e038] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {saving ? 'Saving…' : 'Confirm & Save'}
        </button>
      </div>
    </div>
  )
}
