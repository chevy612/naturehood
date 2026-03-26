import { useState } from 'react'
import { updateAiStructured } from '../../actions'
import type {
  TrainingLog,
  NormalizedSession,
  SessionDetailsRow,
  AthleteSessionLog,
  AthleteSetLog,
  ExerciseSetRow,
  SprintEffort,
} from '@/lib/types'

type SprintEffortDrillType = SprintEffort['drill_type']
import type { DraftBlock, DraftSet } from './StrengthPanel'
import type { DraftSprintEffort } from './SprintPanel'
import type { DraftCompetitionResult } from './CompetitionPanel'
import type { DraftBodyArea } from './PhysioPanel'

// Maps a DraftSet / ExerciseSetRow to AthleteSetLog, resolving null → undefined
// for fields that are optional (not nullable) in the original V2 schema.
function toAthleteSetLog(s: DraftSet | ExerciseSetRow): AthleteSetLog {
  return {
    set_index: s.set_index,
    is_warmup: s.is_warmup ?? undefined,
    is_failure: s.is_failure ?? undefined,
    is_dropset: s.is_dropset ?? undefined,
    weight_kg: s.weight_kg ?? null,
    weight_type: s.weight_type ?? null,
    weight_value_raw: s.weight_value_raw ?? undefined,  // null → undefined
    added_weight_kg: s.added_weight_kg ?? null,
    machine_level: s.machine_level ?? null,
    reps: s.reps ?? null,
    reps_left: s.reps_left ?? null,
    reps_right: s.reps_right ?? null,
    duration_seconds: s.duration_seconds ?? null,
    distance_m: s.distance_m ?? null,
    pace_seconds_per_km: s.pace_seconds_per_km ?? null,
    time_seconds: s.time_seconds ?? null,
    splits_seconds: s.splits_seconds ?? undefined,       // null → undefined
    effort_percent: s.effort_percent ?? null,
    rest_seconds: s.rest_seconds ?? null,
    rest_between_reps_seconds: s.rest_between_reps_seconds ?? null,
    notes: s.notes ?? null,
  }
}

// ── Helpers: map normalized rows → draft state ────────────────────────────────

function buildDraftBlocks(session: NormalizedSession): DraftBlock[] {
  const blockMap = new Map<string, DraftBlock>()

  for (const block of session.blocks) {
    blockMap.set(block.id ?? String(block.block_index), {
      block_index: block.block_index,
      block_name: block.block_name,
      block_type: block.block_type,
      emom_interval_seconds: block.emom_interval_seconds,
      circuit_rounds: block.circuit_rounds,
      intensity_percent: block.intensity_percent,
      notes: block.notes,
      exercises: [],
    })
  }

  for (const ex of session.exercises) {
    if (!ex.block_id) continue
    const block = blockMap.get(ex.block_id)
    if (!block) continue
    block.exercises.push({
      exercise_index: ex.exercise_index,
      name: ex.name,
      name_original: ex.name_original,
      name_unknown: ex.name_unknown,
      category: ex.category,
      equipment: ex.equipment,
      laterality: ex.laterality,
      is_superset_with: ex.is_superset_with,
      notes: ex.notes,
      total_volume_kg: ex.total_volume_kg,
      max_weight_kg: ex.max_weight_kg,
      total_reps: ex.total_reps,
      set_count: ex.set_count,
      sets: ex.sets.map((s) => ({
        set_index: s.set_index,
        is_warmup: s.is_warmup,
        is_failure: s.is_failure,
        is_dropset: s.is_dropset,
        weight_kg: s.weight_kg,
        weight_type: s.weight_type,
        weight_value_raw: s.weight_value_raw,
        added_weight_kg: s.added_weight_kg,
        machine_level: s.machine_level,
        reps: s.reps,
        reps_left: s.reps_left,
        reps_right: s.reps_right,
        duration_seconds: s.duration_seconds,
        distance_m: s.distance_m,
        pace_seconds_per_km: s.pace_seconds_per_km,
        time_seconds: s.time_seconds,
        splits_seconds: s.splits_seconds,
        effort_percent: s.effort_percent,
        rest_seconds: s.rest_seconds,
        rest_between_reps_seconds: s.rest_between_reps_seconds,
        notes: s.notes,
      })),
    })
  }

  return Array.from(blockMap.values()).sort((a, b) => a.block_index - b.block_index)
}

