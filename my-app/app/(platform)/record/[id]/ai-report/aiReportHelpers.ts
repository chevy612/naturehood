import type { AiStructuredExercise, AiStructuredWorkout, AthleteSessionLog } from '@/lib/types'

// ─── v1 / v2 schema helpers ─────────────────────────────────────────────────

export function isV2(ai: unknown): ai is AthleteSessionLog {
  return ai != null && typeof ai === 'object' && 'parser_version' in (ai as object)
}

export function extractExercises(ai: AthleteSessionLog | AiStructuredWorkout | null): AiStructuredExercise[] {
  if (!ai) return []
  if (!isV2(ai)) return (ai as AiStructuredWorkout).exercises ?? []

  // v2 — sprint efforts
  if (ai.sprint_session) {
    return ai.sprint_session.efforts.map((e) => ({
      name: e.drill_type.replace(/_/g, ' '),
      sets: e.sets ?? undefined,
      distance_km: e.distance_m != null ? +(e.distance_m / 1000).toFixed(3) : undefined,
      duration_seconds: e.reps[0]?.time_seconds ?? undefined,
      notes: e.notes ?? undefined,
    }))
  }
  // v2 — competition rounds
  if (ai.competition_result) {
    return ai.competition_result.rounds.map((r) => ({
      name: [ai.competition_result?.event, r.round_type].filter(Boolean).join(' — '),
      duration_seconds: r.time_seconds ?? undefined,
      reps: r.ranking != null ? String(r.ranking) : undefined,
      notes: r.notes ?? undefined,
    }))
  }
  // v2 — physio exercises
  if (ai.physio_session?.exercises?.length) {
    return ai.physio_session.exercises.map((ex) => ({
      name: ex.name,
      sets: ex.set_count ?? (ex.sets.length > 0 ? ex.sets.length : undefined),
      reps: ex.sets[0]?.reps ?? undefined,
      notes: ex.notes ?? undefined,
    }))
  }
  // v2 — strength / conditioning blocks
  return (ai.blocks ?? []).flatMap((block) =>
    block.exercises.map((ex) => ({
      name: ex.name,
      sets: ex.set_count ?? (ex.sets.length > 0 ? ex.sets.length : undefined),
      reps: ex.sets[0]?.reps ?? undefined,
      weight_kg: ex.max_weight_kg ?? undefined,
      notes: ex.notes ?? undefined,
    }))
  )
}

// ─── Session mode constants ──────────────────────────────────────────────────

export type SessionMode = 'strength' | 'conditioning' | 'sprint' | 'competition'

export const SESSION_MODES: { value: SessionMode; label: string }[] = [
  { value: 'strength',     label: 'Strength' },
  { value: 'conditioning', label: 'Conditioning' },
  { value: 'sprint',       label: 'Sprint' },
  { value: 'competition',  label: 'Competition' },
]

export const SECTION_LABELS: Record<SessionMode, { heading: string; add: string; placeholder: string }> = {
  strength:     { heading: 'Exercises',  add: 'Add Exercise', placeholder: 'Exercise name' },
  conditioning: { heading: 'Activities', add: 'Add Activity', placeholder: 'Activity' },
  sprint:       { heading: 'Efforts',    add: 'Add Effort',   placeholder: 'Drill type' },
  competition:  { heading: 'Events',     add: 'Add Event',    placeholder: 'Event name' },
}

export function blankExercise(): AiStructuredExercise {
  return { name: '' }
}
