'use client'

import { InputDark, TextAreaDark } from '@/app/components/ui/inputs'
import { sans } from '@/lib/social/format'
import { MEAL_LIMITS, MEAL_TYPES, MEAL_TYPE_LABELS, type MealFormValues, type MealType } from '@/lib/meals/types'
import { digitsOnly } from '@/lib/meals/utils'

const LABEL_FONT = { fontFamily: "'Sk Modernist', sans-serif" } as const

export function MealTypeChips({
  value,
  onChange,
  readOnly = false,
}: {
  value: MealType | null
  onChange: (next: MealType | null) => void
  readOnly?: boolean
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-[0.04em] text-[#6B6870]" style={LABEL_FONT}>Meal type</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Meal type">
        {MEAL_TYPES.map((type) => {
          const selected = value === type
          return (
            <button
              key={type}
              type="button"
              aria-pressed={selected}
              disabled={readOnly}
              onClick={() => {
                if (!readOnly) onChange(selected ? null : type)
              }}
              className={`rounded-full px-3 py-1 text-[12px] disabled:cursor-default disabled:opacity-100 ${selected ? 'bg-[#F5F5F5] text-[#141115]' : 'border border-[#3A373C] text-[#A09EA3]'}`}
              style={sans}
            >
              {MEAL_TYPE_LABELS[type]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Title, nutrition numbers, meal type and notes. Shared by the meal log pages and the
 * "log a meal" sheet in the post composer so both validate and constrain input the same way.
 */
export function MealFormFields({
  values,
  onChange,
  titleError,
  showCarbsFat = true,
  macroPlaceholder = 'Optional',
  idPrefix = 'meal',
  readOnly = false,
}: {
  values: MealFormValues
  onChange: (patch: Partial<MealFormValues>) => void
  titleError?: string
  showCarbsFat?: boolean
  macroPlaceholder?: string
  idPrefix?: string
  readOnly?: boolean
}) {
  const macro = (key: 'calories' | 'protein' | 'carbs' | 'fat', label: string) => (
    <InputDark
      label={label}
      name={`${idPrefix}-${key}`}
      value={values[key]}
      inputMode="numeric"
      maxLength={MEAL_LIMITS.numberDigits}
      placeholder={macroPlaceholder}
      readOnly={readOnly}
      onChange={(event) => onChange({ [key]: digitsOnly(event.target.value, MEAL_LIMITS.numberDigits) })}
    />
  )

  return (
    <div className="space-y-5">
      <InputDark
        label="Meal title"
        name={`${idPrefix}-title`}
        value={values.title}
        required
        maxLength={MEAL_LIMITS.title}
        error={titleError}
        placeholder="e.g. Grilled chicken salad"
        readOnly={readOnly}
        onChange={(event) => onChange({ title: event.target.value.slice(0, MEAL_LIMITS.title) })}
      />
      <div className={showCarbsFat ? 'grid grid-cols-2 gap-4' : 'space-y-5'}>
        {macro('calories', 'Calories (kcal)')}
        {macro('protein', 'Protein (g)')}
        {showCarbsFat ? macro('carbs', 'Carbs (g)') : null}
        {showCarbsFat ? macro('fat', 'Fat (g)') : null}
      </div>
      <MealTypeChips value={values.mealType} readOnly={readOnly} onChange={(mealType) => onChange({ mealType })} />
      <TextAreaDark
        label="Notes"
        name={`${idPrefix}-notes`}
        value={values.notes}
        rows={4}
        placeholder="Ingredients, quantities, when you ate, how you felt"
        readOnly={readOnly}
        onChange={(event) => onChange({ notes: event.target.value.slice(0, MEAL_LIMITS.notes) })}
      />
    </div>
  )
}

export function AiAnalysisToggle({
  checked,
  disabled,
  onChange,
  hint,
}: {
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
  hint?: string
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <p className="text-[13px] text-white" style={sans}>Analyze photo with AI</p>
        {hint ? <p className="mt-0.5 text-[11px] text-[#6B6870]" style={sans}>{hint}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="Analyze photo with AI"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-[52px] shrink-0 rounded-full border transition-colors ${checked ? 'border-[#F5F5F5] bg-[#F5F5F5]' : 'border-[#3A373C] bg-[#2B282C]'}`}
      >
        <span
          className={`absolute top-[2px] h-7 w-7 rounded-full bg-[#141115] transition-all ${checked ? 'left-[22px]' : 'left-[2px]'}`}
        />
      </button>
    </div>
  )
}
