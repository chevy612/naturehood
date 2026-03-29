-- Phase 1: AI Workout Formatting
-- Run this in the Supabase SQL editor (dev project: jkaucsreqaywqxjwvteh)

ALTER TABLE training_logs
  ADD COLUMN IF NOT EXISTS ai_structured jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_formatted_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS like_count integer NOT NULL DEFAULT 0;
