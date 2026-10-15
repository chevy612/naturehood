'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { AiAnalysisToggle, MealFormFields } from '@/app/components/platform/meals/MealFormFields'
import { MealPhotoField } from '@/app/components/platform/meals/MealPhotoField'
import { createMeal, validateMealForm } from '@/lib/meals/browser'
import { startMealAnalysis } from '@/lib/meals/analysis-store'
import { EMPTY_MEAL_FORM, type MealFormValues } from '@/lib/meals/types'
import { sans } from '@/lib/social/format'

export function NewMealForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [values, setValues] = useState<MealFormValues>(EMPTY_MEAL_FORM)
  const [photo, setPhoto] = useState<File | null>(null)
  const [analyzeWithAI, setAnalyzeWithAI] = useState(false)
  const [titleError, setTitleError] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function patchValues(patch: Partial<MealFormValues>) {
    setValues((current) => ({ ...current, ...patch }))
    if (patch.title?.trim()) setTitleError(undefined)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (saving) return
    const problems = validateMealForm(values)
    if (problems.title) {
      setTitleError(problems.title)
      document.getElementById('meal-title')?.focus()
      return
    }

    setSaving(true)
    setError(null)
    try {
      const { mealId, imageUrl } = await createMeal({ userId, values, photo })
      if (analyzeWithAI && imageUrl) startMealAnalysis(mealId)
      router.push('/meals')
      router.refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the meal.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#141115] px-4 py-6 sm:px-6">
      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            aria-label="Close"
            disabled={saving}
            onClick={() => router.push('/meals')}
            className="text-white disabled:opacity-40"
          >
            <X size={22} />
          </button>
          <h1 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white" style={sans}>Log your meal</h1>
          <span className="w-[22px]" aria-hidden />
        </div>

        <fieldset disabled={saving} className="min-w-0 space-y-6 border-0 p-0">
          <MealPhotoField file={photo} onChange={(next) => {
            setPhoto(next)
            if (!next) setAnalyzeWithAI(false)
          }} disabled={saving} />
          <MealFormFields
            values={values}
            onChange={patchValues}
            titleError={titleError}
            macroPlaceholder="Optional - AI can estimate this"
          />
          <AiAnalysisToggle
            checked={analyzeWithAI}
            disabled={!photo || saving}
            onChange={setAnalyzeWithAI}
            hint={photo ? 'Estimates calories and macros from your photo after saving.' : 'Add a photo to enable AI analysis.'}
          />
        </fieldset>

        {error ? (
          <p className="mt-6 rounded-xl border border-[#FF4D4D]/40 bg-[#FF4D4D]/10 px-4 py-3 text-[13px] text-[#FF4D4D]" style={sans} role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="mt-8 h-[52px] w-full rounded-full bg-[#F5F5F5] text-[12px] font-bold uppercase tracking-[0.16em] text-[#141115] hover:bg-white disabled:opacity-50"
          style={sans}
        >
          {saving ? 'Saving…' : 'Save record'}
        </button>
      </form>
    </div>
  )
}
