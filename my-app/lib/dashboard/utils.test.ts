import assert from 'node:assert/strict'
import test from 'node:test'
import {
  averageDailyProtein,
  loadHistory,
  monthSummary,
  readinessBand,
  readinessScore,
  type DashboardWorkout,
} from './utils'

const workout = (overrides: Partial<DashboardWorkout>): DashboardWorkout => ({
  id: crypto.randomUUID(),
  title: 'Session',
  logged_date: '2026-10-20',
  duration_minutes: 60,
  session_type: 'strength',
  perceived_intensity: 'moderate',
  readiness_feel: null,
  readiness_pain_score: null,
  ...overrides,
})

test('readinessScore caps sessions with real pain at "low"', () => {
  assert.equal(readinessBand(readinessScore({ readiness_feel: 'great', readiness_pain_score: 0 })), 'high')
  assert.equal(readinessBand(readinessScore({ readiness_feel: 'great', readiness_pain_score: 6 })), 'low')
  assert.equal(readinessScore({ readiness_feel: null, readiness_pain_score: null }), null)
})

test('monthSummary counts the session mix, time and pain flags for one month', () => {
  const summary = monthSummary(
    [
      workout({ session_type: 'strength', readiness_pain_score: 3 }),
      workout({ session_type: 'competition', duration_minutes: 90 }),
      workout({ session_type: 'recovery', duration_minutes: null, readiness_pain_score: 2 }),
      workout({ logged_date: '2026-09-30', readiness_pain_score: 8 }),
    ],
    '2026-10',
  )
  assert.deepEqual(summary, {
    sessions: 3,
    byCategory: { training: 1, competition: 1, recovery: 1 },
    minutes: 150,
    painFlags: 1,
  })
})

test('averageDailyProtein averages over days that have meals', () => {
  const at = (d: number, h: number) => new Date(2026, 9, d, h).toISOString()
  assert.equal(
    averageDailyProtein([
      { created_at: at(20, 8), protein: 30 },
      { created_at: at(20, 19), protein: 50 },
      { created_at: at(21, 12), protein: null },
      { created_at: at(22, 12), protein: 40 },
    ]),
    40,
  )
  assert.equal(averageDailyProtein([]), null)
})

test('loadHistory buckets load into rolling windows, oldest first', () => {
  const loads = loadHistory(
    [
      workout({ logged_date: '2026-10-22', perceived_intensity: 'high' }), // this week: 60 × 3
      workout({ logged_date: '2026-10-15' }), // 1 week ago: 60 × 2
      workout({ logged_date: '2026-10-01', perceived_intensity: 'low' }), // 3 weeks ago: 60 × 1
    ],
    '2026-10-22',
    7,
    4,
  )
  assert.deepEqual(loads, [60, 0, 120, 180])
})