function buildDraftSprintEfforts(session: NormalizedSession): DraftSprintEffort[] {
  return session.sprint_efforts.map((e) => ({
    effort_index: e.effort_index,
    drill_type: e.drill_type,
    distance_m: e.distance_m,
    phase_distances_m: e.phase_distances_m,
    effort_percent: e.effort_percent,
    footwear: e.footwear,
    rest_between_reps_seconds: e.rest_between_reps_seconds,
    rest_between_sets_seconds: e.rest_between_sets_seconds,
    sets: e.sets,
    notes: e.notes,
    reps: e.reps.map((r) => ({
      rep_index: r.rep_index,
      time_seconds: r.time_seconds,
      split_times_seconds: r.split_times_seconds,
      wind_ms: r.wind_ms,
      completed: r.completed,
      notes: r.notes,
    })),
  }))
}

function buildDraftCompetition(session: NormalizedSession): DraftCompetitionResult {
  const comp = session.competition_result
  return {
    event: comp?.event ?? null,
    competition_name: comp?.competition_name ?? null,
    venue: comp?.venue ?? null,
    lane: comp?.lane ?? null,
    status: comp?.status ?? 'completed',
    dns_reason: comp?.dns_reason ?? null,
    conditions: comp?.conditions ?? null,
    best_time_seconds: comp?.best_time_seconds ?? null,
    notes: comp?.notes ?? null,
    rounds: (comp?.rounds ?? []).map((r) => ({
      round_index: r.round_index,
      round_type: r.round_type,
      time_seconds: r.time_seconds,
      wind_ms: r.wind_ms,
      ranking: r.ranking,
      pb: r.pb,
      sb: r.sb,
      relay_leg: r.relay_leg,
      relay_split_seconds: r.relay_split_seconds,
      notes: r.notes,
    })),
  }
}

function buildPhysioBodyAreas(session: NormalizedSession): DraftBodyArea[] {
  return session.physio_body_areas.map((a) => ({
    area_index: a.area_index,
    area: a.area,
    side: a.side,
    injury_name: a.injury_name,
    pain_score_before: a.pain_score_before,
    pain_score_after: a.pain_score_after,
    treatment_type: a.treatment_type,
  }))
}

