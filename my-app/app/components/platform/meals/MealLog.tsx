'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, RefreshCw, SlidersHorizontal, X } from 'lucide-react'
import { DailySummaryCard, type SummaryMode } from '@/app/components/platform/meals/DailySummaryCard'
import { MealCard } from '@/app/components/platform/meals/MealCard'
import { NutritionTargetsModal } from '@/app/components/platform/meals/NutritionTargetsModal'
import { WeekDateBar } from '@/app/components/platform/meals/WeekDateBar'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { LogoSpinner } from '@/app/components/ui/logo-spinner'
import { countMeals, fetchMealsInRange } from '@/lib/meals/browser'
import {
  dismissAnalysisNotice,
  useAnalysisCompletedCount,
  useAnalysisNotices,
  useAnalyzingMealIds,
} from '@/lib/meals/analysis-store'
import { DEFAULT_TARGETS_STATE, loadNutritionTargets, saveNutritionTargets } from '@/lib/meals/targets'
import type { MealListItem, NutritionTargetsState } from '@/lib/meals/types'
import {
  dateKey,
  formatDayHeading,
  getWeekRange,
  isFutureDate,
  isValidDateKey,
  mealsForDate,
  mealsForWeek,
  monthNameForKey,
  shiftDateKey,
  todayDateKey,
} from '@/lib/meals/utils'
import { sans, display } from '@/lib/social/format'

const DAYS_LOADED = 60

function initialDate(param: string | null) {
  return isValidDateKey(param) && !isFutureDate(param) ? param : todayDateKey()
}

function windowStartFor(selectedDate: string) {
  const weekStart = getWeekRange(selectedDate).start
  const defaultStart = shiftDateKey(todayDateKey(), -DAYS_LOADED)
  return weekStart < defaultStart ? weekStart : defaultStart
}

