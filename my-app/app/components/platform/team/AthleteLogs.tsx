'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Dumbbell, Lock, MessageCircle, Utensils } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { SwipePanel, TabBar, type SwipeTab } from '@/app/components/platform/team/SwipeTabs'
import { EmptyCard, ScopePills, TeamLoading } from '@/app/components/platform/team/shared'
import { MealPostCard } from '@/app/components/platform/social/MealPostCard'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { WorkoutAttachmentCard } from '@/app/components/platform/social/WorkoutAttachmentCard'
import { ButtonSmall } from '@/app/components/ui/buttons'
import { LogoSpinner } from '@/app/components/ui/logo-spinner'
import {
  LOG_PAGE_SIZE,
  fetchAcceptedAccess,
  fetchLogCommentCounts,
  fetchPeerProfile,
  fetchSharedMeals,
  fetchSharedWorkouts,
  teamErrorMessage,
} from '@/lib/team/browser'
import { sans, display } from '@/lib/social/format'
import type { LogType, PeerProfile, ShareScope, SharedMeal, SharedWorkout } from '@/lib/team/types'

type Section = 'workouts' | 'meals'

function errorText(error: unknown, fallback: string) {
  return teamErrorMessage(error instanceof Error ? error : null, fallback)
}

function LogCard({
  logType,
  logId,
  athleteId,
  commentCount,
  caption,
  children,
}: {
  logType: LogType
  logId: string
  athleteId: string
  commentCount: number
  caption?: string
  children: React.ReactNode
}) {
  return (
    <li className="relative flex flex-col gap-2" data-testid={`team-log-${logType}`}>
      {caption ? <p className="px-1 text-[11px] text-[#6B6870]" style={sans}>{caption}</p> : null}
      <Link
        href={`/my-team/athletes/${athleteId}/logs/${logType}/${logId}`}
        aria-label={`Open ${logType} log`}
        className="block rounded-2xl transition-opacity hover:opacity-90"
      >
        {children}
      </Link>
      <p className="flex items-center gap-1.5 px-1 text-[12px] text-[#A09EA3]" style={sans}>
        <MessageCircle size={13} />
        {commentCount > 0 ? `${commentCount} comment${commentCount === 1 ? '' : 's'}` : 'No comments yet'}
      </p>
    </li>
  )
}

function LockedState({ label, name }: { label: string; name: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#3A373C] px-6 py-12 text-center" data-testid="team-locked">
      <Lock size={22} className="mb-3 text-[#6B6870]" />
      <p className="text-[14px] font-semibold text-white" style={sans}>{label} are not shared</p>
      <p className="mt-1 max-w-xs text-[13px] text-[#6B6870]" style={sans}>
        {name} has not shared their {label.toLowerCase()} with you. Ask them to turn it on from their Sharing tab.
      </p>
    </div>
  )
}

function formatMealDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function AthleteLogs({ athleteId }: { athleteId: string }) {
  const [profile, setProfile] = useState<PeerProfile | null>(null)
  const [access, setAccess] = useState<ShareScope | null>(null)
  const [booting, setBooting] = useState(true)
  const [bootError, setBootError] = useState<string | null>(null)
  const [section, setSection] = useState<Section>('workouts')

  const [workouts, setWorkouts] = useState<SharedWorkout[]>([])
  const [workoutsDone, setWorkoutsDone] = useState(false)
  const [workoutsLoading, setWorkoutsLoading] = useState(false)
  const [workoutsError, setWorkoutsError] = useState<string | null>(null)

  const [meals, setMeals] = useState<SharedMeal[]>([])
  const [mealsDone, setMealsDone] = useState(false)
  const [mealsLoading, setMealsLoading] = useState(false)
  const [mealsError, setMealsError] = useState<string | null>(null)
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchPeerProfile(athleteId), fetchAcceptedAccess(athleteId)])
      .then(([peer, scope]) => {
        if (cancelled) return
        setProfile(peer)
        setAccess(scope)
        if (scope && !scope.shareWorkouts && scope.shareMeals) setSection('meals')
      })
      .catch((error) => {
        if (!cancelled) setBootError(errorText(error, 'Could not load this Athlete.'))
      })
      .finally(() => {
        if (!cancelled) setBooting(false)
      })
    return () => {
      cancelled = true
    }
  }, [athleteId])

  const loadWorkouts = useCallback(async (offset: number) => {
    setWorkoutsLoading(true)
    setWorkoutsError(null)
    try {
      const page = await fetchSharedWorkouts(athleteId, offset)
      fetchLogCommentCounts('workout', page.map((item) => item.id))
        .then((counts) => setCommentCounts((current) => ({ ...current, ...counts })))
        .catch(() => undefined)
      setWorkouts((current) => (offset === 0 ? page : [...current, ...page]))
      setWorkoutsDone(page.length < LOG_PAGE_SIZE)
    } catch (error) {
      setWorkoutsError(errorText(error, 'Could not load workouts.'))
    } finally {
      setWorkoutsLoading(false)
    }
  }, [athleteId])

  const loadMeals = useCallback(async (offset: number) => {
    setMealsLoading(true)
    setMealsError(null)
    try {
      const page = await fetchSharedMeals(athleteId, offset)
      fetchLogCommentCounts('meal', page.map((item) => item.id))
        .then((counts) => setCommentCounts((current) => ({ ...current, ...counts })))
        .catch(() => undefined)
      setMeals((current) => (offset === 0 ? page : [...current, ...page]))
      setMealsDone(page.length < LOG_PAGE_SIZE)
    } catch (error) {
      setMealsError(errorText(error, 'Could not load meals.'))
    } finally {
      setMealsLoading(false)
    }
  }, [athleteId])

  useEffect(() => {
    if (!access) return
    if (access.shareWorkouts) void loadWorkouts(0)
    if (access.shareMeals) void loadMeals(0)
  }, [access, loadWorkouts, loadMeals])

  const sectionTabs: SwipeTab<Section>[] = [
    { id: 'workouts', label: 'Workouts', icon: access?.shareWorkouts ? <Dumbbell size={14} /> : <Lock size={14} /> },
    { id: 'meals', label: 'Meals', icon: access?.shareMeals ? <Utensils size={14} /> : <Lock size={14} /> },
  ]

  const name = profile?.username ? `@${profile.username}` : 'This Athlete'

  return (
    <div className="min-h-screen bg-[#141115] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/my-team/tracking"
          className="mb-6 inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#A09EA3] hover:text-white"
          style={sans}
        >
          <ChevronLeft size={16} /> Tracking
        </Link>

        {booting ? <TeamLoading /> : null}
        {!booting && bootError ? <StatusMessage tone="error">{bootError}</StatusMessage> : null}

        {!booting && !bootError && !access ? (
          <EmptyCard
            title="You are not tracking this Athlete"
            body="You can only see logs of Athletes who invited you or sent you a share link, and whose share is still active."
          />
        ) : null}

        {!booting && !bootError && access ? (
          <>
            <header className="mb-6 flex items-center gap-4">
              <Avatar name={profile?.name?.trim() || profile?.username || '?'} photoUrl={profile?.avatar_url} size="lg" />
              <div className="min-w-0">
                <h1 className="truncate text-[22px] font-bold text-white" style={display}>{name}</h1>
                {profile?.name && profile.name !== profile.username ? (
                  <p className="truncate text-[13px] text-[#6B6870]" style={sans}>{profile.name}</p>
                ) : null}
                <div className="mt-2"><ScopePills scope={access} /></div>
              </div>
            </header>

            <TabBar tabs={sectionTabs} active={section} onChange={setSection} label="Log type" />

            <SwipePanel tabs={sectionTabs} active={section} onChange={setSection}>
            {section === 'workouts' ? (
              !access.shareWorkouts ? (
                <LockedState label="Workout logs" name={name} />
              ) : workoutsLoading && workouts.length === 0 ? (
                <TeamLoading />
              ) : workoutsError && workouts.length === 0 ? (
                <StatusMessage tone="error">{workoutsError}</StatusMessage>
              ) : workouts.length === 0 ? (
                <EmptyCard title="No workouts yet" body={`${name} has not logged any workouts.`} />
              ) : (
                <>
                  <ul className="flex flex-col gap-6">
                    {workouts.map((workout) => (
                      <LogCard key={workout.id} logType="workout" logId={workout.id} athleteId={athleteId} commentCount={commentCounts[workout.id] ?? 0}>
                        <WorkoutAttachmentCard workout={workout} />
                      </LogCard>
                    ))}
                  </ul>
                  {workoutsError ? <StatusMessage tone="error">{workoutsError}</StatusMessage> : null}
                  {!workoutsDone ? (
                    <div className="mt-6 flex justify-center">
                      <ButtonSmall disabled={workoutsLoading} onClick={() => void loadWorkouts(workouts.length)}>
                        {workoutsLoading ? <LogoSpinner size={22} /> : 'Load more'}
                      </ButtonSmall>
                    </div>
                  ) : null}
                </>
              )
            ) : !access.shareMeals ? (
              <LockedState label="Meal logs" name={name} />
            ) : mealsLoading && meals.length === 0 ? (
              <TeamLoading />
            ) : mealsError && meals.length === 0 ? (
              <StatusMessage tone="error">{mealsError}</StatusMessage>
            ) : meals.length === 0 ? (
              <EmptyCard title="No meals yet" body={`${name} has not logged any meals.`} />
            ) : (
              <>
                <ul className="flex flex-col gap-6">
                  {meals.map((meal) => (
                    <LogCard key={meal.id} logType="meal" logId={meal.id} athleteId={athleteId} commentCount={commentCounts[meal.id] ?? 0} caption={formatMealDate(meal.created_at)}>
                      <MealPostCard meal={meal} />
                    </LogCard>
                  ))}
                </ul>
                {mealsError ? <StatusMessage tone="error">{mealsError}</StatusMessage> : null}
                {!mealsDone ? (
                  <div className="mt-6 flex justify-center">
                    <ButtonSmall disabled={mealsLoading} onClick={() => void loadMeals(meals.length)}>
                      {mealsLoading ? <LogoSpinner size={22} /> : 'Load more'}
                    </ButtonSmall>
                  </div>
                ) : null}
              </>
            )}
            </SwipePanel>
          </>
        ) : null}
      </div>
    </div>
  )
}
