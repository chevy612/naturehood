'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/app/components/ui/buttons'
import { WorkoutFormFields } from '../../WorkoutFormFields'
import { updateWorkout } from '../../actions'

// ─────────────────────────────────────────────
// EDIT FORM
// Same layout as RecordForm but pre-populated.
// ─────────────────────────────────────────────

interface Props {
  id: string
  initialTitle: string
  initialDate: string
  initialDuration: string
  initialWorkoutTypes: string[]
  initialWorkoutLog: string
  initialIsPublic: boolean
  previousTypes?: string[]
}

export default function EditForm({
  id,
  initialTitle,
  initialDate,
  initialDuration,
  initialWorkoutTypes,
  initialWorkoutLog,
  initialIsPublic,
  previousTypes = [],
}: Props) {
  const draftKey = `naturehood_draft_edit_${id}`

  const [title, setTitle] = useState(initialTitle)
  const [loggedDate, setLoggedDate] = useState(initialDate)
  const [duration, setDuration] = useState(initialDuration)
  const [workoutTypes, setWorkoutTypes] = useState<string[]>(initialWorkoutTypes)
  const [typeInput, setTypeInput] = useState('')
  const [workoutLog, setWorkoutLog] = useState(initialWorkoutLog)
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isFirstRender = useRef(true)

  // Load any in-progress edit draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const draft = JSON.parse(raw)
        setTitle(draft.title ?? initialTitle)
        setLoggedDate(draft.loggedDate ?? initialDate)
        setDuration(draft.duration ?? initialDuration)
        setWorkoutTypes(draft.workoutTypes ?? initialWorkoutTypes)
        setWorkoutLog(draft.workoutLog ?? initialWorkoutLog)
        setIsPublic(draft.isPublic ?? initialIsPublic)
      }
    } catch {}
    isFirstRender.current = false
  }, [])

  // Persist edit draft
  useEffect(() => {
    if (isFirstRender.current) return
    localStorage.setItem(draftKey, JSON.stringify({ title, loggedDate, duration, workoutTypes, workoutLog, isPublic }))
  }, [title, loggedDate, duration, workoutTypes, workoutLog, isPublic])

  const addWorkoutType = (value: string) => {
    const trimmed = value.trim()
    if (trimmed && !workoutTypes.includes(trimmed)) {
      setWorkoutTypes((prev) => [...prev, trimmed])
    }
    setTypeInput('')
  }

  const handleTypeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addWorkoutType(typeInput)
    }
    if (e.key === 'Backspace' && typeInput === '' && workoutTypes.length > 0) {
      setWorkoutTypes((prev) => prev.slice(0, -1))
    }
  }

  const removeType = (label: string) => {
    setWorkoutTypes((prev) => prev.filter((t) => t !== label))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (typeInput.trim()) addWorkoutType(typeInput)
    setSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.set('title', title)
    formData.set('logged_date', loggedDate)
    formData.set('duration_minutes', duration)
    formData.set('workout_types', JSON.stringify(workoutTypes))
    formData.set('workout_log', workoutLog)
    formData.set('is_public', String(isPublic))

    const result = await updateWorkout(id, formData)

    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      localStorage.removeItem(draftKey)
      // updateWorkout redirects to /account on success
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <WorkoutFormFields
        title={title}
        loggedDate={loggedDate}
        duration={duration}
        workoutLog={workoutLog}
        isPublic={isPublic}
        onTitleChange={(v) => { setTitle(v); setError(null) }}
        onDateChange={setLoggedDate}
        onDurationChange={setDuration}
        onWorkoutLogChange={setWorkoutLog}
        onIsPublicChange={setIsPublic}
        workoutTypes={workoutTypes}
        typeInput={typeInput}
        onTypeInputChange={setTypeInput}
        onTypeKeyDown={handleTypeKeyDown}
        onTypeBlur={() => { if (typeInput.trim()) addWorkoutType(typeInput) }}
        onRemoveType={removeType}
        onAddType={addWorkoutType}
        previousTypes={previousTypes}
      />

      {error && (
        <p
          className="text-[13px] text-[#FF4D4D]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" className="flex-1" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save changes'}
        </Button>
        <Button href="/account" variant="outline" size="lg">
          Cancel
        </Button>
      </div>
    </form>
  )
}
