import type { SupabaseClient } from '@supabase/supabase-js'
import type { AthleteSessionLog, AthleteExerciseLog } from '@/lib/types'

/**
 * Persists a parsed AthleteSessionLog into normalized relational tables.
 * Deletes any existing rows for this training_log_id first (clean re-insert).
 * Call this after writing ai_structured JSONB so both stay in sync.
 */
export async function persistNormalizedSession(
  supabase: SupabaseClient,
  training_log_id: string,
  user_id: string,
  session: AthleteSessionLog
): Promise<{ error?: string }> {
  // ── 1. session_details (upsert) ──────────────────────────────────────────
  const { error: detailsError } = await supabase
    .from('session_details')
    .upsert(
      {
        training_log_id,
        user_id,
        session_type: session.session_type ?? null,
        session_subtype: session.session_subtype ?? null,
        perceived_intensity: session.perceived_intensity ?? null,
        readiness_feel: session.readiness?.feel ?? null,
        readiness_pain_score: session.readiness?.pain_score ?? null,
        readiness_notes: session.readiness?.notes ?? null,
        session_notes: session.summary?.session_notes ?? null,
        parser_version: session.parser_version ?? null,
        parser_confidence: session.summary?.parser_confidence ?? null,
        parsing_warnings: session.summary?.parsing_warnings ?? null,
        sprint_surface: session.sprint_session?.surface ?? null,
        sprint_footwear: session.sprint_session?.footwear ?? null,
        sprint_conditions: session.sprint_session?.conditions ?? null,
        physio_provider: session.physio_session?.provider ?? null,
        physio_clearance_status: session.physio_session?.clearance_status ?? null,
        physio_notes: session.physio_session?.notes ?? null,
        coach_reviewed_by: session.coach_review?.reviewed_by ?? null,
        coach_reviewed_at: session.coach_review?.reviewed_at ?? null,
        coach_approved: session.coach_review?.approved ?? null,
        coach_feedback: session.coach_review?.feedback ?? null,
        coach_load_rating: session.coach_review?.load_rating ?? null,
        total_volume_kg: session.summary?.total_volume_kg ?? null,
        total_sets: session.summary?.total_sets != null ? Math.round(session.summary.total_sets) : null,
        total_reps: session.summary?.total_reps != null ? Math.round(session.summary.total_reps) : null,
        total_distance_m: session.summary?.total_distance_m ?? null,
        total_work_duration_seconds: session.summary?.total_work_duration_seconds != null ? Math.round(session.summary.total_work_duration_seconds) : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'training_log_id' }
    )

  if (detailsError) {
    console.error('[persist] session_details error:', detailsError)
    return { error: 'Failed to persist session details' }
  }

  // ── 2. Strength/conditioning blocks + exercises + sets ───────────────────
  if (session.blocks?.length) {
    // Delete existing (cascade deletes exercises + sets)
    await supabase.from('session_blocks').delete().eq('training_log_id', training_log_id)

    for (const [blockIdx, block] of session.blocks.entries()) {
      const { data: blockRow, error: blockError } = await supabase
        .from('session_blocks')
        .insert({
          training_log_id,
          user_id,
          block_index: block.block_index ?? blockIdx,
          block_name: block.block_name ?? null,
          block_type: block.block_type ?? null,
          emom_interval_seconds: block.emom_interval_seconds ?? null,
          circuit_rounds: block.circuit_rounds ?? null,
          intensity_percent: block.intensity_percent ?? null,
          notes: block.notes ?? null,
        })
        .select('id')
        .single()

      if (blockError || !blockRow) {
        console.error('[persist] session_blocks error:', blockError)
        return { error: 'Failed to persist session blocks' }
      }

      const exerciseResult = await persistExercises(
        supabase,
        training_log_id,
        user_id,
        blockRow.id,
        block.exercises
      )
      if (exerciseResult?.error) return exerciseResult
    }
  }

  // ── 3. Physio exercises (no block, block_id = null) ──────────────────────
  if (session.physio_session?.exercises?.length) {
    // Delete physio-only exercises (block_id IS NULL for this log)
    await supabase
      .from('session_exercises')
      .delete()
      .eq('training_log_id', training_log_id)
      .is('block_id', null)

    const exerciseResult = await persistExercises(
      supabase,
      training_log_id,
      user_id,
      null,
      session.physio_session.exercises
    )
    if (exerciseResult?.error) return exerciseResult
  }

  // ── 4. Physio body areas ─────────────────────────────────────────────────
  if (session.physio_session?.body_areas?.length) {
    await supabase.from('physio_body_areas').delete().eq('training_log_id', training_log_id)

    const areas = session.physio_session.body_areas.map((area, idx) => ({
      training_log_id,
      user_id,
      area_index: idx,
      area: area.area,
      side: area.side ?? null,
      injury_name: area.injury_name ?? null,
      pain_score_before: area.pain_score_before ?? null,
      pain_score_after: area.pain_score_after ?? null,
      treatment_type: area.treatment_type ?? null,
    }))

    const { error: areaError } = await supabase.from('physio_body_areas').insert(areas)
    if (areaError) {
      console.error('[persist] physio_body_areas error:', areaError)
      return { error: 'Failed to persist physio body areas' }
    }
  }

  // ── 5. Sprint efforts + reps ─────────────────────────────────────────────
  if (session.sprint_session?.efforts?.length) {
    await supabase.from('sprint_efforts').delete().eq('training_log_id', training_log_id)

    for (const [effortIdx, effort] of session.sprint_session.efforts.entries()) {
      const { data: effortRow, error: effortError } = await supabase
        .from('sprint_efforts')
        .insert({
          training_log_id,
          user_id,
          effort_index: effort.effort_index ?? effortIdx,
          drill_type: effort.drill_type,
          distance_m: effort.distance_m ?? null,
          phase_distances_m: effort.phase_distances_m ?? null,
          effort_percent: effort.effort_percent ?? null,
          footwear: effort.footwear ?? null,
          rest_between_reps_seconds: effort.rest_between_reps_seconds ?? null,
          rest_between_sets_seconds: effort.rest_between_sets_seconds ?? null,
          sets: effort.sets ?? null,
          notes: effort.notes ?? null,
        })
        .select('id')
        .single()

      if (effortError || !effortRow) {
        console.error('[persist] sprint_efforts error:', effortError)
        return { error: 'Failed to persist sprint efforts' }
      }

      if (effort.reps?.length) {
        const reps = effort.reps.map((rep, repIdx) => ({
          effort_id: effortRow.id,
          training_log_id,
          user_id,
          rep_index: rep.rep_index ?? repIdx,
          time_seconds: rep.time_seconds ?? null,
          split_times_seconds: rep.split_times_seconds ?? null,
          wind_ms: rep.wind_ms ?? null,
          completed: rep.completed ?? true,
          notes: rep.notes ?? null,
        }))

        const { error: repError } = await supabase.from('sprint_reps').insert(reps)
        if (repError) {
          console.error('[persist] sprint_reps error:', repError)
          return { error: 'Failed to persist sprint reps' }
        }
      }
    }
  }

  // ── 6. Competition result + rounds ───────────────────────────────────────
  if (session.competition_result) {
    const comp = session.competition_result

    const { data: compRow, error: compError } = await supabase
      .from('competition_results')
      .upsert(
        {
          training_log_id,
          user_id,
          event: comp.event ?? null,
          competition_name: comp.competition_name ?? null,
          venue: comp.venue ?? null,
          lane: comp.lane ?? null,
          status: comp.status,
          dns_reason: comp.dns_reason ?? null,
          conditions: comp.conditions ?? null,
          best_time_seconds: comp.best_time_seconds ?? null,
          notes: comp.notes ?? null,
        },
        { onConflict: 'training_log_id' }
      )
      .select('id')
      .single()

    if (compError || !compRow) {
      console.error('[persist] competition_results error:', compError)
      return { error: 'Failed to persist competition result' }
    }

    if (comp.rounds?.length) {
      // Delete existing rounds for this competition result
      await supabase.from('competition_rounds').delete().eq('competition_result_id', compRow.id)

      const rounds = comp.rounds.map((round, idx) => ({
        competition_result_id: compRow.id,
        training_log_id,
        user_id,
        round_index: idx,
        round_type: round.round_type,
        time_seconds: round.time_seconds ?? null,
        wind_ms: round.wind_ms ?? null,
        ranking: round.ranking ?? null,
        pb: round.pb ?? false,
        sb: round.sb ?? false,
        relay_leg: round.relay_leg ?? null,
        relay_split_seconds: round.relay_split_seconds ?? null,
        notes: round.notes ?? null,
      }))

      const { error: roundError } = await supabase.from('competition_rounds').insert(rounds)
      if (roundError) {
        console.error('[persist] competition_rounds error:', roundError)
        return { error: 'Failed to persist competition rounds' }
      }
    }
  }

  return {}
}

