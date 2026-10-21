'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { display, sans } from '@/lib/social/format'
import { MONTH_NAMES, todayDateKey } from '@/lib/meals/utils'
import type { MealListItem } from '@/lib/meals/types'
import {
  CATEGORY_META,
  MEAL_COLOR,
  PAIN_COLOR,
  PAIN_FLAG,
  monthOf,
  monthWeeks,
  workoutCategory,
  type DashboardWorkout,
  type WorkoutCategory,
} from '@/lib/dashboard/utils'

// ─────────────────────────────────────────────
// TRAINING CALENDAR
//   Monday-first month grid. Each day shows:
//     • a bar per session, coloured by category (training / competition / recovery),
//       brighter for higher perceived intensity
//     • a green dot when meals were logged, a red dot when pain ≥ PAIN_FLAG
//   The right-hand column counts training days per week.
// ─────────────────────────────────────────────

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

const INTENSITY_OPACITY: Record<string, number> = { low: 0.45, moderate: 0.65, high: 0.85, max: 1 }

function intensityOpacity(workout: DashboardWorkout) {
  return workout.perceived_intensity ? INTENSITY_OPACITY[workout.perceived_intensity] : 0.65
}

export function TrainingCalendar({
  month,
  onMonthChange,
  minMonth,
  selectedDate,
  onSelectDate,
  workoutsByDate,
  mealsByDate,
  today = todayDateKey(),
}: {
  /** `YYYY-MM` */
  month: string
  onMonthChange: (delta: number) => void
  /** Earliest month that can be navigated to (`YYYY-MM`). */
  minMonth?: string
  selectedDate: string
  onSelectDate: (key: string) => void
  workoutsByDate: ReadonlyMap<string, DashboardWorkout[]>
  mealsByDate: ReadonlyMap<string, MealListItem[]>
  /** Viewer's local today (`YYYY-MM-DD`); pass it in when rendering from a hydrated value. */
  today?: string
}) {
  const weeks = monthWeeks(month)
  const [year, m] = month.split('-').map(Number)
  const canGoBack = !minMonth || month > minMonth
  const canGoForward = month < monthOf(today)

  return (
    <section aria-label="Training calendar" className="rounded-2xl bg-[#1E1B1F] p-4">
      {/* ── Month header ── */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[17px] font-normal text-white" style={{ ...display, letterSpacing: '-0.01em' }}>
          {MONTH_NAMES[m - 1]} {year}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            disabled={!canGoBack}
            onClick={() => onMonthChange(-1)}
            className="rounded-lg p-1.5 text-[#A09EA3] transition-colors hover:bg-[#2B282C] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            disabled={!canGoForward}
            onClick={() => onMonthChange(1)}
            className="rounded-lg p-1.5 text-[#A09EA3] transition-colors hover:bg-[#2B282C] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ── Grid ── */}
      <div role="grid" aria-label={`${MONTH_NAMES[m - 1]} ${year}`}>
        <div role="row" className="mb-1 grid grid-cols-[repeat(7,minmax(0,1fr))_28px] gap-1 sm:gap-1.5">
          {WEEKDAYS.map((day) => (
            <span key={day} role="columnheader" className="nh-label text-center !text-[10px] !text-[#6B6870]">
              {day.slice(0, 1)}
              <span className="hidden sm:inline">{day.slice(1)}</span>
            </span>
          ))}
          <span role="columnheader" aria-label="Training days this week" className="nh-label text-center !text-[10px] !text-[#6B6870]">
            Wk
          </span>
        </div>

        {weeks.map((week) => {
          const trainedThisWeek = week.filter((key) => workoutsByDate.has(key)).length
          return (
            <div key={week[0]} role="row" className="mb-1 grid grid-cols-[repeat(7,minmax(0,1fr))_28px] gap-1 sm:mb-1.5 sm:gap-1.5">
              {week.map((key) => (
                <DayCell
                  key={key}
                  dateKey={key}
                  inMonth={monthOf(key) === month}
                  isToday={key === today}
                  isFuture={key > today}
                  selected={key === selectedDate}
                  workouts={workoutsByDate.get(key)}
                  meals={mealsByDate.get(key)}
                  onSelect={onSelectDate}
                />
              ))}
              <span
                role="gridcell"
                aria-label={`${trainedThisWeek} training days`}
                className={`flex items-center justify-center text-[12px] font-semibold ${trainedThisWeek ? 'text-white' : 'text-[#3D3940]'}`}
                style={sans}
              >
                {trainedThisWeek}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── Legend ── */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#2B282C] pt-3">
        {(Object.keys(CATEGORY_META) as WorkoutCategory[]).map((cat) => (
          <LegendItem key={cat} label={CATEGORY_META[cat].label}>
            <span className="h-1.5 w-3 rounded-full" style={{ background: CATEGORY_META[cat].color }} />
          </LegendItem>
        ))}
        <LegendItem label="Meals">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: MEAL_COLOR }} />
        </LegendItem>
        <LegendItem label={`Pain ${PAIN_FLAG}+`}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: PAIN_COLOR }} />
        </LegendItem>
      </div>
    </section>
  )
}

function LegendItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-[#847E89]" style={sans}>
      {children}
      {label}
    </span>
  )
}

