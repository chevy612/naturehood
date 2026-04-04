// ── Meal type enum ───────────────────────────────────────────────────────────

export const MEAL_TYPES = [
  'BREAKFAST',
  'BRUNCH',
  'LUNCH',
  'TEA',
  'DINNER',
  'SNACK',
  'DRINK',
] as const;

export type MealType = (typeof MEAL_TYPES)[number];

/** Human-readable label for each meal type */
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Breakfast',
  BRUNCH: 'Brunch',
  LUNCH: 'Lunch',
  TEA: 'Tea',
  DINNER: 'Dinner',
  SNACK: 'Snack',
  DRINK: 'Drink',
};

/** Badge color per meal type */
export const MEAL_TYPE_COLORS: Record<MealType, string> = {
  BREAKFAST: '#F5A623',
  BRUNCH: '#E8913A',
  LUNCH: '#4A90D9',
  TEA: '#7ED321',
  DINNER: '#BD10E0',
  SNACK: '#F8E71C',
  DRINK: '#50E3C2',
};

// ── Meal record shape (mirrors meal_records table in Supabase) ────────────────

export type MealRecord = {
  meal_id: string;
  user_id: string;
  title: string | null;
  weight: number | null; // in grams
  calories: number | null;
  protein: number | null; // in grams
  meal_type: MealType | null;
  user_notes: string | null;
  ai_analysis: AiFoodAnalysis | null;
  s3_link: string | null;
  created_at: string;
  updated_at: string;
};

// ── AI food-analysis response schema ─────────────────────────────────────────

export type AiFoodMacros = {
  /** Protein in grams */
  p: number;
  /** Carbs in grams */
  c: number;
  /** Fat in grams */
  f: number;
};

export type AiFoodBreakdownItem = {
  item: string;
  estimated_weight_g: number;
  calories: number;
  macros: AiFoodMacros;
  /** Brief explanation of how the estimate was made */
  logic: string;
};

export type AiFoodMealSummary = {
  detected_items_count: number;
  total_calories_range: { min: number; max: number };
  /** 0.0 – 1.0 */
  confidence_score: number;
};

export type AiFoodAnalysisData = {
  meal_summary: AiFoodMealSummary;
  breakdown: AiFoodBreakdownItem[];
  preparation_assumptions: string[];
};

export type AiFoodAnalysis = {
  /** Populated when food is detected; empty object `{}` when no food found */
  data: AiFoodAnalysisData | Record<string, never>;
  /** Human-readable summary string */
  description: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Type-guard: returns true when the AI actually detected food items */
export function hasAiFoodData(
  data: AiFoodAnalysisData | Record<string, never>
): data is AiFoodAnalysisData {
  return 'meal_summary' in data && 'breakdown' in data;
}
