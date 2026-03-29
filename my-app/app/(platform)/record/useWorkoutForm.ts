import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { saveWorkout } from './actions'

const DRAFT_KEY = 'naturehood_draft_workout'

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
  aiSubmitting: boolean
  error: string | null
  showSuccess: boolean
  aiFormatting: boolean
  draftRestored: boolean
  clearError: () => void

  // Handlers — workoutTypes injected at call time so this hook stays independent of useWorkoutTypes
  handleSubmit: (e: React.FormEvent, workoutTypes: string[]) => Promise<void>
  handleLogWithAI: (workoutTypes: string[], commitPending: () => void) => Promise<void>
  handleSuccessClose: (resetTypes: () => void) => void
}

export function useWorkoutForm(
  // Passed in so the draft save effect can include types without owning them
  workoutTypes: string[]
): UseWorkoutFormReturn {
  const today = new Date().toISOString().split('T')[0]
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [loggedDate, setLoggedDate] = useState(today)
  const [duration, setDuration] = useState('')
  const [workoutLog, setWorkoutLog] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [aiSubmitting, setAiSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [aiFormatting, setAiFormatting] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)

  const isFirstRender = useRef(true)

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.title || draft.workoutLog || draft.workoutTypes?.length) {
          setTitle(draft.title ?? '')
          setLoggedDate(draft.loggedDate ?? today)
          setDuration(draft.duration ?? '')
          setWorkoutLog(draft.workoutLog ?? '')
          setIsPublic(draft.isPublic ?? true)
          setDraftRestored(true)
          // workoutTypes are restored via initialTypes in useWorkoutTypes — handled by RecordForm
        }
      }
    } catch {}
    isFirstRender.current = false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save draft on every change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) return
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

  const handleLogWithAI = async (workoutTypes: string[], commitPending: () => void) => {
    if (!title.trim()) {
      setError('Workout title is required.')
      return
    }
    commitPending()
    setAiSubmitting(true)
    setError(null)

    const result = await saveWorkout(buildFormData(workoutTypes))

    if (result?.error) {
      setError(result.error)
      setAiSubmitting(false)
      return
    }

    if (result.id && workoutLog.trim()) {
      await fetch('/api/ai/format-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: result.id }),
      })
    }

    localStorage.removeItem(DRAFT_KEY)
    router.push(`/record/${result.id}/ai-report`)
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
    aiSubmitting,
    error,
    showSuccess,
    aiFormatting,
    draftRestored,
    clearError,
    handleSubmit,
    handleLogWithAI,
    handleSuccessClose,
  }
}