'use client'

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import {
  ArrowDownRight, ArrowUpRight, Bandage, ChevronRight, Dumbbell, HeartPulse, Minus, Plus,
  Shield, Shuffle, Stethoscope, Trophy, Waves, Zap, type LucideIcon,
} from 'lucide-react'
import { TrainingCalendar } from '@/app/components/platform/dashboard/TrainingCalendar'
import { TabBar, type SwipeTab } from '@/app/components/platform/team/SwipeTabs'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { fetchMealsInRange } from '@/lib/meals/browser'
import { dateKey, formatDayHeading, sumMacros, todayDateKey } from '@/lib/meals/utils'
import type { MealListItem } from '@/lib/meals/types'
import { display, sans } from '@/lib/social/format'
import type { PerceivedIntensity, SessionType } from '@/lib/types'
import {
  CATEGORY_META,
  PAIN_COLOR,
  PERIOD_DAYS,
  PERFORMANCE_META,
  bodyCheck,
  daysInMonth,
  firstOfMonth,
  formatMinutes,
  groupByDate,
  monthOf,
  performanceBand,
  performanceScore,
  shiftMonth,
  weeklyStreak,
  workoutCategory,
  type BodyCheck,
  type BodyCheckPeriod,
  type DashboardWorkout,
  type LoadStatus,
} from '@/lib/dashboard/utils'

// ─────────────────────────────────────────────
// PERSONAL DASHBOARD (client)
//   Body check (week / month) · month stats · training calendar · selected-day detail.
//   Workouts arrive from the server (12-month window); meals load per visible month
//   because their day is the viewer's local day of `created_at`.
// ─────────────────────────────────────────────

const noopSubscribe = () => () => {}

/**
 * "Today" in the viewer's timezone. Null during SSR so the server (often UTC) never renders
 * a different day than the browser — the dashboard shows a skeleton until hydrated.
 */
function useClientToday(): string | null {
  return useSyncExternalStore(noopSubscribe, todayDateKey, () => null)
}

export function PersonalDashboard(props: { userId: string; workouts: DashboardWorkout[]; minMonth: string }) {
  const today = useClientToday()
  if (!today) return <DashboardSkeleton />
  return <DashboardBody {...props} today={today} />
}

function DashboardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-[150px] rounded-2xl bg-[#1E1B1F]" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-[92px] rounded-2xl bg-[#1E1B1F]" />)}
      </div>
      <div className="h-[420px] rounded-2xl bg-[#1E1B1F]" />
    </div>
  )
}

