import { supabase } from '../supabase';

export type WorkoutInput = {
  user_id: string;
  title: string;
  logged_date: string;
  duration_minutes: number | null;
  workout_log: string | null;
  workout_types: string[];
  is_public: boolean;
};

export async function saveWorkout(input: WorkoutInput): Promise<{ error: string | null }> {
  const { error } = await supabase.from('training_logs').insert(input);
  return { error: error?.message ?? null };
}

export async function fetchRecentTypes(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('training_logs')
    .select('workout_types')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!data) return [];
  const all = data.flatMap(r => r.workout_types ?? []);
  return [...new Set(all)];
}
