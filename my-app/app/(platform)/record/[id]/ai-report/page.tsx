import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AiReportForm from './AiReportForm'
import type {
  TrainingLog,
  NormalizedSession,
  SessionDetailsRow,
  SessionBlockRow,
  SessionExerciseRow,
  ExerciseSetRow,
  SprintEffortRow,
  SprintRepRow,
  CompetitionResultRow,
  CompetitionRoundRow,
  PhysioBodyAreaRow,
} from '@/lib/types'

export default async function AiReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ── Fetch workout ──────────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('training_logs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) notFound()

  // ── Fetch normalized session data in parallel ──────────────────────────────
  const [
    { data: details },
    { data: blocks },
    { data: exercises },
    { data: sets },
    { data: sprintEfforts },
    { data: sprintReps },
    { data: compResult },
    { data: compRounds },
    { data: physioAreas },
  ] = await Promise.all([
    supabase.from('session_details').select('*').eq('training_log_id', id).maybeSingle(),
    supabase.from('session_blocks').select('*').eq('training_log_id', id).order('block_index'),
    supabase.from('session_exercises').select('*').eq('training_log_id', id).order('exercise_index'),
    supabase.from('exercise_sets').select('*').eq('training_log_id', id).order('set_index'),
    supabase.from('sprint_efforts').select('*').eq('training_log_id', id).order('effort_index'),
    supabase.from('sprint_reps').select('*').eq('training_log_id', id).order('rep_index'),
    supabase.from('competition_results').select('*').eq('training_log_id', id).maybeSingle(),
    supabase.from('competition_rounds').select('*').eq('training_log_id', id).order('round_index'),
    supabase.from('physio_body_areas').select('*').eq('training_log_id', id).order('area_index'),
  ])

  // ── Assemble NormalizedSession ─────────────────────────────────────────────
  const exercisesWithSets = (exercises ?? []).map((ex: SessionExerciseRow) => ({
    ...ex,
    sets: (sets ?? []).filter((s: ExerciseSetRow) => s.exercise_id === ex.id),
  }))

  const sprintEffortsWithReps = (sprintEfforts ?? []).map((e: SprintEffortRow) => ({
    ...e,
    reps: (sprintReps ?? []).filter((r: SprintRepRow) => r.effort_id === e.id),
  }))

  const competitionWithRounds = compResult
    ? { ...compResult, rounds: compRounds ?? [] }
    : null

  const normalizedSession: NormalizedSession = {
    details: (details as SessionDetailsRow | null) ?? null,
    blocks: (blocks ?? []) as SessionBlockRow[],
    exercises: exercisesWithSets,
    sprint_efforts: sprintEffortsWithReps,
    competition_result: competitionWithRounds as (CompetitionResultRow & { rounds: CompetitionRoundRow[] }) | null,
    physio_body_areas: (physioAreas ?? []) as PhysioBodyAreaRow[],
  }

  return (
    <div className="min-h-screen bg-[#141115] px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-10"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          AI Report
        </p>

        <h1
          className="text-2xl font-bold text-white mb-8"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
        >
          Review Your Workout
        </h1>

        <AiReportForm workout={data as TrainingLog} normalizedSession={normalizedSession} />
      </div>
    </div>
  )
}