function DashboardBody({
  userId,
  workouts,
  minMonth,
  today,
}: {
  userId: string
  workouts: DashboardWorkout[]
  minMonth: string
  today: string
}) {
  const [month, setMonth] = useState(() => monthOf(today))
  const [selectedDate, setSelectedDate] = useState(today)
  const [mealsByMonth, setMealsByMonth] = useState<Record<string, MealListItem[]>>({})
  const [mealsError, setMealsError] = useState<string | null>(null)
  const [bodyPeriod, setBodyPeriod] = useState<BodyCheckPeriod>('week')

  useEffect(() => {
    if (mealsByMonth[month]) return
    let cancelled = false
    fetchMealsInRange(userId, firstOfMonth(month), firstOfMonth(shiftMonth(month, 1)))
      .then((rows) => {
        if (cancelled) return
        setMealsByMonth((prev) => ({ ...prev, [month]: rows }))
        setMealsError(null)
      })
      .catch((e: unknown) => {
        if (!cancelled) setMealsError(e instanceof Error ? e.message : 'Could not load your meals.')
      })
    return () => {
      cancelled = true
    }
  }, [userId, month, mealsByMonth])

  const workoutsByDate = useMemo(() => groupByDate(workouts, (w) => w.logged_date), [workouts])
  const mealsByDate = useMemo(
    () => groupByDate(Object.values(mealsByMonth).flat(), (meal) => dateKey(meal.created_at)),
    [mealsByMonth],
  )
  const streak = useMemo(() => weeklyStreak(new Set(workoutsByDate.keys()), today), [workoutsByDate, today])
  const body = useMemo(() => bodyCheck(workouts, today, PERIOD_DAYS[bodyPeriod]), [workouts, today, bodyPeriod])

  const monthStats = useMemo(() => {
    const inMonth = workouts.filter((w) => monthOf(w.logged_date) === month)
    const trainedDays = new Set(inMonth.map((w) => w.logged_date)).size
    const elapsed = month === monthOf(today) ? Number(today.slice(8)) : daysInMonth(month)
    const minutes = inMonth.reduce((sum, w) => sum + (w.duration_minutes ?? 0), 0)
    const meals = mealsByMonth[month]
    const mealDays = meals ? new Set(meals.map((meal) => dateKey(meal.created_at))).size : null
    return { trainedDays, elapsed, sessions: inMonth.length, minutes, mealDays, mealCount: meals?.length ?? null }
  }, [workouts, month, mealsByMonth, today])

  function changeMonth(delta: number) {
    const next = shiftMonth(month, delta)
    setMonth(next)
    // Keep the selection inside the visible month: today when returning to it, else the 1st.
    setSelectedDate(next === monthOf(today) ? today : firstOfMonth(next))
  }

  return (
    <div className="flex flex-col gap-4">
      <BodyCheckCard body={body} period={bodyPeriod} onPeriodChange={setBodyPeriod} />

      {/* ── Month at a glance ── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile
          label="Days trained"
          value={String(monthStats.trainedDays)}
          suffix={`/ ${monthStats.elapsed}`}
          progress={monthStats.elapsed ? monthStats.trainedDays / monthStats.elapsed : 0}
        />
        <StatTile label="Training time" value={formatMinutes(monthStats.minutes)} suffix={`${monthStats.sessions} sessions`} />
        <StatTile label="Weekly streak" value={String(streak)} suffix={streak === 1 ? 'week' : 'weeks'} />
        <StatTile
          label="Meals logged"
          value={monthStats.mealCount == null ? '–' : String(monthStats.mealCount)}
          suffix={monthStats.mealDays == null ? '' : `on ${monthStats.mealDays} days`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-4">
          <TrainingCalendar
            month={month}
            onMonthChange={changeMonth}
            minMonth={minMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            workoutsByDate={workoutsByDate}
            mealsByDate={mealsByDate}
            today={today}
          />
          {mealsError ? <StatusMessage tone="error">{mealsError}</StatusMessage> : null}
        </div>

        <div>
          <DayDetail
            dateKey={selectedDate}
            workouts={workoutsByDate.get(selectedDate) ?? []}
            meals={mealsByDate.get(selectedDate) ?? []}
            mealsLoaded={!!mealsByMonth[monthOf(selectedDate)]}
            today={today}
          />
        </div>
      </div>
    </div>
  )
}

// ── Stat tile ─────────────────────────────────

function StatTile({ label, value, suffix, progress }: { label: string; value: string; suffix?: string; progress?: number }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-[#1E1B1F] p-4">
      <span className="nh-label">{label}</span>
      <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span className="whitespace-nowrap text-[24px] font-bold leading-none text-white" style={{ ...display, letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {suffix ? <span className="text-[12px] text-[#847E89]" style={sans}>{suffix}</span> : null}
      </span>
      {progress != null ? (
        <span className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#2B282C]" aria-hidden>
          <span className="block h-full rounded-full bg-[#F5F5F5]" style={{ width: `${Math.min(1, progress) * 100}%` }} />
        </span>
      ) : null}
    </div>
  )
}

// ── Selected day ──────────────────────────────

function DayDetail({
  dateKey: key,
  workouts,
  meals,
  mealsLoaded,
  today,
}: {
  dateKey: string
  workouts: DashboardWorkout[]
  meals: MealListItem[]
  mealsLoaded: boolean
  today: string
}) {
  const totals = sumMacros(meals)
  const isRest = workouts.length === 0

  return (
    <section aria-label="Selected day" className="rounded-2xl bg-[#1E1B1F] p-4">
      <h2 className="mb-3 text-[14px] font-normal text-white" style={display}>
        {formatDayHeading(key, new Date(`${today}T12:00`))}
      </h2>

      {/* Workouts */}
      <p className="nh-label mb-2">Training</p>
      {isRest ? (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-[#181519] px-3 py-2.5">
          <span className="text-[13px] text-[#847E89]" style={sans}>Rest day</span>
          <Link href="/record" className="flex items-center gap-1 text-[12px] font-semibold text-white hover:opacity-75" style={sans}>
            <Plus size={14} /> Log workout
          </Link>
        </div>
      ) : (
        <ul className="mb-4 flex flex-col gap-2">
          {workouts.map((w) => (
            <li key={w.id}>
              <WorkoutRow workout={w} />
            </li>
          ))}
        </ul>
      )}

      {/* Meals */}
      <p className="nh-label mb-2">Nutrition</p>
      {!mealsLoaded ? (
        <p className="text-[13px] text-[#847E89]" style={sans}>Loading…</p>
      ) : meals.length === 0 ? (
        <div className="flex items-center justify-between rounded-xl bg-[#181519] px-3 py-2.5">
          <span className="text-[13px] text-[#847E89]" style={sans}>No meals logged</span>
          <Link href="/meals/new" className="flex items-center gap-1 text-[12px] font-semibold text-white hover:opacity-75" style={sans}>
            <Plus size={14} /> Log meal
          </Link>
        </div>
      ) : (
        <Link
          href={key === today ? '/meals' : `/meals?date=${key}`}
          className="group flex items-center gap-3 rounded-xl bg-[#181519] px-3 py-2.5 transition-colors hover:bg-[#221F23]"
        >
          <span className="flex-1">
            <span className="block text-[13px] font-semibold text-white" style={sans}>
              {meals.length} meal{meals.length > 1 ? 's' : ''} · {Math.round(totals.calories)} kcal
            </span>
            <span className="block text-[12px] text-[#847E89]" style={sans}>
              P {Math.round(totals.protein)}g · C {Math.round(totals.carbs)}g · F {Math.round(totals.fat)}g
            </span>
          </span>
          <ChevronRight size={16} className="text-[#6B6870] group-hover:text-white" />
        </Link>
      )}
    </section>
  )
}

// Self-contained on purpose: mirrors the session-type options in ReportSection without importing them.
const SESSION_TYPE_META: Partial<Record<SessionType, { label: string; Icon: LucideIcon }>> = {
  strength: { label: 'Strength', Icon: Dumbbell },
  sprint: { label: 'Sprint', Icon: Zap },
  conditioning: { label: 'Conditioning', Icon: HeartPulse },
  competition: { label: 'Competition', Icon: Trophy },
  physio: { label: 'Physio', Icon: Stethoscope },
  rehab: { label: 'Rehab', Icon: Bandage },
  prehab: { label: 'Prehab', Icon: Shield },
  recovery: { label: 'Recovery', Icon: Waves },
  mixed: { label: 'Mixed', Icon: Shuffle },
}

const INTENSITY_LABELS: Record<PerceivedIntensity, string> = { low: 'Low', moderate: 'Moderate', high: 'High', max: 'Max' }

function WorkoutRow({ workout }: { workout: DashboardWorkout }) {
  const type = workout.session_type ? SESSION_TYPE_META[workout.session_type] : undefined
  const TypeIcon = type?.Icon ?? Dumbbell
  const color = CATEGORY_META[workoutCategory(workout.session_type)].color
  const score = performanceScore(workout)
  const band = performanceBand(score)
  const meta = [
    workout.duration_minutes ? formatMinutes(workout.duration_minutes) : null,
    workout.perceived_intensity ? `${INTENSITY_LABELS[workout.perceived_intensity]} intensity` : null,
  ].filter(Boolean)

  return (
    <Link
      href={`/record/${workout.id}`}
      className="group flex items-center gap-3 rounded-xl bg-[#181519] px-3 py-2.5 transition-colors hover:bg-[#221F23]"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${color}1F`, color }}
        aria-hidden
      >
        <TypeIcon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-white" style={sans}>
          {workout.title || type?.label || 'Workout'}
        </span>
        <span className="block truncate text-[12px] text-[#847E89]" style={sans}>
          {[type?.label, ...meta].filter(Boolean).join(' · ')}
        </span>
        {workout.readiness_feel || workout.readiness_pain_score != null ? (
          <span className="mt-0.5 block truncate text-[12px] text-[#A09EA3]" style={sans}>
            {workout.readiness_feel ? `Felt ${workout.readiness_feel}` : null}
            {workout.readiness_feel && workout.readiness_pain_score != null ? ' · ' : null}
            {workout.readiness_pain_score != null ? (
              <span style={workout.readiness_pain_score >= 3 ? { color: PAIN_COLOR } : undefined}>
                Pain {workout.readiness_pain_score}/10
              </span>
            ) : null}
          </span>
        ) : null}
      </span>
      {band ? (
        <span className="flex shrink-0 flex-col items-end" title="Performance score: how you felt and the pain you reported">
          <span className="text-[15px] font-bold leading-none" style={{ ...display, color: PERFORMANCE_META[band].color }}>
            {score}
          </span>
          <span className="text-[10px] text-[#847E89]" style={sans}>{PERFORMANCE_META[band].label}</span>
        </span>
      ) : null}
      <ChevronRight size={16} className="shrink-0 text-[#6B6870] group-hover:text-white" />
    </Link>
  )
}

// ── Body check ────────────────────────────────

const PERIOD_TABS: SwipeTab<BodyCheckPeriod>[] = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
]

const PERIOD_COPY: Record<BodyCheckPeriod, { range: string; average: string; light: string; prev: string }> = {
  week: { range: 'Last 7 days', average: '4-week average', light: 'Light week', prev: 'prev week' },
  month: { range: 'Last 30 days', average: '4-month average', light: 'Light month', prev: 'prev month' },
}

function loadCopy(status: LoadStatus, period: BodyCheckPeriod): { label: string; hint: string; color: string } {
  const { average, light } = PERIOD_COPY[period]
  switch (status) {
    case 'none':
      return { label: 'No recent load', hint: 'Log a few sessions to see how your body is handling training.', color: '#847E89' }
    case 'light':
      return { label: light, hint: `Below your ${average} — good for recovery, or time to build back up.`, color: '#60A5FA' }
    case 'balanced':
      return { label: 'Balanced', hint: `In line with your ${average}. Keep it steady.`, color: '#4ADE80' }
    case 'high':
      return { label: 'High load', hint: `Well above your ${average} — watch for fatigue and plan recovery.`, color: '#FBBF24' }
  }
}

function BodyCheckCard({
  body,
  period,
  onPeriodChange,
}: {
  body: BodyCheck
  period: BodyCheckPeriod
  onPeriodChange: (period: BodyCheckPeriod) => void
}) {
  const copy = PERIOD_COPY[period]
  const load = loadCopy(body.loadStatus, period)
  const perf = body.avgPerformance == null ? null : Math.round(body.avgPerformance)
  const perfBand = performanceBand(perf)
  const perfDelta =
    perf != null && body.avgPerformancePrev != null ? perf - Math.round(body.avgPerformancePrev) : null
  // Within ±2 points reads as steady; a drop is flagged in the "poor" colour.
  const steady = perfDelta == null || Math.abs(perfDelta) <= 2
  const DeltaIcon = steady ? Minus : perfDelta > 0 ? ArrowUpRight : ArrowDownRight

  return (
    <section aria-label="Body check" className="rounded-2xl bg-[#1E1B1F] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-baseline gap-3">
          <h2 className="text-[14px] font-normal text-white" style={display}>Body check</h2>
          <span className="nh-label">{copy.range}</span>
        </span>
        <TabBar tabs={PERIOD_TABS} active={period} onChange={onPeriodChange} label="Body check period" compact />
      </div>

      <dl className="grid grid-cols-2 gap-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)]">
        {/* Load status */}
        <div className="col-span-2 flex flex-col gap-1 rounded-xl bg-[#181519] p-3 lg:col-span-1">
          <dt className="nh-label !text-[10px]">Training load</dt>
          <dd>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: load.color }} aria-hidden />
              <span className="text-[13px] font-semibold text-white" style={sans}>{load.label}</span>
              {body.loadRatio != null ? (
                <span className="ml-auto text-[12px] text-[#847E89]" style={sans}>{body.loadRatio.toFixed(2)}× avg</span>
              ) : null}
            </span>
            <p className="mt-1 text-[12px] leading-snug text-[#847E89]" style={sans}>{load.hint}</p>
          </dd>
        </div>

        <BodyStat label="Sessions" value={String(body.sessions)} sub={formatMinutes(body.minutes)} />
        <BodyStat label="Rest days" value={String(body.restDays)} sub={`of ${body.days}`} />

        <div className="col-span-2 flex items-center gap-3 rounded-xl bg-[#181519] p-3 lg:col-span-1">
          <div className="flex flex-1 flex-col gap-1">
            <dt className="nh-label !text-[10px]">Avg performance</dt>
            <dd className="flex items-baseline gap-2">
              <span
                className="text-[20px] font-bold leading-none"
                style={{ ...display, color: perfBand ? PERFORMANCE_META[perfBand].color : '#FFFFFF' }}
              >
                {perf ?? '–'}
              </span>
              <span className="text-[12px] text-[#847E89]" style={sans}>
                {perfBand
                  ? `${PERFORMANCE_META[perfBand].label} · ${body.ratedSessions} rated session${body.ratedSessions === 1 ? '' : 's'}`
                  : 'No rated sessions'}
              </span>
            </dd>
          </div>
          {perfDelta != null ? (
            <span
              className="flex shrink-0 items-center gap-0.5 text-[11px] text-[#847E89]"
              style={{ ...sans, ...(!steady ? { color: PERFORMANCE_META[perfDelta > 0 ? 'good' : 'poor'].color } : null) }}
            >
              <DeltaIcon size={12} />
              {steady ? 'Steady' : `${perfDelta > 0 ? '+' : ''}${perfDelta}`} vs {copy.prev}
            </span>
          ) : null}
        </div>
      </dl>
    </section>
  )
}

function BodyStat({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-[#181519] p-3">
      <dt className="nh-label !text-[10px]">{label}</dt>
      <dd className="flex flex-col gap-0.5">
        <span
          className="truncate text-[20px] font-bold leading-none text-white"
          style={display}
        >
          {value}
        </span>
        {sub ? <span className="text-[11px] text-[#847E89]" style={sans}>{sub}</span> : null}
      </dd>
    </div>
  )
}
