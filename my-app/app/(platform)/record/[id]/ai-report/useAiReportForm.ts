import { useState } from 'react'
import { updateAiStructured } from '../../actions'
import { isV2, extractExercises, type SessionMode } from './aiReportHelpers'
import type { TrainingLog, AiStructuredExercise, AiStructuredWorkout } from '@/lib/types'

export interface UseAiReportFormReturn {
  mode: SessionMode
  setMode: (mode: SessionMode) => void
  exercises: AiStructuredExercise[]
  setExercises: React.Dispatch<React.SetStateAction<AiStructuredExercise[]>>
  summary: string
  setSummary: (v: string) => void
  saving: boolean
  error: string | null
  updateExercise: (index: number, updated: AiStructuredExercise) => void
  deleteExercise: (index: number) => void
  handleConfirm: () => Promise<void>
}

export function useAiReportForm(workout: TrainingLog): UseAiReportFormReturn {
  const ai = workout.ai_structured

  const initialMode: SessionMode = (() => {
    if (isV2(ai)) {
      if (ai.session_type === 'sprint') return 'sprint'
      if (ai.session_type === 'competition') return 'competition'
      if (['conditioning', 'recovery', 'mixed'].includes(ai.session_type)) return 'conditioning'
      return 'strength'
    }
    const types = (workout as Record<string, unknown>)['workout_types'] as string[] | undefined
    if (types?.some((t) => /sprint|speed|track/i.test(t))) return 'sprint'
    if (types?.some((t) => /competition|race|event|comp/i.test(t))) return 'competition'
    if (types?.some((t) => /cardio|conditioning|endurance|run|cycle|swim/i.test(t))) return 'conditioning'
    return 'strength'
  })()

  const initialSummary = (() => {
    if (!ai) return ''
    if (isV2(ai)) return ai.summary?.session_notes ?? ''
    return (ai as AiStructuredWorkout).summary ?? ''
  })()

  const [mode, setMode] = useState<SessionMode>(initialMode)
  const [exercises, setExercises] = useState<AiStructuredExercise[]>(() => extractExercises(ai))
  const [summary, setSummary] = useState(initialSummary)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateExercise = (index: number, updated: AiStructuredExercise) =>
    setExercises((prev) => prev.map((ex, i) => (i === index ? updated : ex)))

  const deleteExercise = (index: number) =>
    setExercises((prev) => prev.filter((_, i) => i !== index))

  const handleConfirm = async () => {
    setSaving(true)
    setError(null)
    const structured: AiStructuredWorkout = {
      exercises,
      summary: summary || undefined,
    }
    const result = await updateAiStructured(workout.id, structured)
    if (result?.error) {
      setError(result.error)
      setSaving(false)
    }
  }

  return {
    mode, setMode,
    exercises, setExercises,
    summary, setSummary,
    saving, error,
    updateExercise, deleteExercise, handleConfirm,
  }
}
