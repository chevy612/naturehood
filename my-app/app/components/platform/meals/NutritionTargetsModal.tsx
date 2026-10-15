'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { InputDark } from '@/app/components/ui/inputs'
import { sans } from '@/lib/social/format'
import type { NutritionTargets, NutritionTargetsState } from '@/lib/meals/types'
import { EMPTY_TARGETS, parseTarget } from '@/lib/meals/utils'

type Mode = 'daily' | 'weekly'
type Form = Record<keyof NutritionTargets, string>

const FIELDS: { key: keyof NutritionTargets; label: string }[] = [
  { key: 'calories', label: 'Calories (kcal)' },
  { key: 'protein', label: 'Protein (g)' },
  { key: 'carbs', label: 'Carbs (g)' },
  { key: 'fat', label: 'Fat (g)' },
]

function toForm(targets: NutritionTargets): Form {
  return {
    calories: targets.calories != null ? String(targets.calories) : '',
    protein: targets.protein != null ? String(targets.protein) : '',
    carbs: targets.carbs != null ? String(targets.carbs) : '',
    fat: targets.fat != null ? String(targets.fat) : '',
  }
}

export function NutritionTargetsModal({
  targets,
  onSave,
  onClose,
}: {
  targets: NutritionTargetsState
  onSave: (next: NutritionTargetsState) => void
  onClose: () => void
}) {
  const [mode, setMode] = useState<Mode>('daily')
  const [drafts, setDrafts] = useState<Record<Mode, Form>>(() => ({
    daily: toForm(targets.daily),
    weekly: toForm(targets.weekly),
  }))

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  function handleSave() {
    const parse = (form: Form): NutritionTargets => ({
      calories: parseTarget(form.calories),
      protein: parseTarget(form.protein),
      carbs: parseTarget(form.carbs),
      fat: parseTarget(form.fat),
    })
    onSave({ daily: parse(drafts.daily), weekly: parse(drafts.weekly) })
    onClose()
  }

  function handleClear() {
    setDrafts((current) => ({ ...current, [mode]: toForm(EMPTY_TARGETS) }))
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Nutrition targets">
      <button type="button" aria-label="Close targets" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-md rounded-t-3xl border border-[#3A373C] bg-[#141115] p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[15px] text-white" style={sans}>Nutrition targets</p>
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E1B1F] text-white">
            <X size={16} />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-lg bg-[#1E1B1F] p-[3px]" role="group" aria-label="Target range">
          {(['daily', 'weekly'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => setMode(option)}
              className={`rounded-md py-2 text-[13px] ${mode === option ? 'bg-[#2B282C] font-semibold text-white' : 'text-[#6B6870]'}`}
              style={sans}
            >
              {option === 'daily' ? 'Daily' : 'Weekly'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {FIELDS.map(({ key, label }) => (
            <InputDark
              key={`${mode}-${key}`}
              label={label}
              name={`target-${mode}-${key}`}
              value={drafts[mode][key]}
              inputMode="numeric"
              placeholder="--"
              onChange={(event) =>
                setDrafts((current) => ({
                  ...current,
                  [mode]: { ...current[mode], [key]: event.target.value.replace(/[^\d.]/g, '').slice(0, 8) },
                }))
              }
            />
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={handleClear} className="flex-1 rounded-full border border-[#3A373C] py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#A09EA3]" style={sans}>
            Clear all
          </button>
          <button type="button" onClick={handleSave} className="flex-1 rounded-full bg-[#F5F5F5] py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-[#141115]" style={sans}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
