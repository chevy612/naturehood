'use client'

import { useMemo } from 'react'
import { sans, display } from '@/lib/social/format'
import type { MealListItem, NutritionTargets } from '@/lib/meals/types'
import { sumMacros } from '@/lib/meals/utils'

export type SummaryMode = 'daily' | 'weekly'

const MET_COLOR = '#4ADE80'
const BELOW_TARGET_COLOR = '#FF4D4D'

function statColor(current: number, target: number | null) {
  if (target == null) return MET_COLOR
  return current < target ? BELOW_TARGET_COLOR : MET_COLOR
}

export function DailySummaryCard({
  meals,
  targets,
  mode,
  onModeChange,
}: {
  meals: MealListItem[]
  targets: NutritionTargets
  mode: SummaryMode
  onModeChange: (mode: SummaryMode) => void
}) {
  const totals = useMemo(() => sumMacros(meals), [meals])

  const stats = [
    { key: 'protein', label: 'Protein', unit: 'g', value: totals.protein, target: targets.protein },
    { key: 'calories', label: 'Calories', unit: 'kcal', value: totals.calories, target: targets.calories },
    { key: 'carbs', label: 'Carbs', unit: 'g', value: totals.carbs, target: targets.carbs },
    { key: 'fat', label: 'Fat', unit: 'g', value: totals.fat, target: targets.fat },
  ] as const

  return (
    <section aria-label={mode === 'weekly' ? 'Weekly summary' : 'Daily summary'} className="rounded-2xl bg-[#1E1B1F] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-white" style={display}>
          {mode === 'weekly' ? 'Weekly summary' : 'Daily summary'}
        </h2>
        <div className="flex rounded-lg bg-[#141115] p-[3px]" role="group" aria-label="Summary range">
          {(['daily', 'weekly'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => onModeChange(option)}
              className={`rounded-md px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${mode === option ? 'bg-[#2B282C] text-white' : 'text-[#6B6870]'}`}
              style={sans}
            >
              {option === 'daily' ? 'Day' : 'Week'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.key} data-testid={`total-${stat.key}`} className="flex flex-col items-center gap-1 rounded-xl bg-[#2B282C] px-2 py-3">
            <span className="text-[20px] font-bold" style={{ ...sans, color: statColor(stat.value, stat.target) }}>
              {Math.round(stat.value)}
            </span>
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#A09EA3]" style={display}>{stat.label}</span>
            {stat.target != null ? (
              <span className="text-[10px] text-[#6B6870]" style={sans}>of {Math.round(stat.target)} {stat.unit}</span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
