import { supabase } from '../supabase';

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

export type WorkoutDetail = {
  id: string;
  title: string;
  logged_date: string;
  duration_minutes: number | null;
  workout_types: string[];
  workout_log: string | null;
  is_public: boolean;
  ai_structured: AiStructuredWorkout | null;
  ai_formatted_at: string | null;
};

export async function fetchWorkout(id: string): Promise<WorkoutDetail | null> {
  const { data } = await supabase
    .from('training_logs')
    .select('id, title, logged_date, duration_minutes, workout_types, workout_log, is_public, ai_structured, ai_formatted_at')
    .eq('id', id)
    .single();
  return data ?? null;
}

export async function analyzeWithAI(
  workoutId: string,
  accessToken: string
): Promise<{ error: string | null }> {
  const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
  const res = await fetch(`${apiBase}/api/ai/format-workout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ id: workoutId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body?.error ?? 'AI analysis failed' };
  }
  return { error: null };
}

export async function updateAiStructured(
  id: string,
  userId: string,
  data: AiStructuredWorkout
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('training_logs')
    .update({ ai_structured: data })
    .eq('id', id)
    .eq('user_id', userId);
  return { error: error?.message ?? null };
}
