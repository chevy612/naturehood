const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

// ── Legacy flat schema (v1) — kept for backwards compat ──────────────────────

export type AiStructuredExercise = {
  name: string;
  sets?: number;
  reps?: number | string;
  weight_kg?: number;
  distance_km?: number;
  duration_seconds?: number;
  notes?: string;
};

export type AiStructuredWorkout = {
  exercises: AiStructuredExercise[];
  summary?: string;
  estimated_intensity?: 'low' | 'moderate' | 'high';
};

// ── AthleteSessionLog schema (v2) ─────────────────────────────────────────────

export type SessionType =
  | 'strength' | 'sprint' | 'conditioning' | 'competition'
  | 'physio' | 'rehab' | 'prehab' | 'recovery' | 'mixed' | 'unknown';

export type PerceivedIntensity = 'low' | 'moderate' | 'high' | 'max';

export type WeightType = 'absolute' | 'added' | 'machine_level' | 'band' | 'bodyweight' | null;

export type AthleteSetLog = {
  set_index: number;
  is_warmup?: boolean;
  is_failure?: boolean;
  is_dropset?: boolean;
  weight_kg?: number | null;
  weight_type?: WeightType;
  weight_value_raw?: string;
  added_weight_kg?: number | null;
  machine_level?: number | null;
  reps?: number | null;
  reps_left?: number | null;
  reps_right?: number | null;
  duration_seconds?: number | null;
  distance_m?: number | null;
  pace_seconds_per_km?: number | null;
  time_seconds?: number | null;
  splits_seconds?: number[];
  effort_percent?: number | null;
  rest_seconds?: number | null;
  rest_between_reps_seconds?: number | null;
  notes?: string | null;
};

export type AthleteExerciseLog = {
  exercise_index: number;
  name: string;
  name_original?: string | null;
  name_unknown?: boolean;
  category?: string;
  equipment?: string | null;
  laterality?: string | null;
  is_superset_with?: number | null;
  notes?: string | null;
  sets: AthleteSetLog[];
  total_volume_kg?: number | null;
  max_weight_kg?: number | null;
  total_reps?: number | null;
  set_count?: number;
};

export type AthleteBlock = {
  block_index: number;
  block_name?: string | null;
  block_type?: string | null;
  emom_interval_seconds?: number | null;
  circuit_rounds?: number | null;
  intensity_percent?: number | null;
  notes?: string | null;
  exercises: AthleteExerciseLog[];
};

export type CompetitionRound = {
  round_type: 'heat' | 'semifinal' | 'final' | 'relay';
  time_seconds?: number | null;
  wind_ms?: number | null;
  ranking?: number | null;
  pb?: boolean;
  sb?: boolean;
  relay_leg?: number | null;
  relay_split_seconds?: number | null;
  notes?: string | null;
};

export type CompetitionResult = {
  event?: string | null;
  competition_name?: string | null;
  venue?: string | null;
  lane?: number | null;
  status: 'completed' | 'dns' | 'dnf' | 'dq';
  dns_reason?: string | null;
  rounds: CompetitionRound[];
  best_time_seconds?: number | null;
  conditions?: string | null;
  notes?: string | null;
};

export type SprintRep = {
  rep_index: number;
  time_seconds?: number | null;
  split_times_seconds?: number[];
  wind_ms?: number | null;
  completed?: boolean;
  notes?: string | null;
};

export type SprintEffort = {
  effort_index: number;
  drill_type: string;
  distance_m?: number | null;
  phase_distances_m?: number[];
  effort_percent?: number | null;
  footwear?: string | null;
  reps: SprintRep[];
  rest_between_reps_seconds?: number | null;
  rest_between_sets_seconds?: number | null;
  sets?: number | null;
  notes?: string | null;
};

export type SprintSession = {
  surface?: string | null;
  footwear?: string | null;
  conditions?: string | null;
  efforts: SprintEffort[];
};

export type PhysioBodyArea = {
  area: string;
  side?: string | null;
  injury_name?: string | null;
  pain_score_before?: number | null;
  pain_score_after?: number | null;
  treatment_type?: string | null;
};

export type PhysioSession = {
  session_subtype?: string | null;
  provider?: string | null;
  body_areas?: PhysioBodyArea[];
  exercises?: AthleteExerciseLog[];
  clearance_status?: string | null;
  notes?: string | null;
};

export type SessionSummary = {
  total_volume_kg?: number | null;
  total_sets?: number | null;
  total_reps?: number | null;
  total_distance_m?: number | null;
  total_work_duration_seconds?: number | null;
  estimated_intensity?: PerceivedIntensity | null;
  session_notes?: string | null;
  parser_confidence?: number;
  parsing_warnings?: string[];
};

export type AthleteSessionLog = {
  parser_version: string;
  title?: string | null;
  duration_minutes?: number | null;
  session_type: SessionType;
  session_subtype?: string | null;
  language_detected?: string | null;
  perceived_intensity?: PerceivedIntensity | null;
  readiness?: {
    feel?: string | null;
    pain_score?: number | null;
    notes?: string | null;
  } | null;
  blocks?: AthleteBlock[];
  competition_result?: CompetitionResult | null;
  physio_session?: PhysioSession | null;
  sprint_session?: SprintSession | null;
  summary: SessionSummary;
  coach_review?: unknown | null;
};

// ── Type guard ────────────────────────────────────────────────────────────────

export function isAthleteSessionLog(value: unknown): value is AthleteSessionLog {
  return (
    typeof value === 'object' &&
    value !== null &&
    'session_type' in value &&
    'summary' in value
  );
}

// ── API call ──────────────────────────────────────────────────────────────────

/**
 * Calls the backend AI endpoint to parse and structure a workout log.
 * Saves the result to the database server-side — no extra fetch needed after this.
 */
export async function analyzeWorkoutWithAI(
  workoutId: string,
  accessToken: string
): Promise<{ structured: AthleteSessionLog | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/ai/format-workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id: workoutId }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { structured: null, error: body?.error ?? 'AI analysis failed' };
    }

    return { structured: body.structured ?? null, error: null };
  } catch (err) {
    console.error('[ai-service] analyzeWorkoutWithAI failed:', err);
    return { structured: null, error: 'Network error — could not reach AI service' };
  }
}
