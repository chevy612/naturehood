'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/buttons'
import { Pencil } from 'lucide-react'
import { Tag } from '@/app/components/ui/tags'
import { ReportSection, ReportCard } from '@/app/components/platform/ReportSection'
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
    <Button onClick={handleAnalyze} disabled={state === 'loading'}>
      {state === 'loading' ? 'Analyzing…' : 'Analyze with AI'}
    </Button>
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
      className="flex items-start justify-between gap-4 rounded-lg border border-[#5C4A1E] bg-[#2A1F0A] px-4 py-3"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <p className="text-[12px] text-[#F0B429] leading-snug">
        Your workout log was edited. This AI report may be outdated.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={handleReanalyze}
        disabled={state === 'loading'}
        className="border-[#F0B429] text-[#F0B429] hover:bg-[#F0B429]/10"
      >
        {state === 'loading' ? 'Analysing…' : 'Re-analyse'}
      </Button>
    </div>
  )
}

// ─────────────────────────────────────────────
// AI SECTION
// ─────────────────────────────────────────────

function AiSection({ ai, editHref }: { ai: AiStructuredWorkout; editHref: string }) {
  return (
    <ReportSection title="AI report" action={<EditAiButton href={editHref} />}>
      {(ai.summary || ai.estimated_intensity) && (
        <div className="flex flex-wrap items-start gap-2">
          {ai.summary && (
            <p className="flex-1 text-[14px] leading-relaxed text-[#E8E8E8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {ai.summary}
            </p>
          )}
          {ai.estimated_intensity && (
            <Tag variant={ai.estimated_intensity === 'high' ? 'destructive' : 'secondary'} size="sm">
              {ai.estimated_intensity} intensity
            </Tag>
          )}
        </div>
      )}

      {(ai.exercises ?? []).length > 0 && (
        <ReportCard>
          {ai.exercises.map((ex, i) => {
            const metrics = formatExerciseMetrics(ex)
            return (
              <div
                key={i}
                className="flex items-baseline justify-between gap-4 border-t border-[#2A272C] px-4 py-2.5 first:border-t-0"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-white">{ex.name}</p>
                  {ex.notes && <p className="mt-0.5 text-[12px] text-[#847E89]">{ex.notes}</p>}
                </div>
                {metrics && <span className="shrink-0 text-[13px] tabular-nums text-[#A09EA3]">{metrics}</span>}
              </div>
            )
          })}
        </ReportCard>
      )}
    </ReportSection>
  )
}

function EditAiButton({ href }: { href: string }) {
  return (
    <Button href={href} variant="ghost" size="sm">
      <Pencil size={14} /> Edit report
    </Button>
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
  const editHref = `/record/${id}/ai-report`

  return (
    <div className="space-y-4">
      {/* Stale banner — shown when workout_log was edited after AI analysis */}
      {aiStructured && aiNeedsRefresh && (
        <StaleBanner id={id} />
      )}

      {/* AI section */}
      {aiStructured ? (
        isV2(aiStructured)
          ? <SessionResult session={aiStructured} action={<EditAiButton href={editHref} />} />
          : <AiSection ai={aiStructured} editHref={editHref} />
      ) : hasWorkoutLog ? (
        <ReportCard className="flex items-center justify-between gap-4 px-4 py-3">
          <p className="text-[13px] text-[#847E89]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            No AI analysis yet.
          </p>
          <AnalyzeButton id={id} />
        </ReportCard>
      ) : null}
    </div>
  )
}
