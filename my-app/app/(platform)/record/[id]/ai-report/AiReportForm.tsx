'use client'

import Link from 'next/link'
import { Plus, X } from 'lucide-react'
import { useAiReportForm } from './useAiReportForm'
import { SESSION_MODES, SECTION_LABELS, blankExercise, type SessionMode } from './aiReportHelpers'
import type { TrainingLog, AiStructuredExercise } from '@/lib/types'

// ─── Asana-style field row ───────────────────────────────────────────────────

function FieldRow({
  label,
  type = 'text',
  step,
  value,
  placeholder = '—',
  onChange,
}: {
  label: string
  type?: 'text' | 'number'
  step?: string
  value: string | number | undefined
  placeholder?: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center border-t border-[#2A272C] py-2.5 gap-3 min-h-10">
      <span
        className="text-[12px] text-[#6B6870] w-27.5 shrink-0"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </span>
      <input
        type={type}
        step={step}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none text-[13px] text-white placeholder-[#3A373C]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />
    </div>
  )
}

// ─── Exercise / Event card ───────────────────────────────────────────────────

function ExerciseCard({
  exercise,
  index,
  mode,
  onChange,
  onDelete,
}: {
  exercise: AiStructuredExercise
  index: number
  mode: SessionMode
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

  return (
    <div className="border border-[#3A373C] bg-[#1A1719]">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder={SECTION_LABELS[mode].placeholder}
          className="flex-1 bg-transparent outline-none text-[14px] font-semibold text-white placeholder-[#3A373C]"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}
        />
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="p-1 text-[#3A373C] hover:text-[#FF4D4D] transition-colors shrink-0"
          aria-label="Remove"
        >
          <X size={14} />
        </button>
      </div>

      <div className="border-t border-[#3A373C] px-4 pb-3">
        {mode === 'strength' && (
          <>
            <FieldRow label="Sets"        type="number"             value={exercise.sets}             onChange={(v) => set('sets', v)} />
            <FieldRow label="Reps"                                  value={exercise.reps}             onChange={(v) => set('reps', v)} />
            <FieldRow label="Weight (kg)" type="number" step="0.5" value={exercise.weight_kg}        onChange={(v) => set('weight_kg', v)} />
          </>
        )}
        {mode === 'conditioning' && (
          <>
            <FieldRow label="Rounds"         value={exercise.reps}             onChange={(v) => set('reps', v)} />
            <FieldRow label="Distance (km)"  type="number" step="0.01" value={exercise.distance_km}     onChange={(v) => set('distance_km', v)} />
            <FieldRow label="Duration (sec)" type="number"             value={exercise.duration_seconds} onChange={(v) => set('duration_seconds', v)} />
          </>
        )}
        {mode === 'sprint' && (
          <>
            <FieldRow label="Sets"         type="number" value={exercise.sets}             onChange={(v) => set('sets', v)} />
            <FieldRow label="Distance (m)" type="number" value={exercise.distance_km}      onChange={(v) => set('distance_km', v)} />
            <FieldRow label="Time (sec)"   type="number" value={exercise.duration_seconds} onChange={(v) => set('duration_seconds', v)} />
          </>
        )}
        {mode === 'competition' && (
          <>
            <FieldRow label="Distance (km)" type="number" step="0.01" value={exercise.distance_km}     onChange={(v) => set('distance_km', v)} />
            <FieldRow label="Time (sec)"    type="number"             value={exercise.duration_seconds} onChange={(v) => set('duration_seconds', v)} />
            <FieldRow label="Place"                                   value={exercise.reps} placeholder="e.g. 1st" onChange={(v) => set('reps', v)} />
          </>
        )}
        <FieldRow label="Notes" value={exercise.notes} placeholder="Optional note" onChange={(v) => set('notes', v)} />
      </div>
    </div>
  )
}

// ─── Main form ───────────────────────────────────────────────────────────────

export default function AiReportForm({ workout }: { workout: TrainingLog }) {
  const form = useAiReportForm(workout)

  const formattedDate = workout.logged_date
    ? new Date(workout.logged_date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      })
    : null

  const workoutTypes = (workout as Record<string, unknown>)['workout_types'] as string[] | undefined

  return (
    <div className="space-y-8">

      {/* ── Workout header ── */}
      <div className="space-y-2">
        <h2
          className="text-[18px] font-bold text-white"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
        >
          {workout.title}
        </h2>
        <div
          className="flex flex-wrap items-center gap-3 text-[12px] text-[#6B6870]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {formattedDate && <span>{formattedDate}</span>}
          {workout.duration_minutes && <span>{workout.duration_minutes} min</span>}
        </div>
        {workoutTypes && workoutTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {workoutTypes.map((t) => (
              <span
                key={t}
                className="px-2.5 py-0.5 text-[11px] rounded-full border border-[#3A373C] text-[#A09EA3]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── AI parse fallback ── */}
      {!workout.ai_structured && (
        <div className="border border-[#FF4D4D]/30 bg-[#FF4D4D]/5 p-4">
          <p className="text-[13px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            AI couldn&apos;t structure this log automatically. Add entries manually, or{' '}
            <Link href="/record" className="underline hover:text-white transition-colors">go back</Link>.
          </p>
        </div>
      )}

      {/* ── Session type toggle ── */}
      <div>
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-3"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Session Type
        </p>
        <div className="flex flex-wrap gap-2">
          {SESSION_MODES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => form.setMode(value)}
              className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] border transition-colors duration-150 ${
                form.mode === value
                  ? 'bg-[#C8F04D] border-[#C8F04D] text-[#141115]'
                  : 'border-[#3A373C] text-[#6B6870] hover:border-[#C8F04D]/50 hover:text-[#A09EA3]'
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary ── */}
      <div>
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-3"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Summary
        </p>
        <textarea
          value={form.summary}
          onChange={(e) => form.setSummary(e.target.value)}
          placeholder="A brief description of this session…"
          rows={3}
          className="w-full bg-transparent border border-[#3A373C] focus:border-[#C8F04D] outline-none text-white text-[13px] p-3 placeholder-[#3A373C] transition-colors duration-150 resize-none leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>

      {/* ── Exercises / Events ── */}
      <div>
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {SECTION_LABELS[form.mode].heading}
        </p>

        <div className="space-y-2">
          {form.exercises.map((ex, i) => (
            <ExerciseCard
              key={i}
              exercise={ex}
              index={i}
              mode={form.mode}
              onChange={form.updateExercise}
              onDelete={form.deleteExercise}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => form.setExercises((prev) => [...prev, blankExercise()])}
          className="mt-3 flex items-center gap-2 px-4 py-2 border border-[#3A373C] text-[#6B6870] text-[11px] font-semibold uppercase tracking-[0.15em] hover:border-[#C8F04D] hover:text-[#C8F04D] transition-colors duration-150"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Plus size={12} />
          {SECTION_LABELS[form.mode].add}
        </button>
      </div>

      {form.error && (
        <p className="text-[13px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {form.error}
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
          onClick={form.handleConfirm}
          disabled={form.saving}
          className="px-8 py-3 bg-[#C8F04D] text-[#141115] text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#b8e038] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {form.saving ? 'Saving…' : 'Confirm & Save'}
        </button>
      </div>
    </div>
  )
}
