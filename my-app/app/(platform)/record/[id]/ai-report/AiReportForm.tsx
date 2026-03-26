'use client'

import Link from 'next/link'
import type { TrainingLog, NormalizedSession } from '@/lib/types'
import { useAiReportForm } from './useAiReportForm'
import SessionMetaPanel from './SessionMetaPanel'
import StrengthPanel from './StrengthPanel'
import SprintPanel from './SprintPanel'
import CompetitionPanel from './CompetitionPanel'
import PhysioPanel from './PhysioPanel'

export default function AiReportForm({
  workout,
  normalizedSession,
}: {
  workout: TrainingLog
  normalizedSession: NormalizedSession
}) {
  const form = useAiReportForm(workout, normalizedSession)

  const sessionType = form.details.session_type ?? 'strength'

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

      {/* ── No AI data fallback ── */}
      {!workout.ai_structured && !normalizedSession.details && (
        <div className="border border-[#FF4D4D]/30 bg-[#FF4D4D]/5 p-4">
          <p className="text-[13px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            AI hasn&apos;t structured this workout yet. You can still fill in the details manually.
          </p>
        </div>
      )}

      {/* ── Session meta (type, intensity, readiness, notes) ── */}
      <SessionMetaPanel
        details={form.details}
        onChange={(patch) => form.setDetails((prev) => ({ ...prev, ...patch }))}
      />

      {/* ── Session-type-specific panels ── */}
      {['strength', 'conditioning', 'mixed', 'recovery'].includes(sessionType) && (
        <StrengthPanel blocks={form.blocks} onChange={form.setBlocks} />
      )}

      {sessionType === 'sprint' && (
        <SprintPanel
          efforts={form.sprintEfforts}
          surface={form.details.sprint_surface ?? null}
          footwear={form.details.sprint_footwear ?? null}
          onEffortsChange={form.setSprintEfforts}
          onMetaChange={(patch) =>
            form.setDetails((prev) => ({
              ...prev,
              sprint_surface: patch.surface !== undefined ? patch.surface : prev.sprint_surface,
              sprint_footwear: patch.footwear !== undefined ? patch.footwear : prev.sprint_footwear,
            }))
          }
        />
      )}

      {sessionType === 'competition' && (
        <CompetitionPanel
          result={form.competitionResult}
          onChange={(patch) =>
            form.setCompetitionResult((prev) => ({ ...prev, ...patch }))
          }
        />
      )}

      {['physio', 'rehab', 'prehab'].includes(sessionType) && (
        <PhysioPanel
          bodyAreas={form.physioBodyAreas}
          exerciseBlocks={form.physioExerciseBlocks}
          details={{
            physio_provider: form.details.physio_provider,
            physio_clearance_status: form.details.physio_clearance_status,
            physio_notes: form.details.physio_notes,
          }}
          onBodyAreasChange={form.setPhysioBodyAreas}
          onExerciseBlocksChange={form.setPhysioExerciseBlocks}
          onDetailsChange={(patch) => form.setDetails((prev) => ({ ...prev, ...patch }))}
        />
      )}

      {form.error && (
        <p className="text-[13px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {form.error}
        </p>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href={`/record/${workout.id}`}
          className="text-[12px] text-[#6B6870] hover:text-white transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          ← Back
        </Link>
        <button
          type="button"
          onClick={form.handleSave}
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