// ── Internal helper: persist exercises + sets for a block (or physio) ────────

async function persistExercises(
  supabase: SupabaseClient,
  training_log_id: string,
  user_id: string,
  block_id: string | null,
  exercises: AthleteExerciseLog[]
): Promise<{ error?: string } | undefined> {
  for (const [exIdx, ex] of exercises.entries()) {
    const { data: exRow, error: exError } = await supabase
      .from('session_exercises')
      .insert({
        training_log_id,
        user_id,
        block_id,
        exercise_index: ex.exercise_index ?? exIdx,
        name: ex.name,
        name_original: ex.name_original ?? null,
        name_unknown: ex.name_unknown ?? false,
        category: ex.category ?? null,
        equipment: ex.equipment ?? null,
        laterality: ex.laterality ?? null,
        is_superset_with: ex.is_superset_with ?? null,
        notes: ex.notes ?? null,
        total_volume_kg: ex.total_volume_kg ?? null,
        max_weight_kg: ex.max_weight_kg ?? null,
        total_reps: ex.total_reps != null ? Math.round(ex.total_reps) : null,
        set_count: ex.set_count ?? null,
      })
      .select('id')
      .single()

    if (exError || !exRow) {
      console.error('[persist] session_exercises error:', exError)
      return { error: 'Failed to persist session exercises' }
    }

    if (ex.sets?.length) {
      const sets = ex.sets.map((s, sIdx) => ({
        exercise_id: exRow.id,
        training_log_id,
        user_id,
        set_index: s.set_index ?? sIdx,
        is_warmup: s.is_warmup ?? false,
        is_failure: s.is_failure ?? false,
        is_dropset: s.is_dropset ?? false,
        weight_kg: s.weight_kg ?? null,
        weight_type: s.weight_type ?? null,
        weight_value_raw: s.weight_value_raw ?? null,
        added_weight_kg: s.added_weight_kg ?? null,
        machine_level: s.machine_level ?? null,
        reps: s.reps ?? null,
        reps_left: s.reps_left ?? null,
        reps_right: s.reps_right ?? null,
        duration_seconds: s.duration_seconds != null ? Math.round(s.duration_seconds) : null,
        distance_m: s.distance_m ?? null,
        pace_seconds_per_km: s.pace_seconds_per_km ?? null,
        time_seconds: s.time_seconds ?? null,
        splits_seconds: s.splits_seconds ?? null,
        effort_percent: s.effort_percent ?? null,
        rest_seconds: s.rest_seconds ?? null,
        rest_between_reps_seconds: s.rest_between_reps_seconds ?? null,
        notes: s.notes ?? null,
      }))

      const { error: setError } = await supabase.from('exercise_sets').insert(sets)
      if (setError) {
        console.error('[persist] exercise_sets error:', setError)
        return { error: 'Failed to persist exercise sets' }
      }
    }
  }
}