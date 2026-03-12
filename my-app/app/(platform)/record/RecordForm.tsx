'use client'

import { useState, useEffect, useRef, ChangeEvent } from 'react'
import { InputDark, TextAreaDark } from '@/app/components/ui/inputs'
import { SuccessModal } from '@/app/components/ui/notification'
import { X } from 'lucide-react'
import { saveWorkout } from './actions'

const DRAFT_KEY = 'naturehood_draft_workout'

interface Draft {
  title: string
  loggedDate: string
  duration: string
  workoutTypes: string[]
  workoutLog: string
  isPublic: boolean
}

// ─────────────────────────────────────────────
// RECORD FORM
// ─────────────────────────────────────────────

export default function RecordForm({ previousTypes = [] }: { previousTypes?: string[] }) {
  const today = new Date().toISOString().split('T')[0]

  const [title, setTitle] = useState('')
  const [loggedDate, setLoggedDate] = useState(today)
  const [duration, setDuration] = useState('')
  const [workoutTypes, setWorkoutTypes] = useState<string[]>([])
  const [typeInput, setTypeInput] = useState('')
  const [workoutLog, setWorkoutLog] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const isFirstRender = useRef(true)

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const draft: Draft = JSON.parse(raw)
        if (draft.title || draft.workoutLog || draft.workoutTypes?.length) {
          setTitle(draft.title ?? '')
          setLoggedDate(draft.loggedDate ?? today)
          setDuration(draft.duration ?? '')
          setWorkoutTypes(draft.workoutTypes ?? [])
          setWorkoutLog(draft.workoutLog ?? '')
          setIsPublic(draft.isPublic ?? true)
          setDraftRestored(true)
        }
      }
    } catch {}
    isFirstRender.current = false
  }, [])

  // Save draft to localStorage on every change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) return
    const draft: Draft = { title, loggedDate, duration, workoutTypes, workoutLog, isPublic }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
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
    // Commit any pending type input
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

    const result = await saveWorkout(formData)

    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      setShowSuccess(true)
      setSubmitting(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    localStorage.removeItem(DRAFT_KEY)
    setTitle('')
    setLoggedDate(today)
    setDuration('')
    setWorkoutTypes([])
    setTypeInput('')
    setWorkoutLog('')
    setIsPublic(true)
    setDraftRestored(false)
  }

  return (
    <>
      {draftRestored && (
        <p
          className="text-[12px] text-[#A09EA3] mb-4"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Draft restored — your unsaved workout was recovered.
        </p>
      )}

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
            Press Enter or comma to add a label. You can create any label you want.
          </p>
          {/* Previous label suggestions */}
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#C8F04D] text-[#141115] px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#b8e038] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {submitting ? 'Saving…' : 'Log Workout'}
        </button>
      </form>

      {showSuccess && (
        <SuccessModal
          variant="dark"
          title="Workout logged!"
          message="Your workout has been saved. Keep it up."
          onClose={handleSuccessClose}
        />
      )}
    </>
  )
}
