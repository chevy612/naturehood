import { supabase } from '../supabase';

export type Profile = {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  role: 'athlete' | 'brand' | 'other';
  avatar_url: string | null;
};

export type AiStructuredWorkout = {
  exercises: { name: string }[];
  estimated_intensity?: 'low' | 'moderate' | 'high';
};

export type WorkoutSummary = {
  id: string;
  title: string;
  logged_date: string;
  duration_minutes: number | null;
  workout_types: string[];
  ai_structured: AiStructuredWorkout | null;
};

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, username, name, bio, role, avatar_url')
    .eq('id', userId)
    .single();
  return data ?? null;
}

export async function fetchWorkouts(userId: string): Promise<WorkoutSummary[]> {
  const { data } = await supabase
    .from('training_logs')
    .select('id, title, logged_date, duration_minutes, workout_types, ai_structured')
    .eq('user_id', userId)
    .order('logged_date', { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function updateProfile(
  profileId: string,
  updates: { name: string; username: string; bio: string | null }
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId);

  if (error?.message?.includes('unique')) return { error: 'Username is already taken.' };
  if (error) return { error: 'Failed to save. Please try again.' };
  return { error: null };
}

export async function uploadAvatar(
  profileId: string,
  uri: string
): Promise<{ avatarUrl: string | null; error: string | null }> {
  const ext = uri.split('.').pop() ?? 'jpg';
  const path = `${profileId}/avatar.${ext}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, blob, { upsert: true, contentType: `image/${ext}` });

  if (uploadError) return { avatarUrl: null, error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', profileId);
  return { avatarUrl, error: null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
