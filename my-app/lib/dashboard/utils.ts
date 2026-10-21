import type { PerceivedIntensity, SessionType } from '@/lib/types'
import { getWeekRange, shiftDateKey, todayDateKey } from '@/lib/meals/utils'

// ─────────────────────────────────────────────
// PERSONAL DASHBOARD — data shapes + derived stats
//   Workouts are keyed by `logged_date` (already a local YYYY-MM-DD).
//   Meals are keyed by the local day of `created_at` (see lib/meals/utils `dateKey`).
// ─────────────────────────────────────────────

export type DashboardWorkout = {
  id: string
  title: string
  logged_date: string
  duration_minutes: number | null
  session_type: SessionType | null
  perceived_intensity: PerceivedIntensity | null
  readiness_feel: string | null
  readiness_pain_score: number | null
}

/** Calendar groups session types into three colours so a month reads at a glance. */
export type WorkoutCategory = 'training' | 'competition' | 'recovery'

const RECOVERY_TYPES: ReadonlySet<SessionType> = new Set(['physio', 'rehab', 'prehab', 'recovery'])

export function workoutCategory(type: SessionType | null): WorkoutCategory {
  if (type === 'competition') return 'competition'
  if (type && RECOVERY_TYPES.has(type)) return 'recovery'
  return 'training'
}

export const CATEGORY_META: Record<WorkoutCategory, { label: string; color: string }> = {
  training: { label: 'Training', color: '#F5F5F5' },
  competition: { label: 'Competition', color: '#FBBF24' },
  recovery: { label: 'Recovery', color: '#60A5FA' },
}

export const MEAL_COLOR = '#4ADE80'
export const PAIN_COLOR = '#FF4D4D'

/** Pain score at or above this flags a day on the calendar. */
export const PAIN_FLAG = 3

const INTENSITY_WEIGHT: Record<PerceivedIntensity, number> = { low: 1, moderate: 2, high: 3, max: 4 }

/** Session load = minutes × intensity weight (a simple sRPE-style proxy). Unknown intensity counts as moderate. */
export function sessionLoad(workout: Pick<DashboardWorkout, 'duration_minutes' | 'perceived_intensity'>): number {
  const minutes = workout.duration_minutes ?? 0
  return minutes * (workout.perceived_intensity ? INTENSITY_WEIGHT[workout.perceived_intensity] : 2)
}

export function groupByDate<T>(items: T[], keyOf: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const key = keyOf(item)
    const list = map.get(key)
    if (list) list.push(item)
    else map.set(key, [item])
  }
  return map
}

// ── Month helpers ─────────────────────────────

const pad = (value: number) => String(value).padStart(2, '0')

/** `YYYY-MM` of a date key. */
export const monthOf = (key: string) => key.slice(0, 7)

export const firstOfMonth = (month: string) => `${month}-01`

export function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number)
  const date = new Date(year, m - 1 + delta, 1)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

export function daysInMonth(month: string): number {
  const [year, m] = month.split('-').map(Number)
  return new Date(year, m, 0).getDate()
}

/** Monday-first weeks covering `month`, each a list of 7 date keys (edges spill into adjacent months). */
export function monthWeeks(month: string): string[][] {
  const last = `${month}-${pad(daysInMonth(month))}`
  const weeks: string[][] = []
  let cursor = getWeekRange(firstOfMonth(month)).start
  while (cursor <= last) {
    const week: string[] = []
    for (let i = 0; i < 7; i++) week.push(shiftDateKey(cursor, i))
    weeks.push(week)
    cursor = shiftDateKey(cursor, 7)
  }
  return weeks
}

// ── Derived stats ─────────────────────────────

/** Consecutive Mon–Sun weeks (ending this week, or last week if this one is still empty) with ≥1 session. */
export function weeklyStreak(trainedDays: ReadonlySet<string>, today = todayDateKey()): number {
  const hasSession = (weekStart: string) => {
    for (let i = 0; i < 7; i++) if (trainedDays.has(shiftDateKey(weekStart, i))) return true
    return false
  }
  let weekStart = getWeekRange(today).start
  if (!hasSession(weekStart)) weekStart = shiftDateKey(weekStart, -7)
  let streak = 0
  while (hasSession(weekStart)) {
    streak++
    weekStart = shiftDateKey(weekStart, -7)
  }
  return streak
}

export type LoadStatus = 'none' | 'light' | 'balanced' | 'high'

export type BodyCheck = {
  /** Load over the last 7 days ÷ average weekly load over the last 28 days (acute:chronic). */
  loadRatio: number | null
  loadStatus: LoadStatus
  acuteMinutes: number
  sessions7d: number
  restDays7d: number
  avgPain7d: number | null
  avgPainPrev7d: number | null
  latestFeel: string | null
  latestFeelDate: string | null
}

function average(values: number[]): number | null {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null
}

export function bodyCheck(workouts: DashboardWorkout[], today = todayDateKey()): BodyCheck {
  const start7 = shiftDateKey(today, -6)
  const start14 = shiftDateKey(today, -13)
  const start28 = shiftDateKey(today, -27)
  const inRange = (w: DashboardWorkout, from: string) => w.logged_date >= from && w.logged_date <= today

  const last7 = workouts.filter((w) => inRange(w, start7))
  const prev7 = workouts.filter((w) => w.logged_date >= start14 && w.logged_date < start7)
  const last28 = workouts.filter((w) => inRange(w, start28))

  const acute = last7.reduce((sum, w) => sum + sessionLoad(w), 0)
  const chronicWeekly = last28.reduce((sum, w) => sum + sessionLoad(w), 0) / 4
  const loadRatio = chronicWeekly > 0 ? acute / chronicWeekly : null
  const loadStatus: LoadStatus =
    loadRatio == null ? 'none' : loadRatio > 1.3 ? 'high' : loadRatio < 0.8 ? 'light' : 'balanced'

  const pains = (list: DashboardWorkout[]) =>
    list.map((w) => w.readiness_pain_score).filter((p): p is number => p != null)

  const latestWithFeel = [...last7]
    .filter((w) => w.readiness_feel)
    .sort((a, b) => b.logged_date.localeCompare(a.logged_date))[0]

  return {
    loadRatio,
    loadStatus,
    acuteMinutes: last7.reduce((sum, w) => sum + (w.duration_minutes ?? 0), 0),
    sessions7d: last7.length,
    restDays7d: 7 - new Set(last7.map((w) => w.logged_date)).size,
    avgPain7d: average(pains(last7)),
    avgPainPrev7d: average(pains(prev7)),
    latestFeel: latestWithFeel?.readiness_feel ?? null,
    latestFeelDate: latestWithFeel?.logged_date ?? null,
  }
}

export function formatMinutes(total: number): string {
  if (total < 60) return `${total}m`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m ? `${h}h ${m}m` : `${h}h`
}
