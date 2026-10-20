'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'
import { MealFormFields } from '@/app/components/platform/meals/MealFormFields'
import { LogoSpinner } from '@/app/components/ui/logo-spinner'
import { deleteMeal, updateMeal, validateMealForm } from '@/lib/meals/browser'
import { useAnalysisCompletedCount, useAnalyzingMealIds } from '@/lib/meals/analysis-store'
import {
  hasAiFoodData,
  type AiFoodAnalysis,
  type AiFoodAnalysisData,
  type MealFormValues,
  type MealRecord,
} from '@/lib/meals/types'
import { dateKey, formatTime, numberToField, weekdayForKey } from '@/lib/meals/utils'
import { sans } from '@/lib/social/format'

const SECTION_LABEL = { fontFamily: "'Sk Modernist', sans-serif" } as const

function parseAnalysis(raw: unknown): AiFoodAnalysis | null {
  if (!raw) return null
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as AiFoodAnalysis
    } catch {
      return null
    }
  }
  return raw as AiFoodAnalysis
}

function valuesFromMeal(meal: MealRecord): MealFormValues {
  return {
    title: meal.title ?? '',
    calories: numberToField(meal.calories),
    protein: numberToField(meal.protein),
    carbs: numberToField(meal.carbs),
    fat: numberToField(meal.fat),
    mealType: meal.meal_type,
    notes: meal.user_notes ?? '',
  }
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label="Meal photo" onClick={onClose}>
      <button type="button" aria-label="Close photo" onClick={onClose} className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white">
        <X size={20} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Meal" className="max-h-full max-w-full object-contain" onClick={(event) => event.stopPropagation()} />
    </div>
  )
}

