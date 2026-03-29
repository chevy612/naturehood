import { useState } from 'react'

export interface UseWorkoutTypesReturn {
  workoutTypes: string[]
  typeInput: string
  setTypeInput: (v: string) => void
  addWorkoutType: (value: string) => void
  removeType: (label: string) => void
  handleTypeKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handleTypeBlur: () => void
  commitPendingType: () => void
  reset: () => void
}

export function useWorkoutTypes(initialTypes: string[] = []): UseWorkoutTypesReturn {
  const [workoutTypes, setWorkoutTypes] = useState<string[]>(initialTypes)
  const [typeInput, setTypeInput] = useState('')

  const addWorkoutType = (value: string) => {
    const trimmed = value.trim()
    if (trimmed && !workoutTypes.includes(trimmed)) {
      setWorkoutTypes((prev) => [...prev, trimmed])
    }
    setTypeInput('')
  }

  const removeType = (label: string) => {
    setWorkoutTypes((prev) => prev.filter((t) => t !== label))
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

  const handleTypeBlur = () => {
    if (typeInput.trim()) addWorkoutType(typeInput)
  }

  const commitPendingType = () => {
    if (typeInput.trim()) addWorkoutType(typeInput)
  }

  const reset = () => {
    setWorkoutTypes([])
    setTypeInput('')
  }

  return {
    workoutTypes,
    typeInput,
    setTypeInput,
    addWorkoutType,
    removeType,
    handleTypeKeyDown,
    handleTypeBlur,
    commitPendingType,
    reset,
  }
}