function buildPhysioExerciseBlocks(session: NormalizedSession): DraftBlock[] {
  const physioExercises = session.exercises.filter((ex) => ex.block_id === null)
  if (physioExercises.length === 0) return []
  return [{
    block_index: 0,
    block_name: 'Rehab Exercises',
    block_type: 'main',
    emom_interval_seconds: null,
    circuit_rounds: null,
    intensity_percent: null,
    notes: null,
    exercises: physioExercises.map((ex) => ({
      exercise_index: ex.exercise_index,
      name: ex.name,
      name_original: ex.name_original,
      name_unknown: ex.name_unknown,
      category: ex.category,
      equipment: ex.equipment,
      laterality: ex.laterality,
      is_superset_with: ex.is_superset_with,
      notes: ex.notes,
      total_volume_kg: ex.total_volume_kg,
      max_weight_kg: ex.max_weight_kg,
      total_reps: ex.total_reps,
      set_count: ex.set_count,
      sets: ex.sets.map((s) => ({
        set_index: s.set_index,
        is_warmup: s.is_warmup,
        is_failure: s.is_failure,
        is_dropset: s.is_dropset,
        weight_kg: s.weight_kg,
        weight_type: s.weight_type,
        weight_value_raw: s.weight_value_raw,
        added_weight_kg: s.added_weight_kg,
        machine_level: s.machine_level,
        reps: s.reps,
        reps_left: s.reps_left,
        reps_right: s.reps_right,
        duration_seconds: s.duration_seconds,
        distance_m: s.distance_m,
        pace_seconds_per_km: s.pace_seconds_per_km,
        time_seconds: s.time_seconds,
        splits_seconds: s.splits_seconds,
        effort_percent: s.effort_percent,
        rest_seconds: s.rest_seconds,
        rest_between_reps_seconds: s.rest_between_reps_seconds,
        notes: s.notes,
      })),
    })),
  }]
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseAiReportFormReturn {
  details: Partial<SessionDetailsRow>
  setDetails: React.Dispatch<React.SetStateAction<Partial<SessionDetailsRow>>>
  blocks: DraftBlock[]
  setBlocks: React.Dispatch<React.SetStateAction<DraftBlock[]>>
  sprintEfforts: DraftSprintEffort[]
  setSprintEfforts: React.Dispatch<React.SetStateAction<DraftSprintEffort[]>>
  competitionResult: DraftCompetitionResult
  setCompetitionResult: React.Dispatch<React.SetStateAction<DraftCompetitionResult>>
  physioBodyAreas: DraftBodyArea[]
  setPhysioBodyAreas: React.Dispatch<React.SetStateAction<DraftBodyArea[]>>
  physioExerciseBlocks: DraftBlock[]
  setPhysioExerciseBlocks: React.Dispatch<React.SetStateAction<DraftBlock[]>>
  saving: boolean
  error: string | null
  handleSave: () => Promise<void>
}

export function useAiReportForm(
  workout: TrainingLog,
  normalizedSession: NormalizedSession
): UseAiReportFormReturn {
  const [details, setDetails] = useState<Partial<SessionDetailsRow>>(
    normalizedSession.details ?? {}
  )
  const [blocks, setBlocks] = useState<DraftBlock[]>(() => buildDraftBlocks(normalizedSession))
  const [sprintEfforts, setSprintEfforts] = useState<DraftSprintEffort[]>(() =>
    buildDraftSprintEfforts(normalizedSession)
  )
  const [competitionResult, setCompetitionResult] = useState<DraftCompetitionResult>(() =>
    buildDraftCompetition(normalizedSession)
  )
  const [physioBodyAreas, setPhysioBodyAreas] = useState<DraftBodyArea[]>(() =>
    buildPhysioBodyAreas(normalizedSession)
  )
  const [physioExerciseBlocks, setPhysioExerciseBlocks] = useState<DraftBlock[]>(() =>
    buildPhysioExerciseBlocks(normalizedSession)
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    // Reconstruct an AthleteSessionLog from draft state to keep JSONB in sync
    const sessionType = details.session_type ?? 'strength'

    const structured: AthleteSessionLog = {
      parser_version: details.parser_version ?? '2.0.0',
      session_type: sessionType,
      session_subtype: details.session_subtype ?? null,
      perceived_intensity: details.perceived_intensity ?? null,
      readiness: (details.readiness_feel || details.readiness_pain_score != null)
        ? { feel: details.readiness_feel ?? null, pain_score: details.readiness_pain_score ?? null, notes: details.readiness_notes ?? null }
        : null,
      blocks: (['strength', 'conditioning', 'mixed', 'recovery'].includes(sessionType))
        ? blocks.map((b) => ({
            block_index: b.block_index,
            block_name: b.block_name,
            block_type: b.block_type ?? null,
            emom_interval_seconds: b.emom_interval_seconds ?? null,
            circuit_rounds: b.circuit_rounds ?? null,
            intensity_percent: b.intensity_percent ?? null,
            notes: b.notes ?? null,
            exercises: b.exercises.map((ex) => ({
              exercise_index: ex.exercise_index,
              name: ex.name,
              name_original: ex.name_original ?? null,
              name_unknown: ex.name_unknown ?? false,
              category: ex.category ?? undefined,
              equipment: ex.equipment ?? null,
              laterality: ex.laterality ?? null,
              is_superset_with: ex.is_superset_with ?? null,
              notes: ex.notes ?? null,
              total_volume_kg: ex.total_volume_kg ?? null,
              max_weight_kg: ex.max_weight_kg ?? null,
              total_reps: ex.total_reps ?? null,
              set_count: ex.set_count ?? undefined,
              sets: ex.sets.map(toAthleteSetLog),
            })),
          }))
        : undefined,
      sprint_session: sessionType === 'sprint'
        ? {
            surface: details.sprint_surface ?? null,
            footwear: details.sprint_footwear ?? null,
            conditions: details.sprint_conditions ?? null,
            efforts: sprintEfforts.map((e) => ({
              effort_index: e.effort_index,
              drill_type: e.drill_type as SprintEffortDrillType,
              distance_m: e.distance_m ?? null,
              phase_distances_m: e.phase_distances_m ?? undefined,
              effort_percent: e.effort_percent ?? null,
              footwear: e.footwear ?? null,
              rest_between_reps_seconds: e.rest_between_reps_seconds ?? null,
              rest_between_sets_seconds: e.rest_between_sets_seconds ?? null,
              sets: e.sets ?? null,
              notes: e.notes ?? null,
              reps: e.reps.map((r) => ({
                rep_index: r.rep_index,
                time_seconds: r.time_seconds ?? null,
                split_times_seconds: r.split_times_seconds ?? undefined,
                wind_ms: r.wind_ms ?? null,
                completed: r.completed,
                notes: r.notes ?? null,
              })),
            })),
          }
        : null,
      competition_result: sessionType === 'competition'
        ? {
            event: competitionResult.event ?? null,
            competition_name: competitionResult.competition_name ?? null,
            venue: competitionResult.venue ?? null,
            lane: competitionResult.lane ?? null,
            status: competitionResult.status,
            dns_reason: competitionResult.dns_reason ?? null,
            conditions: competitionResult.conditions ?? null,
            best_time_seconds: competitionResult.best_time_seconds ?? null,
            notes: competitionResult.notes ?? null,
            rounds: competitionResult.rounds.map((r) => ({
              round_type: r.round_type,
              time_seconds: r.time_seconds ?? null,
              wind_ms: r.wind_ms ?? null,
              ranking: r.ranking ?? null,
              pb: r.pb,
              sb: r.sb,
              relay_leg: r.relay_leg ?? null,
              relay_split_seconds: r.relay_split_seconds ?? null,
              notes: r.notes ?? null,
            })),
          }
        : null,
      physio_session: (['physio', 'rehab', 'prehab'].includes(sessionType))
        ? {
            provider: details.physio_provider ?? null,
            clearance_status: details.physio_clearance_status ?? null,
            notes: details.physio_notes ?? null,
            body_areas: physioBodyAreas.map((a) => ({
              area: a.area,
              side: a.side ?? null,
              injury_name: a.injury_name ?? null,
              pain_score_before: a.pain_score_before ?? null,
              pain_score_after: a.pain_score_after ?? null,
              treatment_type: a.treatment_type ?? null,
            })),
            exercises: physioExerciseBlocks.flatMap((b) =>
              b.exercises.map((ex) => ({
                exercise_index: ex.exercise_index,
                name: ex.name,
                name_original: ex.name_original ?? null,
                name_unknown: ex.name_unknown ?? false,
                category: ex.category ?? undefined,
                equipment: ex.equipment ?? null,
                laterality: ex.laterality ?? null,
                is_superset_with: ex.is_superset_with ?? null,
                notes: ex.notes ?? null,
                total_volume_kg: ex.total_volume_kg ?? null,
                max_weight_kg: ex.max_weight_kg ?? null,
                total_reps: ex.total_reps ?? null,
                set_count: ex.set_count ?? undefined,
                sets: ex.sets.map(toAthleteSetLog),
              }))
            ),
          }
        : null,
      summary: {
        session_notes: details.session_notes ?? null,
        parser_confidence: details.parser_confidence ?? undefined,
        parsing_warnings: details.parsing_warnings ?? undefined,
        total_volume_kg: details.total_volume_kg ?? null,
        total_sets: details.total_sets ?? null,
        total_reps: details.total_reps ?? null,
        total_distance_m: details.total_distance_m ?? null,
        total_work_duration_seconds: details.total_work_duration_seconds ?? null,
        estimated_intensity: details.perceived_intensity ?? null,
      },
    }

    const result = await updateAiStructured(workout.id, structured)
    if (result?.error) {
      setError(result.error)
      setSaving(false)
    }
  }

  return {
    details, setDetails,
    blocks, setBlocks,
    sprintEfforts, setSprintEfforts,
    competitionResult, setCompetitionResult,
    physioBodyAreas, setPhysioBodyAreas,
    physioExerciseBlocks, setPhysioExerciseBlocks,
    saving, error,
    handleSave,
  }
}
