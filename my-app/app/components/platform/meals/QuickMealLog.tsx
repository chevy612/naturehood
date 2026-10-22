'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { ChevronDown, ScanBarcode, X } from 'lucide-react'
import { BarcodeScannerModal } from '@/app/components/platform/meals/BarcodeScannerModal'
import { MealTypeChips } from '@/app/components/platform/meals/MealFormFields'
import { MealPhotoField } from '@/app/components/platform/meals/MealPhotoField'
import { startMealAnalysis } from '@/lib/meals/analysis-store'
import { nutritionForGrams, productTitle, type BarcodeProduct } from '@/lib/meals/barcode'
import { createMeal, validateMealForm } from '@/lib/meals/browser'
import { EMPTY_MEAL_FORM, MEAL_LIMITS, type MealFormValues, type MealType } from '@/lib/meals/types'
import { digitsOnly, numberToField } from '@/lib/meals/utils'
import { display, sans } from '@/lib/social/format'

// ─────────────────────────────────────────────
// QUICK MEAL LOG
//   The Meals page opens straight onto this composer, so tapping Meals in the nav is
//   enough to start logging. Photo + title + meal type are the fast path; macros and
//   notes sit behind "Add details"; "Scan barcode" fills them from a packaged food's label. Mirrors mobile `LogMealModal`: a meal is logged
//   "now", and AI photo analysis always runs in the background after saving (no toggle,
//   same as workout logging).
// ─────────────────────────────────────────────

const noopSubscribe = () => () => {}

/** Meal type that fits the viewer's local time, so most logs need no tap. */
function mealTypeForHour(hour: number): MealType {
  if (hour >= 5 && hour < 10) return 'BREAKFAST'
  if (hour >= 10 && hour < 11.5) return 'BRUNCH'
  if (hour >= 11.5 && hour < 14.5) return 'LUNCH'
  if (hour >= 14.5 && hour < 17) return 'TEA'
  if (hour >= 17 && hour < 21.5) return 'DINNER'
  return 'SNACK'
}

function currentMealType(): MealType {
  const now = new Date()
  return mealTypeForHour(now.getHours() + now.getMinutes() / 60)
}

const MACROS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
] as const

