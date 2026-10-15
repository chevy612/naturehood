import type { MealListItem, NutritionTargets } from '@/lib/meals/types'

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const pad = (value: number) => String(value).padStart(2, '0')

function keyFromDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Local calendar day (YYYY-MM-DD) of an ISO timestamp, matching how the mobile app groups meals. */
export function dateKey(iso: string): string {
  return keyFromDate(new Date(iso))
}

/** ISO timestamp for local midnight at the start of `key`, used to bound `created_at` queries. */
export function startOfDayIso(key: string): string {
  return dateFromKey(key).toISOString()
}

export function todayDateKey(now: Date = new Date()): string {
  return keyFromDate(now)
}

export function shiftDateKey(key: string, days: number): string {
  const date = dateFromKey(key)
  date.setDate(date.getDate() + days)
  return keyFromDate(date)
}

export function isFutureDate(key: string, now: Date = new Date()): boolean {
  return key > todayDateKey(now)
}

export function isValidDateKey(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return keyFromDate(dateFromKey(value)) === value
}

export function monthNameForKey(key: string): string {
  const [, month] = key.split('-').map(Number)
  return MONTH_NAMES[month - 1] ?? ''
}

export function weekdayForKey(key: string): (typeof DAY_NAMES)[number] {
  return DAY_NAMES[dateFromKey(key).getDay()]
}

export function formatDayHeading(key: string, now: Date = new Date()): string {
  const today = todayDateKey(now)
  const date = dateFromKey(key)
  const label = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`
  if (key === today) return `Today, ${label}`
  if (key === shiftDateKey(today, -1)) return `Yesterday, ${label}`
  return `${weekdayForKey(key)}, ${label}`
}

export function formatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  let hours = date.getHours()
  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${hours}:${pad(date.getMinutes())} ${period}`
}

export function mealsForDate<T extends Pick<MealListItem, 'created_at'>>(meals: T[], key: string): T[] {
  return meals.filter((meal) => dateKey(meal.created_at) === key)
}

/** Monday-to-Sunday range containing `key`, matching the mobile weekly summary. */
export function getWeekRange(key: string): { start: string; end: string } {
  const date = dateFromKey(key)
  const dayOfWeek = date.getDay()
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(date)
  monday.setDate(date.getDate() + daysToMonday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: keyFromDate(monday), end: keyFromDate(sunday) }
}

export function mealsForWeek<T extends Pick<MealListItem, 'created_at'>>(meals: T[], key: string): T[] {
  const { start, end } = getWeekRange(key)
  return meals.filter((meal) => {
    const mealKey = dateKey(meal.created_at)
    return mealKey >= start && mealKey <= end
  })
}

export type MacroTotals = { calories: number; protein: number; carbs: number; fat: number }

export function sumMacros(meals: Pick<MealListItem, 'calories' | 'protein' | 'carbs' | 'fat'>[]): MacroTotals {
  const totals: MacroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  for (const meal of meals) {
    if (meal.calories != null) totals.calories += meal.calories
    if (meal.protein != null) totals.protein += meal.protein
    if (meal.carbs != null) totals.carbs += meal.carbs
    if (meal.fat != null) totals.fat += meal.fat
  }
  return totals
}

export const EMPTY_TARGETS: NutritionTargets = { calories: null, protein: null, carbs: null, fat: null }

export function parseTarget(value: string): number | null {
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) || parsed <= 0 ? null : parsed
}

/** Digits only, capped like the mobile numeric inputs. */
export function digitsOnly(value: string, maxLength = 6): string {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

export function parseNullableNumber(value: string): number | null {
  if (!value) return null
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? null : parsed
}

export function numberToField(value: number | null | undefined): string {
  return value == null ? '' : String(Math.round(value))
}
