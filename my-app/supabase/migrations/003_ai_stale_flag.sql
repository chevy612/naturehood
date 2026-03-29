-- Phase 1: Stale flag for AI re-analysis tracking
-- Set to true when workout_log is edited after ai_structured has been populated.
-- Cleared when AI re-analysis completes (via format-workout route or updateAiStructured action).

ALTER TABLE training_logs
  ADD COLUMN IF NOT EXISTS ai_needs_refresh boolean NOT NULL DEFAULT false;

-- Partial index: efficiently find stale rows for future background processing (Phase 2)
CREATE INDEX IF NOT EXISTS idx_training_logs_ai_stale
  ON training_logs(user_id, id)
  WHERE ai_needs_refresh = true AND ai_structured IS NOT NULL AND is_deleted = false;

COMMENT ON COLUMN training_logs.ai_needs_refresh IS
  'Set to true when workout_log is edited after ai_structured has been populated. Cleared when AI re-analysis completes.';
