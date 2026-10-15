import type { MealType } from '@/lib/social/post-content'

export { MEAL_TYPES, MEAL_TYPE_LABELS, type MealType } from '@/lib/social/post-content'

export type AiFoodMacros = {
  p: number
  c: number
  f: number
}

export type AiFoodBreakdownItem = {
  item: string
  estimated_weight_g: number
  calories: number
  protein?: number
  macros: AiFoodMacros
  logic: string
}

export type AiFoodMealSummary = {
  detected_items_count: number
  total_calories_range: { min: number; max: number }
  total_protein?: number
  confidence_score: number
}

export type AiFoodAnalysisData = {
  meal_summary: AiFoodMealSummary
  breakdown: AiFoodBreakdownItem[]
  preparation_assumptions: string[]
}

export type AiFoodAnalysis = {
  data: AiFoodAnalysisData | Record<string, never>
  description: string
}

export function hasAiFoodData(
  data: AiFoodAnalysis['data'] | null | undefined,
): data is AiFoodAnalysisData {
  return !!data && typeof data === 'object' && 'meal_summary' in data && 'breakdown' in data
}

/** Columns the history list needs. `ai_analysis` is large and only read on the detail page. */
export type MealListItem = {
  meal_id: string
  user_id: string
  title: string | null
  weight: number | null
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  meal_type: MealType | null
  user_notes: string | null
  s3_link: string | null
  created_at: string
  updated_at: string | null
}

export type MealRecord = MealListItem & {
  ai_analysis: AiFoodAnalysis | null
}

export type MealFormValues = {
  title: string
  calories: string
  protein: string
  carbs: string
  fat: string
  mealType: MealType | null
  notes: string
}

export const EMPTY_MEAL_FORM: MealFormValues = {
  title: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  mealType: null,
  notes: '',
}

export const MEAL_LIMITS = {
  title: 100,
  notes: 400,
  numberDigits: 6,
  imageBytes: 20 * 1024 * 1024,
} as const

export type NutritionTargets = {
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}

export type NutritionTargetsState = {
  daily: NutritionTargets
  weekly: NutritionTargets
}