function DayCell({
  dateKey,
  inMonth,
  isToday,
  isFuture,
  selected,
  workouts,
  meals,
  onSelect,
}: {
  dateKey: string
  inMonth: boolean
  isToday: boolean
  isFuture: boolean
  selected: boolean
  workouts?: DashboardWorkout[]
  meals?: MealListItem[]
  onSelect: (key: string) => void
}) {
  const day = Number(dateKey.slice(8))
  const trained = !!workouts?.length
  const hasMeals = !!meals?.length
  const painFlag = workouts?.some((w) => (w.readiness_pain_score ?? 0) >= PAIN_FLAG)

  const label = [
    dateKey,
    trained ? `${workouts!.length} session${workouts!.length > 1 ? 's' : ''}` : 'rest day',
    hasMeals ? `${meals!.length} meal${meals!.length > 1 ? 's' : ''}` : null,
    painFlag ? 'pain reported' : null,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <button
      type="button"
      role="gridcell"
      aria-selected={selected}
      aria-label={label}
      disabled={isFuture}
      onClick={() => onSelect(dateKey)}
      className={`relative flex aspect-square min-w-0 flex-col rounded-lg p-1 text-left transition-colors sm:aspect-[1/0.9] sm:p-1.5 ${
        selected
          ? 'bg-[#2B282C] ring-2 ring-white'
          : trained
            ? 'bg-[#262227] hover:bg-[#2B282C]'
            : 'bg-[#181519] hover:bg-[#221F23]'
      } ${inMonth ? '' : 'opacity-35'} disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-[#181519]`}
    >
      <span className="flex items-center justify-between">
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full text-[11px] font-semibold sm:text-[12px] ${
            isToday ? 'bg-white px-1 text-black' : trained ? 'text-white' : 'text-[#847E89]'
          }`}
          style={sans}
        >
          {day}
        </span>
        <span className="flex gap-0.5">
          {painFlag ? <span className="h-1.5 w-1.5 rounded-full" style={{ background: PAIN_COLOR }} aria-hidden /> : null}
          {hasMeals ? <span className="h-1.5 w-1.5 rounded-full" style={{ background: MEAL_COLOR }} aria-hidden /> : null}
        </span>
      </span>

      {trained ? (
        <span className="mt-auto flex flex-col gap-0.5" aria-hidden>
          {workouts!.slice(0, 3).map((w) => (
            <span
              key={w.id}
              className="h-1 w-full rounded-full sm:h-1.5"
              style={{ background: CATEGORY_META[workoutCategory(w.session_type)].color, opacity: intensityOpacity(w) }}
            />
          ))}
        </span>
      ) : null}
    </button>
  )
}
