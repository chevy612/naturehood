'use client'

import { useState, useEffect, useRef, ChangeEvent } from 'react'
import { InputDark, TextAreaDark } from '@/app/components/ui/inputs'
import { X } from 'lucide-react'
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
      <InputDark
        label="Workout Title"
        name="title"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => { setTitle(e.target.value); setError(null) }}
        placeholder="e.g. Push Day, Leg Day"
        required
      />

      <InputDark
        label="Date"
        name="logged_date"
        type="date"
        value={loggedDate}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setLoggedDate(e.target.value)}
      />

      <InputDark
        label="Duration (minutes)"
        name="duration_minutes"
        type="number"
        value={duration}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setDuration(e.target.value)}
        placeholder="e.g. 60"
      />

      {/* Workout Type Labels */}
      <div>
        <p
          className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#6B6870] mb-2"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Workout Type
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {workoutTypes.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-full border border-[#C8F04D] text-[#C8F04D]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {label}
              <button
                type="button"
                onClick={() => removeType(label)}
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label={`Remove ${label}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={typeInput}
          onChange={(e) => setTypeInput(e.target.value)}
          onKeyDown={handleTypeKeyDown}
          onBlur={() => { if (typeInput.trim()) addWorkoutType(typeInput) }}
          placeholder="e.g. Strength, Cardio, Outdoor — press Enter to add"
          className="w-full bg-transparent border-b-2 border-[#3A373C] focus:border-[#C8F04D] outline-none text-white text-[14px] pb-2 placeholder-[#3A373C] transition-colors duration-150"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
        <p
          className="text-[11px] text-[#6B6870] mt-1"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Press Enter or comma to add a label.
        </p>
        {previousTypes.filter((t) => !workoutTypes.includes(t)).length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="text-[11px] text-[#6B6870] shrink-0"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Your labels:
            </span>
            {previousTypes
              .filter((t) => !workoutTypes.includes(t))
              .map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => addWorkoutType(label)}
                  className="px-3 py-1 text-[11px] font-medium rounded-full border border-[#3A373C] text-[#A09EA3] hover:border-[#C8F04D] hover:text-[#C8F04D] transition-colors duration-150"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {label}
                </button>
              ))}
          </div>
        )}
      </div>

      <TextAreaDark
        label="Workout Log"
        name="workout_log"
        value={workoutLog}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setWorkoutLog(e.target.value)}
        placeholder={`Squat 4x8 @ 100kg\nBench Press 3x10 @ 80kg\nDeadlift 3x5 @ 140kg`}
        rows={8}
      />

      {/* Public toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={() => setIsPublic((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
            isPublic ? 'bg-[#C8F04D]' : 'bg-[#3A373C]'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-[#141115] shadow transition-transform duration-200 ${
              isPublic ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
        <span
          className="text-[13px] text-[#6B6870]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {isPublic ? 'Visible to the community' : 'Private — only you can see this'}
        </span>
      </div>

      {error && (
        <p
          className="text-[13px] text-[#FF4D4D]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-[#C8F04D] text-[#141115] px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#b8e038] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {submitting ? 'Saving…' : 'Save Changes'}
        </button>
        <a
          href="/account"
          className="px-6 py-4 text-[11px] font-bold tracking-[0.2em] uppercase text-[#6B6870] hover:text-white border border-[#3A373C] hover:border-[#6B6870] transition-colors duration-200 text-center"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
