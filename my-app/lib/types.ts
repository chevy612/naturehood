// ─────────────────────────────────────────────
// PLATFORM TYPES
// ─────────────────────────────────────────────

// ── AI — legacy flat schema (v1) ─────────────
// Kept for backwards compat with WorkoutDetail.tsx / AiReportForm.tsx

export type AiStructuredExercise = {
  name: string
  sets?: number
  reps?: number | string
  weight_kg?: number
  distance_km?: number
  duration_seconds?: number
  notes?: string
}

export type AiStructuredWorkout = {
  exercises: AiStructuredExercise[]
  summary?: string
  estimated_intensity?: 'low' | 'moderate' | 'high'
}

// ── AI — AthleteSessionLog schema (v2) ────────

export type SessionType =
  | 'strength' | 'sprint' | 'conditioning' | 'competition'
  | 'physio' | 'rehab' | 'prehab' | 'recovery' | 'mixed' | 'unknown'

export type SessionSubtype = 'power' | 'tempo' | 'endurance' | 'technical' | 'circuit' | null

export type PerceivedIntensity = 'low' | 'moderate' | 'high' | 'max'

export type BlockType = 'warmup' | 'main' | 'cooldown' | 'superset' | 'circuit' | 'emom' | 'amrap'

export type ExerciseCategory =
  | 'olympic_lift' | 'strength' | 'plyometric' | 'sprint' | 'jump'
  | 'core' | 'mobility' | 'cardio' | 'coordination' | 'isometric' | 'unknown'

export type Equipment =
  | 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight'
  | 'resistance_band' | 'sled' | 'trap_bar' | 'kettlebell' | null

export type WeightType = 'absolute' | 'added' | 'machine_level' | 'band' | 'bodyweight' | null

export type Laterality = 'bilateral' | 'unilateral_left' | 'unilateral_right' | 'alternating' | null

export type AthleteSetLog = {
  set_index: number
  is_warmup?: boolean
  is_failure?: boolean
  is_dropset?: boolean
  // strength
  weight_kg?: number | null
  weight_type?: WeightType
  weight_value_raw?: string
  added_weight_kg?: number | null
  machine_level?: number | null
  reps?: number | null
  reps_left?: number | null
  reps_right?: number | null
  // cardio / interval
  duration_seconds?: number | null
  distance_m?: number | null
  pace_seconds_per_km?: number | null
  // time / performance
  time_seconds?: number | null
  splits_seconds?: number[]
  effort_percent?: number | null
  // rest
  rest_seconds?: number | null
  rest_between_reps_seconds?: number | null
  notes?: string | null
}

export type AthleteExerciseLog = {
  exercise_index: number
  name: string
  name_original?: string | null
  name_unknown?: boolean
  category?: ExerciseCategory
  equipment?: Equipment
  laterality?: Laterality
  is_superset_with?: number | null
  notes?: string | null
  sets: AthleteSetLog[]
  // computed
  total_volume_kg?: number | null
  max_weight_kg?: number | null
  total_reps?: number | null
  set_count?: number
}

export type AthleteBlock = {
  block_index: number
  block_name?: string | null
  block_type?: BlockType | null
  emom_interval_seconds?: number | null
  circuit_rounds?: number | null
  intensity_percent?: number | null
  notes?: string | null
  exercises: AthleteExerciseLog[]
}

export type CompetitionRound = {
  round_type: 'heat' | 'semifinal' | 'final' | 'relay'
  time_seconds?: number | null
  wind_ms?: number | null
  ranking?: number | null
  pb?: boolean
  sb?: boolean
  relay_leg?: number | null
  relay_split_seconds?: number | null
  notes?: string | null
}

export type CompetitionResult = {
  event?: string | null
  competition_name?: string | null
  venue?: string | null
  lane?: number | null
  status: 'completed' | 'dns' | 'dnf' | 'dq'
  dns_reason?: string | null
  rounds: CompetitionRound[]
  best_time_seconds?: number | null
  conditions?: string | null
  notes?: string | null
}

export type SprintRep = {
  rep_index: number
  time_seconds?: number | null
  split_times_seconds?: number[]
  wind_ms?: number | null
  completed?: boolean
  notes?: string | null
}

