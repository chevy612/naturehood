'use client'

import { createClient } from '@/lib/supabase/client'
import { compressImageForUpload } from '@/lib/meals/image'
import { insertMealRecord, uploadImages } from '@/lib/social/browser'
import { MEAL_LIMITS, type MealFormValues, type MealListItem } from '@/lib/meals/types'
import { parseNullableNumber, startOfDayIso } from '@/lib/meals/utils'

const LIST_COLUMNS =
  'meal_id, user_id, title, weight, calories, protein, carbs, fat, meal_type, user_notes, s3_link, created_at, updated_at'

/**
 * Meals have no logged-date column, so a day is a `created_at` range in the viewer's
 * local time. The `meal_records` SELECT policy is open to all users, so every read is
 * scoped to the signed-in user here, as the mobile app does. Range is [fromKey, toKeyExclusive).
 */
export async function fetchMealsInRange(
  userId: string,
  fromKey: string,
  toKeyExclusive: string,
): Promise<MealListItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('meal_records')
    .select(LIST_COLUMNS)
    .eq('user_id', userId)
    .gte('created_at', startOfDayIso(fromKey))
    .lt('created_at', startOfDayIso(toKeyExclusive))
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as MealListItem[]
}

/**
 * The most recent meals for a user, newest first. Used by the account page's Meals
 * tab, which lists meals as a simple feed rather than scoping to a single day.
 */
export async function fetchRecentMeals(userId: string, limit = 60): Promise<MealListItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('meal_records')
    .select(LIST_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []) as MealListItem[]
}

export async function countMeals(userId: string): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('meal_records')
    .select('meal_id', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  return count ?? 0
}

export function validateMealPhoto(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Choose an image file.'
  if (file.size > MEAL_LIMITS.imageBytes) return 'Photos must be 20 MB or smaller.'
  return null
}

export function validateMealForm(values: MealFormValues): { title?: string } {
  if (!values.title.trim()) return { title: 'Meal title is required' }
  return {}
}

export async function uploadMealPhoto(userId: string, file: File): Promise<string> {
  const compressed = await compressImageForUpload(file)
  const { urls, error } = await uploadImages('food_images', userId, [compressed])
  if (error || !urls[0]) throw new Error(error ?? 'Could not upload the meal photo.')
  return urls[0]
}

export async function createMeal(input: {
  userId: string
  values: MealFormValues
  photo: File | null
}): Promise<{ mealId: string; imageUrl: string | null }> {
  const { userId, values, photo } = input
  const imageUrl = photo ? await uploadMealPhoto(userId, photo) : null
  const mealId = crypto.randomUUID()
  await insertMealRecord({
    mealId,
    userId,
    title: values.title.trim(),
    calories: parseNullableNumber(values.calories),
    protein: parseNullableNumber(values.protein),
    carbs: parseNullableNumber(values.carbs),
    fat: parseNullableNumber(values.fat),
    mealType: values.mealType,
    notes: values.notes.trim() || null,
    imageUrl,
  })
  return { mealId, imageUrl }
}

export async function updateMeal(input: {
  mealId: string
  userId: string
  values: MealFormValues
}): Promise<void> {
  const { mealId, userId, values } = input
  const supabase = createClient()
  const { data, error } = await supabase
    .from('meal_records')
    .update({
      title: values.title.trim(),
      calories: parseNullableNumber(values.calories),
      protein: parseNullableNumber(values.protein),
      carbs: parseNullableNumber(values.carbs),
      fat: parseNullableNumber(values.fat),
      meal_type: values.mealType,
      user_notes: values.notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('meal_id', mealId)
    .eq('user_id', userId)
    .select('meal_id')
  if (error) throw new Error(error.message)
  if (!data?.length) throw new Error('Meal not found.')
}

/**
 * Removes the meal record. The photo stays in storage because feed posts that
 * attached this meal embed a snapshot that links to the same file.
 */
export async function deleteMeal(input: { mealId: string; userId: string }): Promise<void> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('meal_records')
    .delete()
    .eq('meal_id', input.mealId)
    .eq('user_id', input.userId)
    .select('meal_id')
  if (error) throw new Error(error.message)
  if (!data?.length) throw new Error('Meal not found.')
}