function AiBreakdown({ data }: { data: AiFoodAnalysisData }) {
  const items = data.breakdown ?? []
  const assumptions = data.preparation_assumptions ?? []
  return (
    <>
      {items.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-[11px] uppercase tracking-[0.04em] text-[#6B6870]" style={SECTION_LABEL}>Nutritional breakdown</h2>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={`${item.item}-${index}`} className="rounded-lg border border-[#3A373C] bg-[#1E1B1F] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 flex-1 text-[14px] font-medium text-white" style={sans}>{item.item}</p>
                  <p className="shrink-0 text-[14px] font-semibold text-[#4ADE80]" style={sans}>{item.calories} kcal</p>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-[#A09EA3]" style={sans}>
                  {item.estimated_weight_g}g | Protein: {item.protein ?? item.macros.p}g | Carbs: {item.macros.c}g | Fat: {item.macros.f}g
                </p>
                <p className="mt-1 text-[12px] italic text-[#6B6870]" style={sans}>{item.logic}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {assumptions.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-3 text-[11px] uppercase tracking-[0.04em] text-[#6B6870]" style={SECTION_LABEL}>Assumptions</h2>
          <ul className="space-y-1.5">
            {assumptions.map((assumption, index) => (
              <li key={index} className="text-[12px] text-[#A09EA3]" style={sans}>{assumption}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  )
}

export function MealEditor({ meal, userId, readOnly = false }: { meal: MealRecord; userId?: string; readOnly?: boolean }) {
  const router = useRouter()
  const initial = useMemo(() => valuesFromMeal(meal), [meal])
  const [values, setValues] = useState<MealFormValues>(initial)
  const [titleError, setTitleError] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const analyzingIds = useAnalyzingMealIds()
  const completedCount = useAnalysisCompletedCount()
  const isAnalyzing = analyzingIds.has(meal.meal_id)
  const seenCompleted = useRef(completedCount)

  useEffect(() => {
    if (readOnly || completedCount === seenCompleted.current) return
    seenCompleted.current = completedCount
    router.refresh()
  }, [completedCount, readOnly, router])

  const analysis = useMemo(() => parseAnalysis(meal.ai_analysis), [meal.ai_analysis])
  const aiData = analysis?.data && hasAiFoodData(analysis.data) ? analysis.data : null
  const noFood = !!analysis && !aiData
  const confidence = aiData?.meal_summary?.confidence_score

  const isDirty = (Object.keys(initial) as (keyof MealFormValues)[]).some((key) => values[key] !== initial[key])
  const busy = saving || deleting || isAnalyzing
  const backHref = `/meals?date=${dateKey(meal.created_at)}`

  function patchValues(patch: Partial<MealFormValues>) {
    setValues((current) => ({ ...current, ...patch }))
    if (patch.title?.trim()) setTitleError(undefined)
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    if (!isDirty) {
      router.push(backHref)
      return
    }
    const problems = validateMealForm(values)
    if (problems.title) {
      setTitleError(problems.title)
      document.getElementById('meal-title')?.focus()
      return
    }
    if (!userId) return
    setSaving(true)
    setError(null)
    try {
      await updateMeal({ mealId: meal.meal_id, userId, values })
      router.push(backHref)
      router.refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save changes. Please try again.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!userId) return
    setDeleting(true)
    setError(null)
    try {
      await deleteMeal({ mealId: meal.meal_id, userId })
      router.push(backHref)
      router.refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete the meal.')
      setDeleting(false)
    }
  }

  const key = dateKey(meal.created_at)

  const shellClass = readOnly ? '' : 'min-h-screen bg-[#141115] px-4 py-6 sm:px-6'
  const formClass = readOnly ? '' : 'mx-auto max-w-2xl'

  return (
    <div className={shellClass}>
      <form onSubmit={readOnly ? (event) => event.preventDefault() : handleSave} noValidate className={formClass}>
        {readOnly ? null : (
          <div className="mb-6 flex items-center justify-between">
            <Link href={backHref} aria-label="Back to meals" className="text-white">
              <ArrowLeft size={22} />
            </Link>
            <h1 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white" style={sans}>Meal summary</h1>
            <span className="w-[22px]" aria-hidden />
          </div>
        )}

        <p className="mb-4 text-[12px] text-[#6B6870]" style={sans}>
          Logged {weekdayForKey(key)}, {key} at {formatTime(meal.created_at)}
        </p>

        {!readOnly && isAnalyzing ? (
          <div role="status" className="mb-4 flex items-center gap-2 rounded-lg border border-[#3A373C] bg-[#1E1B1F] px-4 py-2.5">
            <LogoSpinner size={32} />
            <span className="text-[13px] text-[#A09EA3]" style={sans}>Analyzing your meal… This page will update when it finishes.</span>
          </div>
        ) : null}

        {meal.s3_link ? (
          <button type="button" aria-label="View meal photo" onClick={() => setViewerOpen(true)} className="block w-full overflow-hidden rounded-xl border border-[#3A373C]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={meal.s3_link} alt="Meal" className="h-60 w-full object-cover" />
          </button>
        ) : null}
        {viewerOpen && meal.s3_link ? <Lightbox src={meal.s3_link} onClose={() => setViewerOpen(false)} /> : null}

        {noFood ? (
          <p role="status" className="mt-3 rounded-lg border border-[#FF4D4D] bg-[#FF4D4D]/10 p-4 text-[13px] text-[#FF4D4D]" style={sans}>
            {readOnly ? 'No food was detected in the image.' : 'No food was detected in the image. You can still edit the fields below manually.'}
          </p>
        ) : null}

        {confidence !== undefined ? (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-[#3A373C] bg-[#1E1B1F] px-4 py-2.5">
            <span className="text-[12px] font-medium text-[#6B6870]" style={sans}>AI correctness confidence</span>
            <span className="text-[14px] font-semibold text-[#4ADE80]" style={sans}>{Math.round(confidence * 100)}%</span>
          </div>
        ) : null}

        <fieldset disabled={busy} className="mt-6 min-w-0 border-0 p-0">
          <MealFormFields values={values} onChange={patchValues} titleError={titleError} macroPlaceholder="e.g. 450" idPrefix="meal" readOnly={readOnly} />
        </fieldset>

        {aiData ? <AiBreakdown data={aiData} /> : null}

        {error ? (
          <p className="mt-6 rounded-xl border border-[#FF4D4D]/40 bg-[#FF4D4D]/10 px-4 py-3 text-[13px] text-[#FF4D4D]" style={sans} role="alert">
            {error}
          </p>
        ) : null}

        {readOnly ? null : (
          <div className="mt-8 space-y-4">
            <button
              type="submit"
              disabled={busy}
              className="h-[52px] w-full rounded-full bg-[#F5F5F5] text-[12px] font-bold uppercase tracking-[0.16em] text-[#141115] hover:bg-white disabled:opacity-50"
              style={sans}
            >
              {saving ? 'Saving…' : isDirty ? 'Save changes' : 'Done'}
            </button>

            <div className="border-t border-[#3A373C] pt-4">
              {!confirmDelete ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirmDelete(true)}
                  className="w-full rounded-full border border-[#3A373C] py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B6870] transition-colors hover:border-[#FF4D4D]/40 hover:text-[#FF4D4D] disabled:opacity-40"
                  style={sans}
                >
                  Delete meal
                </button>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3" role="alertdialog" aria-label="Confirm delete">
                  <span className="text-[13px] text-[#FF4D4D]" style={sans}>Delete this meal? This can&apos;t be undone.</span>
                  <span className="flex items-center gap-4">
                    <button type="button" onClick={handleDelete} disabled={deleting} className="text-[13px] font-semibold text-[#FF4D4D] hover:text-white disabled:opacity-50" style={sans}>
                      {deleting ? 'Deleting…' : 'Yes, delete'}
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(false)} disabled={deleting} className="text-[13px] text-[#6B6870] hover:text-white" style={sans}>
                      Cancel
                    </button>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
