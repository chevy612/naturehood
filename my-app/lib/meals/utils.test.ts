import assert from 'node:assert/strict'
import test from 'node:test'
import {
  dateKey,
  digitsOnly,
  formatDayHeading,
  getWeekRange,
  isValidDateKey,
  mealsForDate,
  mealsForWeek,
  parseNullableNumber,
  parseTarget,
  shiftDateKey,
  startOfDayIso,
  sumMacros,
} from './utils'

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).toISOString()

test('dateKey groups by local calendar day', () => {
  assert.equal(dateKey(at(2026, 10, 15, 0)), '2026-10-15')
  assert.equal(dateKey(at(2026, 10, 15, 23)), '2026-10-15')
})

test('shiftDateKey crosses month and year boundaries', () => {
  assert.equal(shiftDateKey('2026-10-01', -1), '2026-09-30')
  assert.equal(shiftDateKey('2026-12-31', 1), '2027-01-01')
})

test('isValidDateKey rejects malformed and impossible dates', () => {
  assert.equal(isValidDateKey('2026-10-15'), true)
  assert.equal(isValidDateKey('2026-02-30'), false)
  assert.equal(isValidDateKey('15-10-2026'), false)
  assert.equal(isValidDateKey(null), false)
})

test('startOfDayIso is local midnight', () => {
  const start = new Date(startOfDayIso('2026-10-15'))
  assert.equal(start.getHours(), 0)
  assert.equal(dateKey(start.toISOString()), '2026-10-15')
})

test('getWeekRange runs Monday to Sunday', () => {
  assert.deepEqual(getWeekRange('2026-10-15'), { start: '2026-10-12', end: '2026-10-18' })
  assert.deepEqual(getWeekRange('2026-10-18'), { start: '2026-10-12', end: '2026-10-18' })
  assert.deepEqual(getWeekRange('2026-10-12'), { start: '2026-10-12', end: '2026-10-18' })
})

test('mealsForDate and mealsForWeek filter by local day', () => {
  const meals = [
    { created_at: at(2026, 10, 15) },
    { created_at: at(2026, 10, 14) },
    { created_at: at(2026, 10, 11) },
  ]
  assert.equal(mealsForDate(meals, '2026-10-15').length, 1)
  assert.equal(mealsForWeek(meals, '2026-10-15').length, 2)
})

test('sumMacros ignores missing values', () => {
  assert.deepEqual(
    sumMacros([
      { calories: 400, protein: 30, carbs: null, fat: 10 },
      { calories: null, protein: 5, carbs: 20, fat: null },
    ]),
    { calories: 400, protein: 35, carbs: 20, fat: 10 },
  )
})

test('numeric input helpers match the mobile form rules', () => {
  assert.equal(digitsOnly('12a3.4-5678'), '123456')
  assert.equal(parseNullableNumber(''), null)
  assert.equal(parseNullableNumber('450'), 450)
  assert.equal(parseTarget('0'), null)
  assert.equal(parseTarget('2000'), 2000)
})

test('formatDayHeading labels today and yesterday', () => {
  const now = new Date(2026, 9, 15, 12)
  assert.equal(formatDayHeading('2026-10-15', now), 'Today, October 15')
  assert.equal(formatDayHeading('2026-10-14', now), 'Yesterday, October 14')
  assert.equal(formatDayHeading('2026-10-12', now), 'Mon, October 12')
})
