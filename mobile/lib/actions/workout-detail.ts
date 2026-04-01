import { supabase } from '../supabase';
import type { AthleteSessionLog, AiStructuredWorkout } from '../services/ai';

export type { AiStructuredExercise, AiStructuredWorkout, AthleteSessionLog } from '../services/ai';
export { analyzeWorkoutWithAI, isAthleteSessionLog } from '../services/ai';

export type WorkoutDetail = {
  id: string;
  title: string;
  logged_date: string;
  duration_minutes: number | null;
  workout_types: string[];
  workout_log: string | null;
  is_public: boolean;
  ai_structured: AthleteSessionLog | AiStructuredWorkout | null;
  ai_formatted_at: string | null;
  ai_needs_refresh: boolean;
};

export async function fetchWorkout(id: string): Promise<WorkoutDetail | null> {
  const { data } = await supabase
    .from('training_logs')
    .select('id, title, logged_date, duration_minutes, workout_types, workout_log, is_public, ai_structured, ai_formatted_at, ai_needs_refresh')
    .eq('id', id)
    .single();
  return data ?? null;
}

export async function updateAiStructured(
  id: string,
  userId: string,
  data: AthleteSessionLog | AiStructuredWorkout
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('training_logs')
    .update({ ai_structured: data, ai_needs_refresh: false })
    .eq('id', id)
    .eq('user_id', userId);
  return { error: error?.message ?? null };
}