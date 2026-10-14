export const POST_TYPE = {
  WORKOUT_LOG: 'WORKOUT_LOG',
  NORMAL_POST: 'NORMAL_POST',
  MEAL_LOG: 'MEAL_LOG',
} as const

export const MEAL_TYPES = [
  'BREAKFAST',
  'BRUNCH',
  'LUNCH',
  'TEA',
  'DINNER',
  'SNACK',
  'DRINK',
] as const

export type MealType = (typeof MEAL_TYPES)[number]

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Breakfast',
  BRUNCH: 'Brunch',
  LUNCH: 'Lunch',
  TEA: 'Tea',
  DINNER: 'Dinner',
  SNACK: 'Snack',
  DRINK: 'Drink',
}

export type WorkoutPostRecord = {
  id: string
  title: string
  logged_date: string
  duration_minutes: number | null
  workout_types: string[]
  workout_log: string | null
}

export type WorkoutLogPostPayload = {
  version: 1
  kind: 'workout_log'
  userText: string
  workout: WorkoutPostRecord
}

export type MealPostRecord = {
  id: string
  title: string | null
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  meal_type: MealType | null
  image_url: string | null
  notes: string | null
}

export type MealLogPostPayload = {
  version: 1
  kind: 'meal_log'
  userText: string
  meal: MealPostRecord
}

export type PostRecordAttachment =
  | { kind: 'workout'; workout: WorkoutPostRecord }
  | { kind: 'meal'; meal: MealPostRecord }

type UnknownRecord = Record<string, unknown>

function toStringOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toDurationMinutes(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null
  return Math.round(value)
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null
  return value
}

function toMealTypeOrNull(value: unknown): MealType | null {
  if (typeof value === 'string' && (MEAL_TYPES as readonly string[]).includes(value)) {
    return value as MealType
  }
  return null
}

function toWorkoutPostRecord(value: UnknownRecord): WorkoutPostRecord | null {
  const id = toStringOrNull(value.id)
  const title = toStringOrNull(value.title)
  const loggedDate = toStringOrNull(value.logged_date)
  if (!id || !title || !loggedDate) return null
  return {
    id,
    title,
    logged_date: loggedDate,
    duration_minutes: toDurationMinutes(value.duration_minutes),
    workout_types: toStringList(value.workout_types),
    workout_log: toStringOrNull(value.workout_log),
  }
}

function toMealPostRecord(value: UnknownRecord): MealPostRecord | null {
  const id = toStringOrNull(value.id) ?? toStringOrNull(value.meal_id) ?? toStringOrNull(value.mealId)
  if (!id) return null
  return {
    id,
    title: toStringOrNull(value.title),
    calories: toNumberOrNull(value.calories),
    protein: toNumberOrNull(value.protein),
    carbs: toNumberOrNull(value.carbs),
    fat: toNumberOrNull(value.fat),
    meal_type: toMealTypeOrNull(value.meal_type ?? value.mealType),
    image_url: toStringOrNull(value.image_url) ?? toStringOrNull(value.imageUrl) ?? toStringOrNull(value.s3_link),
    notes: toStringOrNull(value.notes) ?? toStringOrNull(value.user_notes),
  }
}

export function serializeWorkoutLogPostPayload(payload: WorkoutLogPostPayload): string {
  return JSON.stringify(payload)
}

export function serializeMealLogPostPayload(payload: MealLogPostPayload): string {
  return JSON.stringify(payload)
}

export function parseWorkoutLogPostPayload(content: string | undefined | null): WorkoutLogPostPayload | null {
  if (!content) return null
  try {
    const parsed = JSON.parse(content) as UnknownRecord
    if (parsed.kind === 'workout_log') {
      const workoutRaw = parsed.workout && typeof parsed.workout === 'object' ? parsed.workout as UnknownRecord : null
      if (!workoutRaw) return null
      const workout = toWorkoutPostRecord(workoutRaw)
      if (!workout) return null
      return {
        version: 1,
        kind: 'workout_log',
        userText: toStringOrNull(parsed.userText) ?? '',
        workout,
      }
    }
    const legacyWorkout = toWorkoutPostRecord(parsed)
    if (!legacyWorkout) return null
    return {
      version: 1,
      kind: 'workout_log',
      userText: toStringOrNull(parsed.userText) ?? toStringOrNull(parsed.caption) ?? '',
      workout: legacyWorkout,
    }
  } catch {
    return null
  }
}

