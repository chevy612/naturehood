'use client'

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import {
  ArrowDownRight, ArrowUpRight, Bandage, ChevronRight, Dumbbell, HeartPulse, Minus, Plus,
  Shield, Shuffle, Stethoscope, Trophy, Waves, Zap, type LucideIcon,
} from 'lucide-react'
import { TrainingCalendar } from '@/app/components/platform/dashboard/TrainingCalendar'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { fetchMealsInRange } from '@/lib/meals/browser'
import { dateKey, formatDayHeading, sumMacros, todayDateKey } from '@/lib/meals/utils'
import type { MealListItem } from '@/lib/meals/types'
import { display, sans } from '@/lib/social/format'
import type { PerceivedIntensity, SessionType } from '@/lib/types'
import {
  CATEGORY_META,
  PAIN_COLOR,
  bodyCheck,
  daysInMonth,
  firstOfMonth,
  formatMinutes,
  groupByDate,
  monthOf,
  shiftMonth,
  weeklyStreak,
  workoutCategory,
  type BodyCheck,
  type DashboardWorkout,
  type LoadStatus,
} from '@/lib/dashboard/utils'

// ─────────────────────────────────────────────
// PERSONAL DASHBOARD (client)
//   Month stats · training calendar · selected-day detail · body check.
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
  const body = useMemo(() => bodyCheck(workouts, today), [workouts, today])

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

        <div className="flex flex-col gap-4">
          <DayDetail
            dateKey={selectedDate}
            workouts={workoutsByDate.get(selectedDate) ?? []}
            meals={mealsByDate.get(selectedDate) ?? []}
            mealsLoaded={!!mealsByMonth[monthOf(selectedDate)]}
            today={today}
          />
          <BodyCheckCard body={body} />
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
      <ChevronRight size={16} className="shrink-0 text-[#6B6870] group-hover:text-white" />
    </Link>
  )
}

// ── Body check ────────────────────────────────

const LOAD_COPY: Record<LoadStatus, { label: string; hint: string; color: string }> = {
  none: { label: 'No recent load', hint: 'Log a few sessions to see how your body is handling training.', color: '#847E89' },
  light: { label: 'Light week', hint: 'Below your 4-week average — good for recovery, or time to build back up.', color: '#60A5FA' },
  balanced: { label: 'Balanced', hint: 'In line with your 4-week average. Keep it steady.', color: '#4ADE80' },
  high: { label: 'High load', hint: 'Well above your 4-week average — watch for fatigue and plan recovery.', color: '#FBBF24' },
}

function BodyCheckCard({ body }: { body: BodyCheck }) {
  const load = LOAD_COPY[body.loadStatus]
  const painDelta =
    body.avgPain7d != null && body.avgPainPrev7d != null ? body.avgPain7d - body.avgPainPrev7d : null
  const PainIcon = painDelta == null || Math.abs(painDelta) < 0.25 ? Minus : painDelta > 0 ? ArrowUpRight : ArrowDownRight

  return (
    <section aria-label="Body check" className="rounded-2xl bg-[#1E1B1F] p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[14px] font-normal text-white" style={display}>Body check</h2>
        <span className="nh-label">Last 7 days</span>
      </div>

      {/* Load status */}
      <div className="mb-3 rounded-xl bg-[#181519] p-3">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: load.color }} aria-hidden />
          <span className="text-[13px] font-semibold text-white" style={sans}>{load.label}</span>
          {body.loadRatio != null ? (
            <span className="ml-auto text-[12px] text-[#847E89]" style={sans}>{body.loadRatio.toFixed(2)}× avg</span>
          ) : null}
        </span>
        <p className="mt-1 text-[12px] leading-snug text-[#847E89]" style={sans}>{load.hint}</p>
      </div>

      <dl className="grid grid-cols-2 gap-2">
        <BodyStat label="Sessions" value={String(body.sessions7d)} sub={formatMinutes(body.acuteMinutes)} />
        <BodyStat label="Rest days" value={String(body.restDays7d)} sub="of 7" />
        <BodyStat
          label="Avg pain"
          value={body.avgPain7d == null ? '–' : body.avgPain7d.toFixed(1)}
          sub={
            painDelta == null ? 'out of 10' : (
              <span className="flex items-center gap-0.5" style={painDelta > 0.25 ? { color: PAIN_COLOR } : undefined}>
                <PainIcon size={12} /> vs prev week
              </span>
            )
          }
        />
        <BodyStat label="Last feel" value={body.latestFeel ?? '–'} sub={body.latestFeelDate ? formatDayHeading(body.latestFeelDate).split(',')[0] : ''} small />
      </dl>
    </section>
  )
}

function BodyStat({ label, value, sub, small }: { label: string; value: string; sub?: React.ReactNode; small?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-[#181519] p-3">
      <dt className="nh-label !text-[10px]">{label}</dt>
      <dd className="flex flex-col gap-0.5">
        <span
          className={`truncate font-bold capitalize text-white ${small ? 'text-[15px]' : 'text-[20px] leading-none'}`}
          style={display}
        >
          {value}
        </span>
        {sub ? <span className="text-[11px] text-[#847E89]" style={sans}>{sub}</span> : null}
      </dd>
    </div>
  )
}
