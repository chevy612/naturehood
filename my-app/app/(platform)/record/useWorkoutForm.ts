import { useState, useEffect } from 'react'
import { saveWorkout } from './actions'
import { workoutShareSearch, type WorkoutPostRecord } from '@/lib/social/post-content'
import { todayDateKey } from '@/lib/meals/utils'

const DRAFT_KEY = 'naturehood_draft_workout'

type StoredDraft = Partial<WorkoutFields> & { workoutTypes?: string[] }

/** The saved draft, or null when there is none worth restoring. */
function readDraft(): StoredDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const draft: StoredDraft = JSON.parse(raw)
    return draft.title || draft.workoutLog || draft.workoutTypes?.length ? draft : null
  } catch {
    return null
  }
}

export interface WorkoutFields {
  title: string
  loggedDate: string
  duration: string
  workoutLog: string
  isPublic: boolean
}

export interface UseWorkoutFormReturn {
  // Field state
  fields: WorkoutFields
  setTitle: (v: string) => void
  setLoggedDate: (v: string) => void
  setDuration: (v: string) => void
  setWorkoutLog: (v: string) => void
  setIsPublic: (v: boolean) => void

  // UI status state
  submitting: boolean
  error: string | null
  showSuccess: boolean
  aiFormatting: boolean
  draftRestored: boolean
  shareHref: string | null
  clearError: () => void

  // Handlers — workoutTypes injected at call time so this hook stays independent of useWorkoutTypes
  handleSubmit: (e: React.FormEvent, workoutTypes: string[]) => Promise<void>
  handleSuccessClose: (resetTypes: () => void) => void
}

export function useWorkoutForm(
  // Passed in so the draft save effect can include types without owning them
  workoutTypes: string[]
): UseWorkoutFormReturn {
  // Local day, not UTC — `toISOString()` gives yesterday's date before 8am in Hong Kong.
  const today = todayDateKey()

  // The Log page renders client-only (see RecordForm), so the draft can be read while state is
  // created. Loading it in an effect raced the save effect below and could blank the stored draft.
  const [draft] = useState(readDraft)

  const [title, setTitle] = useState(draft?.title ?? '')
  const [loggedDate, setLoggedDate] = useState(draft?.loggedDate ?? today)
  const [duration, setDuration] = useState(draft?.duration ?? '')
  const [workoutLog, setWorkoutLog] = useState(draft?.workoutLog ?? '')
  const [isPublic, setIsPublic] = useState(draft?.isPublic ?? true)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [aiFormatting, setAiFormatting] = useState(false)
  // workoutTypes are restored via initialTypes in useWorkoutTypes — handled by RecordForm
  const [draftRestored, setDraftRestored] = useState(draft != null)
  const [shareHref, setShareHref] = useState<string | null>(null)

  // Save draft on every change
  useEffect(() => {
    const draft = { title, loggedDate, duration, workoutTypes, workoutLog, isPublic }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [title, loggedDate, duration, workoutTypes, workoutLog, isPublic])

  const clearError = () => setError(null)

  const buildFormData = (workoutTypes: string[]) => {
    const fd = new FormData()
    fd.set('title', title)
    fd.set('logged_date', loggedDate)
    fd.set('duration_minutes', duration)
    fd.set('workout_types', JSON.stringify(workoutTypes))
    fd.set('workout_log', workoutLog)
    fd.set('is_public', String(isPublic))
    return fd
  }

  const handleSubmit = async (e: React.FormEvent, workoutTypes: string[]) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const result = await saveWorkout(buildFormData(workoutTypes))

    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setShowSuccess(true)
    if (result.id && isPublic) {
      const durationValue = duration ? parseInt(duration, 10) : null
      const workout: WorkoutPostRecord = {
        id: result.id,
        title: title.trim(),
        logged_date: loggedDate,
        duration_minutes: durationValue && !Number.isNaN(durationValue) ? durationValue : null,
        workout_types: workoutTypes,
        workout_log: workoutLog.trim() || null,
      }
      setShareHref(`/home/new?${workoutShareSearch(workout)}`)
    } else {
      setShareHref(null)
    }

    // Fire AI formatting in background — non-blocking
    if (result.id && workoutLog.trim()) {
      setAiFormatting(true)
      fetch('/api/ai/format-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: result.id }),
      }).finally(() => setAiFormatting(false))
    }
  }

  const handleSuccessClose = (resetTypes: () => void) => {
    setShowSuccess(false)
    localStorage.removeItem(DRAFT_KEY)
    setTitle('')
    setLoggedDate(today)
    setDuration('')
    setWorkoutLog('')
    setIsPublic(true)
    setDraftRestored(false)
    setShareHref(null)
    resetTypes()
  }

  return {
    fields: { title, loggedDate, duration, workoutLog, isPublic },
    setTitle,
    setLoggedDate,
    setDuration,
    setWorkoutLog,
    setIsPublic,
    submitting,
    error,
    showSuccess,
    aiFormatting,
    draftRestored,
    shareHref,
    clearError,
    handleSubmit,
    handleSuccessClose,
  }
}