export function QuickMealLog({
  userId,
  onLogged,
  focusOnDesktop = false,
}: {
  userId: string
  /** Called after the meal is saved so the list can refetch and jump to today. */
  onLogged: () => void
  /** Put the cursor in the title on wide screens (not phones, where it would pop the keyboard). */
  focusOnDesktop?: boolean
}) {
  const [values, setValues] = useState<MealFormValues>(EMPTY_MEAL_FORM)
  const [mealTypeTouched, setMealTypeTouched] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [titleError, setTitleError] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justLogged, setJustLogged] = useState<string | null>(null)
  const [scanOpen, setScanOpen] = useState(false)
  const [scanned, setScanned] = useState<{ product: BarcodeProduct; grams: string } | null>(null)

  // Null while server-rendering: the time-of-day suggestion is only known in the browser.
  const suggestedType = useSyncExternalStore(noopSubscribe, currentMealType, () => null)
  const mealType = mealTypeTouched ? values.mealType : suggestedType

  useEffect(() => {
    if (!focusOnDesktop || !window.matchMedia('(min-width: 768px)').matches) return
    // Next frame: on a client-side nav the router settles focus after this effect runs.
    const frame = requestAnimationFrame(() => document.getElementById('quick-meal-title')?.focus())
    return () => cancelAnimationFrame(frame)
  }, [focusOnDesktop])

  function patch(next: Partial<MealFormValues>) {
    setValues((current) => ({ ...current, ...next }))
    if (next.title?.trim()) setTitleError(undefined)
    setJustLogged(null)
  }

  /** Fills the macros from the scanned label, scaled to the amount eaten. */
  function applyScanned(product: BarcodeProduct, grams: string) {
    const amount = parseFloat(grams)
    const nutrition = nutritionForGrams(product.per100g, Number.isFinite(amount) ? amount : 0)
    patch({
      calories: numberToField(nutrition.calories),
      protein: numberToField(nutrition.protein),
      carbs: numberToField(nutrition.carbs),
      fat: numberToField(nutrition.fat),
    })
    setScanned({ product, grams })
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (saving) return
    const toSave = { ...values, mealType }
    const problems = validateMealForm(toSave)
    if (problems.title) {
      setTitleError(problems.title)
      document.getElementById('quick-meal-title')?.focus()
      return
    }

    setSaving(true)
    setError(null)
    try {
      const { mealId, imageUrl } = await createMeal({ userId, values: toSave, photo })
      if (imageUrl) startMealAnalysis(mealId)
      setValues(EMPTY_MEAL_FORM)
      setMealTypeTouched(false)
      setPhoto(null)
      setShowDetails(false)
      setScanned(null)
      setJustLogged(toSave.title.trim())
      onLogged()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the meal.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        onKeyDown={(event) => {
          // ⌘/Ctrl + Enter logs from anywhere in the composer.
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            event.currentTarget.requestSubmit()
          }
        }}
        noValidate
        aria-label="Log a meal"
        className="rounded-2xl bg-[#1E1B1F] p-4 md:p-5"
      >
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[14px] font-normal text-white" style={display}>Log a meal</h2>
          <span className="nh-label">Now</span>
        </div>

        <fieldset disabled={saving} className="min-w-0 space-y-4 border-0 p-0">
          <div className="flex gap-3">
            <MealPhotoField
              compact
              file={photo}
              disabled={saving}
              onChange={(next) => {
                setPhoto(next)
                setJustLogged(null)
              }}
            />
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <label htmlFor="quick-meal-title" className="sr-only">Meal title</label>
              <input
                id="quick-meal-title"
                value={values.title}
                autoComplete="off"
                maxLength={MEAL_LIMITS.title}
                onChange={(event) => patch({ title: event.target.value.slice(0, MEAL_LIMITS.title) })}
                placeholder="What did you eat?"
                aria-invalid={!!titleError}
                className="w-full bg-transparent text-[20px] font-bold leading-tight text-white outline-none placeholder:text-[#4A464C]"
                style={{ fontFamily: "'Sk Modernist', sans-serif", letterSpacing: '-0.01em' }}
              />
              {titleError ? (
                <p className="mt-1 text-[12px] text-[#FF4D4D]" style={sans} role="alert">{titleError}</p>
              ) : (
                <p className="mt-1 text-[12px] text-[#6B6870]" style={sans}>
                  {photo
                    ? 'AI estimates any calories and macros you leave blank.'
                    : 'Add a photo or scan a barcode to fill in the nutrition.'}
                </p>
              )}
            </div>
          </div>

          <MealTypeChips
            value={mealType}
            onChange={(next) => {
              setMealTypeTouched(true)
              patch({ mealType: next })
            }}
          />

          <div>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                aria-expanded={showDetails}
                onClick={() => setShowDetails((open) => !open)}
                className="flex items-center gap-1 text-[12px] font-semibold text-[#847E89] hover:text-white"
                style={sans}
              >
                <ChevronDown size={14} className={`transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                {showDetails ? 'Hide details' : 'Add details'}
              </button>
              <button
                type="button"
                onClick={() => setScanOpen(true)}
                className="flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-[#847E89] hover:text-white"
                style={sans}
              >
                <ScanBarcode size={14} />
                Scan barcode
              </button>
            </div>

            {showDetails ? (
              <div className="mt-3 space-y-3">
                {scanned ? (
                  <div className="flex items-center gap-3 rounded-xl bg-[#181519] px-3 py-2.5">
                    <ScanBarcode size={16} className="shrink-0 text-[#847E89]" aria-hidden />
                    <p className="min-w-0 flex-1 truncate text-[13px] text-white" style={sans} title={productTitle(scanned.product)}>
                      {productTitle(scanned.product)}
                    </p>
                    <label className="flex items-center gap-1">
                      <span className="sr-only">Amount eaten in grams</span>
                      <input
                        value={scanned.grams}
                        inputMode="numeric"
                        maxLength={MEAL_LIMITS.numberDigits}
                        onChange={(event) => applyScanned(scanned.product, digitsOnly(event.target.value, MEAL_LIMITS.numberDigits))}
                        className="w-12 rounded-md bg-[#2B282C] px-1.5 py-1 text-right text-[13px] text-white outline-none focus:ring-1 focus:ring-white/20"
                        style={sans}
                      />
                      <span className="text-[11px] text-[#6B6870]" style={sans}>g</span>
                    </label>
                    <button
                      type="button"
                      aria-label="Remove scanned product"
                      onClick={() => setScanned(null)}
                      className="text-[#6B6870] hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-2">
                  {MACROS.map(({ key, label, unit }) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 rounded-xl bg-[#181519] px-3 py-2.5 focus-within:ring-1 focus-within:ring-white/20"
                    >
                      <span className="nh-label w-14 shrink-0 !text-[10px]">{label}</span>
                      <input
                        value={values[key]}
                        inputMode="numeric"
                        maxLength={MEAL_LIMITS.numberDigits}
                        placeholder={photo ? 'AI' : '–'}
                        onChange={(event) => patch({ [key]: digitsOnly(event.target.value, MEAL_LIMITS.numberDigits) })}
                        className="min-w-0 flex-1 bg-transparent text-right text-[14px] text-white outline-none placeholder:text-[#4A464C]"
                        style={sans}
                      />
                      <span className="text-[11px] text-[#6B6870]" style={sans}>{unit}</span>
                    </label>
                  ))}
                </div>
                <label htmlFor="quick-meal-notes" className="sr-only">Notes</label>
                <textarea
                  id="quick-meal-notes"
                  value={values.notes}
                  onChange={(event) => patch({ notes: event.target.value.slice(0, MEAL_LIMITS.notes) })}
                  placeholder="Ingredients, portions, how you felt"
                  className="field-sizing-content min-h-[72px] w-full resize-none rounded-xl bg-[#181519] px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-[#4A464C] focus:ring-1 focus:ring-white/20"
                  style={sans}
                />
              </div>
            ) : null}
          </div>
        </fieldset>

        {error ? (
          <p className="mt-4 rounded-xl border border-[#FF4D4D]/40 bg-[#FF4D4D]/10 px-3 py-2.5 text-[13px] text-[#FF4D4D]" style={sans} role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#F5F5F5] text-[14px] font-semibold text-[#141115] transition-opacity hover:opacity-90 disabled:opacity-50"
          style={sans}
        >
          {saving ? 'Saving…' : 'Log meal'}
        </button>

        {justLogged ? (
          <p className="mt-3 text-center text-[12px] text-[#4ADE80]" style={sans} role="status">
            Logged “{justLogged}” — it&apos;s in today&apos;s meals.
          </p>
        ) : null}
      </form>

      {scanOpen ? (
        <BarcodeScannerModal
          onClose={() => setScanOpen(false)}
          onProduct={(product) => {
            if (!values.title.trim()) patch({ title: productTitle(product).slice(0, MEAL_LIMITS.title) })
            applyScanned(product, String(product.servingGrams ?? 100))
            setShowDetails(true)
          }}
        />
      ) : null}
    </>
  )
}
