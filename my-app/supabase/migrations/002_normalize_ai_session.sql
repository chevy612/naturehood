-- ─────────────────────────────────────────────────────────────────────────────
-- 002_normalize_ai_session.sql
-- Flatten ai_structured JSONB into relational tables.
-- ai_structured JSONB is kept on training_logs for mobile backwards compat.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── session_details (1:1 with training_logs) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS session_details (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_log_id             uuid NOT NULL UNIQUE REFERENCES training_logs(id) ON DELETE CASCADE,
  user_id                     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- session classification
  session_type                text,   -- strength | sprint | conditioning | competition | physio | rehab | prehab | recovery | mixed | unknown
  session_subtype             text,   -- power | tempo | endurance | technical | circuit
  perceived_intensity         text,   -- low | moderate | high | max

  -- readiness
  readiness_feel              text,   -- good | tired | sore | great
  readiness_pain_score        smallint CHECK (readiness_pain_score BETWEEN 0 AND 10),
  readiness_notes             text,

  -- summary / parser metadata
  session_notes               text,
  parser_version              text,
  parser_confidence           numeric(3,2) CHECK (parser_confidence BETWEEN 0 AND 1),
  parsing_warnings            text[],

  -- sprint session metadata
  sprint_surface              text,
  sprint_footwear             text,
  sprint_conditions           text,

  -- physio session metadata
  physio_provider             text,   -- physiotherapist | coach | self
  physio_clearance_status     text,   -- cleared | modified_training | rest_only | pending_review
  physio_notes                text,

  -- coach review
  coach_reviewed_by           text,
  coach_reviewed_at           timestamptz,
  coach_approved              boolean,
  coach_feedback              text,
  coach_load_rating           text,   -- underload | optimal | overload

  -- aggregates (denormalized for fast display + feed cards)
  total_volume_kg             numeric,
  total_sets                  integer,
  total_reps                  integer,
  total_distance_m            numeric,
  total_work_duration_seconds integer,

  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE session_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner only" ON session_details FOR ALL USING (user_id = auth.uid());

-- ── session_blocks ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_blocks (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_log_id         uuid NOT NULL REFERENCES training_logs(id) ON DELETE CASCADE,
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  block_index             smallint NOT NULL,
  block_name              text,
  block_type              text,   -- warmup | main | cooldown | superset | circuit | emom | amrap
  emom_interval_seconds   smallint,
  circuit_rounds          smallint,
  intensity_percent       smallint,
  notes                   text,
  UNIQUE(training_log_id, block_index)
);

ALTER TABLE session_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner only" ON session_blocks FOR ALL USING (user_id = auth.uid());

-- ── session_exercises ─────────────────────────────────────────────────────────
-- Covers strength/conditioning exercises within blocks AND physio rehab exercises.
-- block_id is nullable (physio exercises may not belong to a block).
CREATE TABLE IF NOT EXISTS session_exercises (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_log_id   uuid NOT NULL REFERENCES training_logs(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  block_id          uuid REFERENCES session_blocks(id) ON DELETE CASCADE,
  exercise_index    smallint NOT NULL,
  name              text NOT NULL,
  name_original     text,
  name_unknown      boolean NOT NULL DEFAULT false,
  category          text,   -- olympic_lift | strength | plyometric | sprint | jump | core | mobility | cardio | coordination | isometric | unknown
  equipment         text,   -- barbell | dumbbell | machine | cable | bodyweight | resistance_band | sled | trap_bar | kettlebell
  laterality        text,   -- bilateral | unilateral_left | unilateral_right | alternating
  is_superset_with  smallint,
  notes             text,
  -- computed aggregates (denormalized for display, updated on save)
  total_volume_kg   numeric,
  max_weight_kg     numeric,
  total_reps        integer,
  set_count         smallint
);

ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner only" ON session_exercises FOR ALL USING (user_id = auth.uid());

-- ── exercise_sets ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercise_sets (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id                 uuid NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
  training_log_id             uuid NOT NULL REFERENCES training_logs(id) ON DELETE CASCADE,
  user_id                     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  set_index                   smallint NOT NULL,
  is_warmup                   boolean NOT NULL DEFAULT false,
  is_failure                  boolean NOT NULL DEFAULT false,
  is_dropset                  boolean NOT NULL DEFAULT false,
  weight_kg                   numeric,
  weight_type                 text,   -- absolute | added | machine_level | band | bodyweight
  weight_value_raw            text,
  added_weight_kg             numeric,
  machine_level               numeric,
  reps                        smallint,
  reps_left                   smallint,
  reps_right                  smallint,
  duration_seconds            integer,
  distance_m                  numeric,
  pace_seconds_per_km         numeric,
  time_seconds                numeric,
  splits_seconds              jsonb,  -- number[] — kept as JSONB (rarely queried per-split)
  effort_percent              smallint CHECK (effort_percent BETWEEN 0 AND 100),
  rest_seconds                smallint,
  rest_between_reps_seconds   smallint,
  notes                       text
);

ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner only" ON exercise_sets FOR ALL USING (user_id = auth.uid());

-- ── sprint_efforts ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sprint_efforts (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_log_id             uuid NOT NULL REFERENCES training_logs(id) ON DELETE CASCADE,
  user_id                     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  effort_index                smallint NOT NULL,
  drill_type                  text NOT NULL,  -- block_start | fly | acceleration | tempo | speed_endurance | hill_sprint | hurdle | relay_exchange | time_trial
  distance_m                  numeric,
  phase_distances_m           jsonb,  -- number[]
  effort_percent              smallint CHECK (effort_percent BETWEEN 0 AND 100),
  footwear                    text,
  rest_between_reps_seconds   smallint,
  rest_between_sets_seconds   smallint,
  sets                        smallint,
  notes                       text,
  UNIQUE(training_log_id, effort_index)
);

ALTER TABLE sprint_efforts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner only" ON sprint_efforts FOR ALL USING (user_id = auth.uid());

-- ── sprint_reps ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sprint_reps (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  effort_id            uuid NOT NULL REFERENCES sprint_efforts(id) ON DELETE CASCADE,
  training_log_id      uuid NOT NULL REFERENCES training_logs(id) ON DELETE CASCADE,
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rep_index            smallint NOT NULL,
  time_seconds         numeric,
  split_times_seconds  jsonb,  -- number[]
  wind_ms              numeric,
  completed            boolean NOT NULL DEFAULT true,
  notes                text
);

ALTER TABLE sprint_reps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner only" ON sprint_reps FOR ALL USING (user_id = auth.uid());

-- ── competition_results ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS competition_results (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_log_id     uuid NOT NULL UNIQUE REFERENCES training_logs(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event               text,
  competition_name    text,
  venue               text,
  lane                smallint,
  status              text NOT NULL DEFAULT 'completed',  -- completed | dns | dnf | dq
  dns_reason          text,
  conditions          text,
  best_time_seconds   numeric,
  notes               text
);

ALTER TABLE competition_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner only" ON competition_results FOR ALL USING (user_id = auth.uid());

-- ── competition_rounds ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS competition_rounds (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_result_id uuid NOT NULL REFERENCES competition_results(id) ON DELETE CASCADE,
  training_log_id       uuid NOT NULL REFERENCES training_logs(id) ON DELETE CASCADE,
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  round_index           smallint NOT NULL,
  round_type            text NOT NULL,  -- heat | semifinal | final | relay
  time_seconds          numeric,
  wind_ms               numeric,
  ranking               smallint,
  pb                    boolean NOT NULL DEFAULT false,
  sb                    boolean NOT NULL DEFAULT false,
  relay_leg             smallint,
  relay_split_seconds   numeric,
  notes                 text
);

ALTER TABLE competition_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner only" ON competition_rounds FOR ALL USING (user_id = auth.uid());

-- ── physio_body_areas ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS physio_body_areas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_log_id     uuid NOT NULL REFERENCES training_logs(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_index          smallint NOT NULL,
  area                text NOT NULL,
  side                text,   -- left | right | bilateral
  injury_name         text,
  pain_score_before   smallint CHECK (pain_score_before BETWEEN 0 AND 10),
  pain_score_after    smallint CHECK (pain_score_after BETWEEN 0 AND 10),
  treatment_type      text
);

ALTER TABLE physio_body_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner only" ON physio_body_areas FOR ALL USING (user_id = auth.uid());

-- ── Indexes for common query patterns ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_session_details_user ON session_details(user_id);
CREATE INDEX IF NOT EXISTS idx_session_details_type ON session_details(user_id, session_type);
CREATE INDEX IF NOT EXISTS idx_session_blocks_log ON session_blocks(training_log_id);
CREATE INDEX IF NOT EXISTS idx_session_exercises_log ON session_exercises(training_log_id);
CREATE INDEX IF NOT EXISTS idx_session_exercises_block ON session_exercises(block_id);
CREATE INDEX IF NOT EXISTS idx_session_exercises_name ON session_exercises(user_id, name);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise ON exercise_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_log ON exercise_sets(training_log_id);
CREATE INDEX IF NOT EXISTS idx_sprint_efforts_log ON sprint_efforts(training_log_id);
CREATE INDEX IF NOT EXISTS idx_sprint_reps_effort ON sprint_reps(effort_id);
CREATE INDEX IF NOT EXISTS idx_competition_rounds_result ON competition_rounds(competition_result_id);
CREATE INDEX IF NOT EXISTS idx_physio_body_areas_log ON physio_body_areas(training_log_id);
