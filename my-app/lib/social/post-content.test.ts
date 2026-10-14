import assert from 'node:assert/strict'
import test from 'node:test'
import {
  attachmentFromSearchParams,
  parseCommentRecordsPayload,
  parseMealLogPostPayload,
  parseWorkoutLogPostPayload,
  readPostBody,
  serializeCommentRecordsPayload,
  serializeMealLogPostPayload,
  serializeWorkoutLogPostPayload,
} from './post-content'

test('workout payload round-trips and accepts the legacy shape', () => {
  const serialized = serializeWorkoutLogPostPayload({
    version: 1,
    kind: 'workout_log',
    userText: 'felt strong',
    workout: {
      id: 'w1',
      title: 'Push Day',
      logged_date: '2026-10-14',
      duration_minutes: 45,
      workout_types: ['Strength'],
      workout_log: 'Bench 5x5',
    },
  })
  const parsed = parseWorkoutLogPostPayload(serialized)
  assert.equal(parsed?.userText, 'felt strong')
  assert.equal(parsed?.workout.title, 'Push Day')

  const legacy = parseWorkoutLogPostPayload(JSON.stringify({
    id: 'w2',
    title: 'Run',
    logged_date: '2026-10-01',
    duration_minutes: 30,
    workout_types: [],
    caption: 'easy',
  }))
  assert.equal(legacy?.userText, 'easy')
  assert.equal(legacy?.workout.id, 'w2')
})

test('meal payload round-trips meal fields used by the composer', () => {
  const serialized = serializeMealLogPostPayload({
    version: 1,
    kind: 'meal_log',
    userText: 'lunch',
    meal: {
      id: 'm1',
      title: 'Rice bowl',
      calories: 640,
      protein: 32,
      carbs: 70,
      fat: 18,
      meal_type: 'LUNCH',
      image_url: 'https://example.com/meal.jpg',
      notes: 'extra chicken',
    },
  })
  const parsed = parseMealLogPostPayload(serialized)
  assert.equal(parsed?.meal.title, 'Rice bowl')
  assert.equal(parsed?.meal.meal_type, 'LUNCH')
  assert.equal(parsed?.meal.carbs, 70)
})

test('a comment can carry both a meal and a workout', () => {
  const serialized = serializeCommentRecordsPayload({
    version: 1,
    kind: 'comment_records',
    userText: 'both',
    meal: {
      id: 'm1',
      title: 'Bowl',
      calories: 10,
      protein: 2,
      carbs: null,
      fat: null,
      meal_type: 'LUNCH',
      image_url: null,
      notes: null,
    },
    workout: {
      id: 'w1',
      title: 'Push',
      logged_date: '2026-10-14',
      duration_minutes: 20,
      workout_types: [],
      workout_log: null,
    },
  })
  const parsed = parseCommentRecordsPayload(serialized)
  assert.equal(parsed?.meal?.title, 'Bowl')
  assert.equal(parsed?.workout?.title, 'Push')
  const body = readPostBody({ content: serialized, contentType: 'COMMENT_RECORDS', images: [] })
  assert.equal(body.text, 'both')
  assert.equal(body.meal?.id, 'm1')
  assert.equal(body.workout?.id, 'w1')
})

test('search params rebuild a workout attachment the same way mobile does', () => {
  const params = new URLSearchParams({
    workoutId: 'w1',
    workoutTitle: 'Push Day',
    workoutLoggedDate: '2026-10-14',
    workoutDurationMinutes: '50',
    workoutTypes: 'Strength||Outdoor',
    workoutLog: 'notes',
  })
  const attachment = attachmentFromSearchParams(params)
  assert.equal(attachment?.kind, 'workout')
  if (attachment?.kind === 'workout') {
    assert.deepEqual(attachment.workout.workout_types, ['Strength', 'Outdoor'])
    assert.equal(attachment.workout.duration_minutes, 50)
  }
})
