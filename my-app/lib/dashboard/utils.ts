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
  competition: { label: 'Competition', color: '#FB923C' },
  recovery: { label: 'Recovery', color: '#60A5FA' },
}

export const PAIN_COLOR = '#FF4D4D'

// ── Session performance ───────────────────────

export type PerformanceBand = 'good' | 'average' | 'poor'

export const PERFORMANCE_META: Record<PerformanceBand, { label: string; color: string }> = {
  good: { label: 'Good', color: '#4ADE80' },
  average: { label: 'Average', color: '#FBBF24' },
  poor: { label: 'Poor', color: PAIN_COLOR },
}

const FEEL_SCORE: Record<string, number> = { great: 100, good: 80, tired: 45, sore: 25 }

/** Pain at or above this caps the session at "poor", whatever the athlete's feel. */
const PAIN_POOR = 6

/**
 * 0–100 score from how the athlete felt and the pain they reported. Weighted towards the
 * weaker of the two signals, so a great feel can't hide real pain. Null when neither was logged.
 */
export function performanceScore(
  workout: Pick<DashboardWorkout, 'readiness_feel' | 'readiness_pain_score'>,
): number | null {
  const feel = workout.readiness_feel ? FEEL_SCORE[workout.readiness_feel] : undefined
  const pain = workout.readiness_pain_score
  const parts = [feel, pain == null ? undefined : 100 - pain * 12.5].filter((v): v is number => v != null)
  if (!parts.length) return null

  const score = Math.round(0.6 * Math.min(...parts) + 0.4 * Math.max(...parts))
  return pain != null && pain >= PAIN_POOR ? Math.min(score, 39) : score
}

export function performanceBand(score: number | null): PerformanceBand | null {
  if (score == null) return null
  return score >= 70 ? 'good' : score >= 40 ? 'average' : 'poor'
}

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

export type BodyCheckPeriod = 'week' | 'month'

/** Window length in days for each Body check period. */
export const PERIOD_DAYS: Record<BodyCheckPeriod, number> = { week: 7, month: 30 }

export type BodyCheck = {
  /** Window length in days. */
  days: number
  /** Load over this window ÷ average load per window over the last four (acute:chronic). */
  loadRatio: number | null
  loadStatus: LoadStatus
  minutes: number
  sessions: number
  restDays: number
  /** Mean performance score of rated sessions (see `performanceScore`). */
  avgPerformance: number | null
  avgPerformancePrev: number | null
  ratedSessions: number
}

function average(values: number[]): number | null {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null
}

/** Body check over the last `days` days (today included), compared with the window before it. */
export function bodyCheck(workouts: DashboardWorkout[], today = todayDateKey(), days = 7): BodyCheck {
  const start = shiftDateKey(today, -(days - 1))
  const prevStart = shiftDateKey(today, -(days * 2 - 1))
  const chronicStart = shiftDateKey(today, -(days * 4 - 1))
  const inRange = (w: DashboardWorkout, from: string) => w.logged_date >= from && w.logged_date <= today

  const current = workouts.filter((w) => inRange(w, start))
  const previous = workouts.filter((w) => w.logged_date >= prevStart && w.logged_date < start)
  const chronicWindow = workouts.filter((w) => inRange(w, chronicStart))

  const acute = current.reduce((sum, w) => sum + sessionLoad(w), 0)
  // Average only over windows the athlete has history for, so a short history doesn't read as overload.
  const firstLogged = workouts.reduce((min, w) => (w.logged_date < min ? w.logged_date : min), today)
  let windowsWithHistory = 1
  while (windowsWithHistory < 4 && shiftDateKey(today, -windowsWithHistory * days) >= firstLogged) windowsWithHistory++
  const chronic = chronicWindow.reduce((sum, w) => sum + sessionLoad(w), 0) / windowsWithHistory
  const loadRatio = chronic > 0 ? acute / chronic : null
  const loadStatus: LoadStatus =
    loadRatio == null ? 'none' : loadRatio > 1.3 ? 'high' : loadRatio < 0.8 ? 'light' : 'balanced'

  const scores = (list: DashboardWorkout[]) =>
    list.map(performanceScore).filter((p): p is number => p != null)
  const currentScores = scores(current)

  return {
    days,
    loadRatio,
    loadStatus,
    minutes: current.reduce((sum, w) => sum + (w.duration_minutes ?? 0), 0),
    sessions: current.length,
    restDays: days - new Set(current.map((w) => w.logged_date)).size,
    avgPerformance: average(currentScores),
    avgPerformancePrev: average(scores(previous)),
    ratedSessions: currentScores.length,
  }
}

export function formatMinutes(total: number): string {
  if (total < 60) return `${total}m`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m ? `${h}h ${m}m` : `${h}h`
}