export function parseMealLogPostPayload(content: string | undefined | null): MealLogPostPayload | null {
  if (!content) return null
  try {
    const parsed = JSON.parse(content) as UnknownRecord
    if (parsed.kind === 'meal_log') {
      const mealRaw = parsed.meal && typeof parsed.meal === 'object' ? parsed.meal as UnknownRecord : null
      if (!mealRaw) return null
      const meal = toMealPostRecord(mealRaw)
      if (!meal) return null
      return {
        version: 1,
        kind: 'meal_log',
        userText: toStringOrNull(parsed.userText) ?? '',
        meal,
      }
    }
    const legacyMeal = toMealPostRecord(parsed)
    if (!legacyMeal) return null
    return {
      version: 1,
      kind: 'meal_log',
      userText: toStringOrNull(parsed.userText) ?? toStringOrNull(parsed.caption) ?? '',
      meal: legacyMeal,
    }
  } catch {
    return null
  }
}

export type PostBody = {
  text: string
  workout: WorkoutPostRecord | null
  meal: MealPostRecord | null
  images: string[]
}

export function readPostBody(input: {
  content?: string | null
  contentType?: string | null
  images?: string[] | null
}): PostBody {
  const images = input.images ?? []
  if (input.contentType === POST_TYPE.WORKOUT_LOG) {
    const payload = parseWorkoutLogPostPayload(input.content)
    return { text: payload?.userText ?? '', workout: payload?.workout ?? null, meal: null, images }
  }
  if (input.contentType === POST_TYPE.MEAL_LOG) {
    const payload = parseMealLogPostPayload(input.content)
    const meal = payload?.meal
      ? { ...payload.meal, image_url: payload.meal.image_url ?? images[0] ?? null }
      : null
    const displayImages = meal?.image_url ? images.filter((image) => image !== meal.image_url) : images
    return { text: payload?.userText ?? '', workout: null, meal, images: displayImages }
  }
  return { text: input.content?.trim() ? input.content : '', workout: null, meal: null, images }
}

export function workoutShareSearch(workout: WorkoutPostRecord): string {
  const params = new URLSearchParams({
    workoutId: workout.id,
    workoutTitle: workout.title,
    workoutLoggedDate: workout.logged_date,
    workoutDurationMinutes: workout.duration_minutes != null ? String(workout.duration_minutes) : '',
    workoutTypes: workout.workout_types.join('||'),
    workoutLog: workout.workout_log ?? '',
  })
  return params.toString()
}

export function attachmentFromSearchParams(params: URLSearchParams): PostRecordAttachment | null {
  const workoutId = params.get('workoutId')
  const workoutTitle = params.get('workoutTitle')
  const workoutLoggedDate = params.get('workoutLoggedDate')
  if (workoutId && workoutTitle && workoutLoggedDate) {
    const durationValue = Number(params.get('workoutDurationMinutes') ?? '')
    return {
      kind: 'workout',
      workout: {
        id: workoutId,
        title: workoutTitle,
        logged_date: workoutLoggedDate,
        duration_minutes: Number.isFinite(durationValue) ? durationValue : null,
        workout_types: (params.get('workoutTypes') ?? '').split('||').map((value) => value.trim()).filter(Boolean),
        workout_log: params.get('workoutLog') || null,
      },
    }
  }

  const mealId = params.get('mealId')
  if (!mealId) return null
  const mealType = toMealTypeOrNull(params.get('mealType'))
  const numberOrNull = (key: string) => {
    const raw = params.get(key)
    if (!raw?.trim()) return null
    const parsed = Number(raw)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
  }
  return {
    kind: 'meal',
    meal: {
      id: mealId,
      title: params.get('mealTitle')?.trim() || null,
      calories: numberOrNull('mealCalories'),
      protein: numberOrNull('mealProtein'),
      carbs: numberOrNull('mealCarbs'),
      fat: numberOrNull('mealFat'),
      meal_type: mealType,
      image_url: params.get('mealImageUrl')?.trim() || null,
      notes: params.get('mealNotes')?.trim() || null,
    },
  }
}
