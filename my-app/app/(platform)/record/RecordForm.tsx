'use client'

import { useState, ChangeEvent } from 'react'
import { InputDark, TextAreaDark } from '@/app/components/ui/inputs'
import { SuccessModal } from '@/app/components/ui/notification'
import { saveWorkout } from './actions'

// ─────────────────────────────────────────────
// RECORD FORM
// ─────────────────────────────────────────────

export default function RecordForm() {
  const today = new Date().toISOString().split('T')[0]

  const [title, setTitle] = useState('')
  const [loggedDate, setLoggedDate] = useState(today)
  const [duration, setDuration] = useState('')
  const [workoutLog, setWorkoutLog] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.set('title', title)
    formData.set('logged_date', loggedDate)
    formData.set('duration_minutes', duration)
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
    setTitle('')
    setLoggedDate(today)
    setDuration('')
    setWorkoutLog('')
    setIsPublic(true)
  }

  return (
    <>
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