export type SprintEffort = {
  effort_index: number
  drill_type:
    | 'block_start' | 'fly' | 'acceleration' | 'tempo' | 'speed_endurance'
    | 'hill_sprint' | 'hurdle' | 'relay_exchange' | 'time_trial'
  distance_m?: number | null
  phase_distances_m?: number[]
  effort_percent?: number | null
  footwear?: string | null
  reps: SprintRep[]
  rest_between_reps_seconds?: number | null
  rest_between_sets_seconds?: number | null
  sets?: number | null
  notes?: string | null
}

export type SprintSession = {
  surface?: string | null
  footwear?: string | null
  conditions?: string | null
  efforts: SprintEffort[]
}

export type PhysioBodyArea = {
  area: string
  side?: 'left' | 'right' | 'bilateral' | null
  injury_name?: string | null
  pain_score_before?: number | null
  pain_score_after?: number | null
  treatment_type?: string | null
}

export type PhysioSession = {
  session_subtype?: 'physio' | 'rehab' | 'prehab' | 'massage' | 'ice_bath' | 'stretching' | null
  provider?: 'physiotherapist' | 'coach' | 'self' | null
  body_areas?: PhysioBodyArea[]
  exercises?: AthleteExerciseLog[]
  clearance_status?: 'cleared' | 'modified_training' | 'rest_only' | 'pending_review' | null
  notes?: string | null
}

export type SessionSummary = {
  total_volume_kg?: number | null
  total_sets?: number | null
  total_reps?: number | null
  total_distance_m?: number | null
  total_work_duration_seconds?: number | null
  estimated_intensity?: PerceivedIntensity | null
  session_notes?: string | null
  parser_confidence?: number
  parsing_warnings?: string[]
}

export type AthleteSessionLog = {
  parser_version: string
  title?: string | null
  duration_minutes?: number | null
  session_type: SessionType
  session_subtype?: SessionSubtype
  language_detected?: string | null
  perceived_intensity?: PerceivedIntensity | null
  readiness?: {
    feel?: 'good' | 'tired' | 'sore' | 'great' | null
    pain_score?: number | null
    notes?: string | null
  } | null
  blocks?: AthleteBlock[]
  competition_result?: CompetitionResult | null
  physio_session?: PhysioSession | null
  sprint_session?: SprintSession | null
  summary: SessionSummary
  coach_review?: {
    reviewed_by?: string | null
    reviewed_at?: string | null
    approved?: boolean | null
    corrections?: unknown[]
    feedback?: string | null
    load_rating?: 'underload' | 'optimal' | 'overload' | null
  } | null
}

// ── Normalized session row types (from 002_normalize_ai_session migration) ────

export type SessionDetailsRow = {
  id: string
  training_log_id: string
  user_id: string
  session_type: SessionType | null
  session_subtype: SessionSubtype
  perceived_intensity: PerceivedIntensity | null
  readiness_feel: 'good' | 'tired' | 'sore' | 'great' | null
  readiness_pain_score: number | null
  readiness_notes: string | null
  session_notes: string | null
  parser_version: string | null
  parser_confidence: number | null
  parsing_warnings: string[] | null
  sprint_surface: string | null
  sprint_footwear: string | null
  sprint_conditions: string | null
  physio_provider: 'physiotherapist' | 'coach' | 'self' | null
  physio_clearance_status: 'cleared' | 'modified_training' | 'rest_only' | 'pending_review' | null
  physio_notes: string | null
  coach_reviewed_by: string | null
  coach_reviewed_at: string | null
  coach_approved: boolean | null
  coach_feedback: string | null
  coach_load_rating: 'underload' | 'optimal' | 'overload' | null
  total_volume_kg: number | null
  total_sets: number | null
  total_reps: number | null
  total_distance_m: number | null
  total_work_duration_seconds: number | null
  created_at: string
  updated_at: string
}

export type SessionBlockRow = {
  id: string
  training_log_id: string
  user_id: string
  block_index: number
  block_name: string | null
  block_type: BlockType | null
  emom_interval_seconds: number | null
  circuit_rounds: number | null
  intensity_percent: number | null
  notes: string | null
}

