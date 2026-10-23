'use client'

import { Link } from '@/i18n/navigation'
import { ChevronRight, CircleAlert } from 'lucide-react'
import { Button } from '@/app/components/ui/buttons'
import { Tag } from '@/app/components/ui/tags'
import type { TrainingLog, NormalizedSession } from '@/lib/types'
import { useAiReportForm } from './useAiReportForm'
import SessionMetaPanel, { SessionProperties } from './SessionMetaPanel'
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
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className="mb-6 flex min-w-0 items-center gap-1 text-[13px] text-[#847E89]">
        <Link href="/account" className="shrink-0 rounded px-1 -ml-1 hover:text-white transition-colors">
          My training
        </Link>
        <ChevronRight size={14} className="shrink-0 text-[#4A464D]" />
        <Link href={`/record/${workout.id}`} className="min-w-0 truncate rounded px-1 hover:text-white transition-colors">
          {workout.title}
        </Link>
        <ChevronRight size={14} className="shrink-0 text-[#4A464D]" />
        <span className="shrink-0 px-1 text-[#E8E8E8]">AI report</span>
      </nav>

      {/* ── Title + meta ── */}
      <h1
        className="text-[22px] font-bold leading-tight text-white"
        style={{ fontFamily: "'Sk Modernist', sans-serif", letterSpacing: '-0.02em' }}
      >
        {workout.title}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-[#847E89]">
        {formattedDate && <span>{formattedDate}</span>}
        {formattedDate && workout.duration_minutes && <span className="text-[#4A464D]">·</span>}
        {workout.duration_minutes && <span>{workout.duration_minutes} min</span>}
        {workoutTypes?.map((t) => (
          <Tag key={t} variant="secondary" size="sm">{t}</Tag>
        ))}
      </div>

      {/* ── Properties (Linear-style chips) ── */}
      <div className="mt-5">
        <SessionProperties
          details={form.details}
          onChange={(patch) => form.setDetails((prev) => ({ ...prev, ...patch }))}
        />
      </div>

      <div className="mt-5 space-y-10 pb-10">

        {/* ── No AI data fallback ── */}
        {!workout.ai_structured && !normalizedSession.details && (
          <div className="flex items-start gap-2 rounded-lg border border-[#3D3940] bg-[#1A1719] px-3 py-2.5 text-[12px] text-[#A09EA3]">
            <CircleAlert size={14} className="mt-px shrink-0 text-[#847E89]" />
            AI hasn&apos;t structured this workout yet. You can still fill in the details manually.
          </div>
        )}

        {/* ── Notes + AI confidence ── */}
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
      </div>

      {/* ── Sticky action bar ── */}
      <div className="sticky bottom-14 md:bottom-0 -mx-4 sm:-mx-6 border-t border-[#2A272C] bg-[#141115]/90 px-4 sm:px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-[12px]">
            {form.error
              ? <span className="text-[#FF4D4D]">{form.error}</span>
              : <span className="hidden text-[#6B6870] sm:inline">Saving updates this workout&apos;s AI report.</span>}
          </p>
          <Button href={`/record/${workout.id}`} variant="ghost">
            Cancel
          </Button>
          <Button onClick={form.handleSave} disabled={form.saving}>
            {form.saving ? 'Saving…' : 'Confirm & save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