export function MealLog({ userId }: { userId: string }) {
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState(() => initialDate(searchParams.get('date')))
  const [windowStart, setWindowStart] = useState(() => windowStartFor(initialDate(searchParams.get('date'))))
  const [loadedStart, setLoadedStart] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [meals, setMeals] = useState<MealListItem[]>([])
  const [totalMeals, setTotalMeals] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summaryMode, setSummaryMode] = useState<SummaryMode>('daily')
  const [targets, setTargets] = useState<NutritionTargetsState>(DEFAULT_TARGETS_STATE)
  const [showTargets, setShowTargets] = useState(false)
  const dateInput = useRef<HTMLInputElement>(null)
  const latestRequest = useRef(0)

  const analyzingIds = useAnalyzingMealIds()
  const notices = useAnalysisNotices()
  const completedCount = useAnalysisCompletedCount()

  useEffect(() => {
    const request = ++latestRequest.current
    const tomorrow = shiftDateKey(todayDateKey(), 1)
    Promise.all([fetchMealsInRange(userId, windowStart, tomorrow), countMeals(userId)])
      .then(([rows, total]) => {
        if (request !== latestRequest.current) return
        setMeals(rows)
        setTotalMeals(total)
        setLoadedStart(windowStart)
        setError(null)
      })
      .catch((loadError: unknown) => {
        if (request !== latestRequest.current) return
        setError(loadError instanceof Error ? loadError.message : 'Could not load your meals.')
        setLoadedStart(windowStart)
      })
      .finally(() => {
        if (request === latestRequest.current) setRefreshing(false)
      })
  }, [userId, windowStart, reloadToken, completedCount])

  const loading = loadedStart === null || getWeekRange(selectedDate).start < loadedStart

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after hydration
    setTargets(loadNutritionTargets())
  }, [])

  const selectDate = useCallback((key: string) => {
    if (isFutureDate(key)) return
    setSelectedDate(key)
    const needed = getWeekRange(key).start
    setWindowStart((current) => (needed < current ? needed : current))
    window.history.replaceState(null, '', key === todayDateKey() ? '/meals' : `/meals?date=${key}`)
  }, [])

  const mealDateKeys = useMemo(() => new Set(meals.map((meal) => dateKey(meal.created_at))), [meals])
  const dayMeals = useMemo(() => mealsForDate(meals, selectedDate), [meals, selectedDate])
  const summaryMeals = useMemo(
    () => (summaryMode === 'weekly' ? mealsForWeek(meals, selectedDate) : dayMeals),
    [dayMeals, meals, selectedDate, summaryMode],
  )

  const isToday = selectedDate === todayDateKey()
  const hasNoMeals = !loading && !error && totalMeals === 0

  return (
    <div className="min-h-screen bg-[#141115] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ ...display, letterSpacing: '-0.02em' }}>Meal log</h1>
            <p className="mt-1 text-[13px] text-[#6B6870]" style={sans}>{monthNameForKey(selectedDate)}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Refresh meals"
              onClick={() => {
                setRefreshing(true)
                setReloadToken((token) => token + 1)
              }}
              disabled={refreshing || loading}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-[#1E1B1F] disabled:opacity-40"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <div className="relative">
              <button
                type="button"
                aria-label="Pick a date"
                onClick={() => {
                  const input = dateInput.current
                  if (input?.showPicker) input.showPicker()
                  else input?.focus()
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-[#1E1B1F]"
              >
                <CalendarDays size={20} />
              </button>
              <input
                ref={dateInput}
                type="date"
                aria-label="Jump to date"
                tabIndex={-1}
                max={todayDateKey()}
                value={selectedDate}
                onChange={(event) => {
                  if (isValidDateKey(event.target.value)) selectDate(event.target.value)
                }}
                className="pointer-events-none absolute inset-0 opacity-0"
              />
            </div>
            <button
              type="button"
              aria-label="Nutrition targets"
              onClick={() => setShowTargets(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-[#1E1B1F]"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {notices.map((notice) => (
          <div key={notice.id} role="alert" className="mb-4 flex items-start gap-3 rounded-xl border border-[#FF4D4D]/40 bg-[#FF4D4D]/10 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#FF4D4D]" style={sans}>{notice.title}</p>
              <p className="mt-1 text-[13px] text-[#A09EA3]" style={sans}>{notice.message}</p>
            </div>
            <button type="button" aria-label="Dismiss" onClick={() => dismissAnalysisNotice(notice.id)} className="text-[#A09EA3] hover:text-white">
              <X size={16} />
            </button>
          </div>
        ))}

        <WeekDateBar selectedDate={selectedDate} onSelectDate={selectDate} mealDateKeys={mealDateKeys} />

        <div className="mt-3">
          <DailySummaryCard meals={summaryMeals} targets={summaryMode === 'weekly' ? targets.weekly : targets.daily} mode={summaryMode} onModeChange={setSummaryMode} />
        </div>

        <div className="mb-3 mt-6 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-white" style={display}>{formatDayHeading(selectedDate)}</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous day"
              onClick={() => selectDate(shiftDateKey(selectedDate, -1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-[#1E1B1F]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next day"
              disabled={isToday}
              onClick={() => selectDate(shiftDateKey(selectedDate, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-[#1E1B1F] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LogoSpinner size={48} /></div>
        ) : error ? (
          <StatusMessage tone="error">{error}</StatusMessage>
        ) : hasNoMeals ? (
          <div className="rounded-2xl border border-dashed border-[#3A373C] px-6 py-12 text-center">
            <p className="text-[15px] text-white" style={sans}>No meals logged yet</p>
            <p className="mt-1 text-[13px] text-[#6B6870]" style={sans}>Log your first meal to start tracking calories and macros.</p>
          </div>
        ) : dayMeals.length === 0 ? (
          <StatusMessage>No meals logged for this day.</StatusMessage>
        ) : (
          <ul className="space-y-2.5">
            {dayMeals.map((meal) => (
              <li key={meal.meal_id}>
                <MealCard meal={meal} isAnalyzing={analyzingIds.has(meal.meal_id)} />
              </li>
            ))}
          </ul>
        )}

        <div className="sticky bottom-20 mt-6 md:bottom-6">
          <Link
            href="/meals/new"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#F5F5F5] text-[12px] font-bold uppercase tracking-[0.16em] text-[#141115] shadow-lg shadow-black/40 hover:bg-white"
            style={sans}
          >
            <Plus size={16} />
            Log a meal
          </Link>
        </div>
      </div>

      {showTargets ? (
        <NutritionTargetsModal
          targets={targets}
          onClose={() => setShowTargets(false)}
          onSave={(next) => {
            setTargets(next)
            saveNutritionTargets(next)
          }}
        />
      ) : null}
    </div>
  )
}