export type SessionExerciseRow = {
  id: string
  training_log_id: string
  user_id: string
  block_id: string | null
  exercise_index: number
  name: string
  name_original: string | null
  name_unknown: boolean
  category: ExerciseCategory | null
  equipment: Equipment
  laterality: Laterality
  is_superset_with: number | null
  notes: string | null
  total_volume_kg: number | null
  max_weight_kg: number | null
  total_reps: number | null
  set_count: number | null
}

export type ExerciseSetRow = {
  id: string
  exercise_id: string
  training_log_id: string
  user_id: string
  set_index: number
  is_warmup: boolean
  is_failure: boolean
  is_dropset: boolean
  weight_kg: number | null
  weight_type: WeightType
  weight_value_raw: string | null
  added_weight_kg: number | null
  machine_level: number | null
  reps: number | null
  reps_left: number | null
  reps_right: number | null
  duration_seconds: number | null
  distance_m: number | null
  pace_seconds_per_km: number | null
  time_seconds: number | null
  splits_seconds: number[] | null
  effort_percent: number | null
  rest_seconds: number | null
  rest_between_reps_seconds: number | null
  notes: string | null
}

export type SprintEffortRow = {
  id: string
  training_log_id: string
  user_id: string
  effort_index: number
  drill_type: string
  distance_m: number | null
  phase_distances_m: number[] | null
  effort_percent: number | null
  footwear: string | null
  rest_between_reps_seconds: number | null
  rest_between_sets_seconds: number | null
  sets: number | null
  notes: string | null
}

export type SprintRepRow = {
  id: string
  effort_id: string
  training_log_id: string
  user_id: string
  rep_index: number
  time_seconds: number | null
  split_times_seconds: number[] | null
  wind_ms: number | null
  completed: boolean
  notes: string | null
}

export type CompetitionResultRow = {
  id: string
  training_log_id: string
  user_id: string
  event: string | null
  competition_name: string | null
  venue: string | null
  lane: number | null
  status: 'completed' | 'dns' | 'dnf' | 'dq'
  dns_reason: string | null
  conditions: string | null
  best_time_seconds: number | null
  notes: string | null
}

export type CompetitionRoundRow = {
  id: string
  competition_result_id: string
  training_log_id: string
  user_id: string
  round_index: number
  round_type: 'heat' | 'semifinal' | 'final' | 'relay'
  time_seconds: number | null
  wind_ms: number | null
  ranking: number | null
  pb: boolean
  sb: boolean
  relay_leg: number | null
  relay_split_seconds: number | null
  notes: string | null
}

export type PhysioBodyAreaRow = {
  id: string
  training_log_id: string
  user_id: string
  area_index: number
  area: string
  side: 'left' | 'right' | 'bilateral' | null
  injury_name: string | null
  pain_score_before: number | null
  pain_score_after: number | null
  treatment_type: string | null
}

// Composite type returned when fetching a full normalized session
export type NormalizedSession = {
  details: SessionDetailsRow | null
  blocks: SessionBlockRow[]
  exercises: (SessionExerciseRow & { sets: ExerciseSetRow[] })[]
  sprint_efforts: (SprintEffortRow & { reps: SprintRepRow[] })[]
  competition_result: (CompetitionResultRow & { rounds: CompetitionRoundRow[] }) | null
  physio_body_areas: PhysioBodyAreaRow[]
}

// ── Core entities ─────────────────────────────

export type TrainingLog = {
  id: string
  user_id: string
  title: string
  logged_date: string
  duration_minutes: number | null
  workout_log: string | null
  is_public: boolean
  like_count: number
  ai_structured: AthleteSessionLog | AiStructuredWorkout | null
  ai_formatted_at: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export type Event = {
  id: string
  title: string
  description: string | null
  location: string | null
  event_date: string
  event_time: string | null
  max_capacity: number | null
  image_url: string | null
  status: 'draft' | 'published' | 'cancelled'
  created_at: string
  updated_at: string
}

export type EventSignup = {
  id: string
  event_id: string
  user_id: string
  status: 'confirmed' | 'cancelled'
  signed_up_at: string
}
