import { File } from 'expo-file-system';
import { supabase } from '../supabase';
import type { MealRecord, AiFoodAnalysis } from '../types/meal';

// ── Fetch meal history ───────────────────────────────────────────────────────

export async function fetchMealHistory(
  userId: string
): Promise<{ data: MealRecord[]; error: string | null }> {
  const { data, error } = await supabase
    .from('meal_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[meal] fetchMealHistory failed:', error.message);
    return { data: [], error: error.message };
  }

  return { data: (data as MealRecord[]) ?? [], error: null };
}

// ── Create a new meal record ─────────────────────────────────────────────────

type CreateMealInput = {
  meal_id: string;
  user_id: string;
  title: string;
  weight?: number | null;
  calories?: number | null;
  user_notes?: string | null;
  s3_link: string;
};

export async function createMealRecord(input: CreateMealInput): Promise<{ error: string | null }> {
  const now = new Date().toISOString();

  const { error } = await supabase.from('meal_records').insert({
    meal_id: input.meal_id,
    user_id: input.user_id,
    title: input.title || null,
    weight: input.weight ?? null,
    calories: input.calories ?? null,
    user_notes: input.user_notes ?? null,
    ai_analysis: null,
    s3_link: input.s3_link,
    created_at: now,
    modified_at: now,
  });

  if (error) {
    console.error('[meal] createMealRecord failed:', error.message);
    return { error: error.message };
  }

  return { error: null };
}

// ── Update an existing meal record ───────────────────────────────────────────

type UpdateMealInput = {
  title?: string | null;
  calories?: number | null;
  weight?: number | null;
  user_notes?: string | null;
  ai_analysis?: AiFoodAnalysis | null;
};

export async function updateMealRecord(
  mealId: string,
  userId: string,
  updates: UpdateMealInput
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('meal_records')
    .update({
      ...updates,
      modified_at: new Date().toISOString(),
    })
    .eq('meal_id', mealId)
    .eq('user_id', userId);

  if (error) {
    console.error('[meal] updateMealRecord failed:', error.message);
    return { error: error.message };
  }

  return { error: null };
}

// ── Upload food image to Supabase Storage ────────────────────────────────────

/**
 * Uploads a food image to Supabase Storage (public bucket).
 * Uses expo-file-system to read the local file — `fetch()` cannot read
 * local `file://` URIs returned by expo-image-picker on iOS/Android.
 */
export async function uploadFoodImage(
  userId: string,
  imageUri: string
): Promise<{ url: string | null; error: string | null }> {
  // Strip query params before extracting extension (camera URIs can have ?params)
  const cleanUri = imageUri.split('?')[0];
  const ext = cleanUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const timestamp = Date.now();
  const path = `${userId}/${timestamp}.${ext}`;
  const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

  // Read the local file using expo-file-system (works with file:// URIs)
  const file = new File(imageUri);
  const bytes = await file.bytes();

  const { error: uploadError } = await supabase.storage
    .from('food_images')
    .upload(path, bytes, {
      upsert: false,
      contentType,
    });

  if (uploadError) {
    console.error('[meal] uploadFoodImage failed:', uploadError.message);
    return { url: null, error: uploadError.message };
  }

  // Build the public URL
  const { data: urlData } = supabase.storage
    .from('food_images')
    .getPublicUrl(path);

  return { url: urlData.publicUrl, error: null };
}
