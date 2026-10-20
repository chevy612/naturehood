'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { LogCommentsPanel } from '@/app/components/platform/team/LogCommentsPanel'
import { SwipePanel, TabBar, type SwipeTab } from '@/app/components/platform/team/SwipeTabs'
import { EmptyCard, TeamLoading } from '@/app/components/platform/team/shared'
import { MealPostCard } from '@/app/components/platform/social/MealPostCard'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { WorkoutAttachmentCard } from '@/app/components/platform/social/WorkoutAttachmentCard'
import { sans } from '@/lib/social/format'
import { fetchCurrentUserId, fetchPeerProfile, fetchSharedMeal, fetchSharedWorkout, teamErrorMessage } from '@/lib/team/browser'
import type { LogType, PeerProfile, SharedMeal, SharedWorkout } from '@/lib/team/types'

type DetailTab = 'details' | 'comments'

function formatDateTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function LogDetail({
  athleteId,
  logType,
  logId,
  initialTab = 'details',
}: {
  athleteId: string
  logType: LogType
  logId: string
  initialTab?: DetailTab
}) {
  const [tab, setTab] = useState<DetailTab>(initialTab)
  const [commentCount, setCommentCount] = useState<number | null>(null)
  const [workout, setWorkout] = useState<SharedWorkout | null>(null)
  const [meal, setMeal] = useState<SharedMeal | null>(null)
  const [athlete, setAthlete] = useState<PeerProfile | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      logType === 'workout' ? fetchSharedWorkout(logId) : Promise.resolve(null),
      logType === 'meal' ? fetchSharedMeal(logId) : Promise.resolve(null),
      fetchPeerProfile(athleteId),
      fetchCurrentUserId(),
    ])
      .then(([nextWorkout, nextMeal, profile, userId]) => {
        if (cancelled) return
        setWorkout(nextWorkout)
        setMeal(nextMeal)
        setAthlete(profile)
        setIsOwner(userId === athleteId)
        setError(null)
      })
      .catch((loadError) => {
        if (!cancelled) setError(teamErrorMessage(loadError instanceof Error ? loadError : null, 'Could not load this log.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [athleteId, logType, logId])

  const found = logType === 'workout' ? workout : meal
  const name = athlete?.username ? `@${athlete.username}` : 'this Athlete'
  const tabs: SwipeTab<DetailTab>[] = [
    { id: 'details', label: 'Details' },
    { id: 'comments', label: commentCount ? `Comments (${commentCount})` : 'Comments' },
  ]

  return (
    <div className="min-h-screen bg-[#141115] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href={isOwner ? '/my-team/message' : `/my-team/athletes/${athleteId}`}
          className="mb-6 inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#A09EA3] hover:text-white"
          style={sans}
        >
          <ChevronLeft size={16} /> {isOwner ? 'Messages' : name}
        </Link>

        {loading ? <TeamLoading /> : null}
        {!loading && error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {!loading && !error && !found ? (
          <EmptyCard
            title="This log is not available"
            body="It may have been deleted, or it is no longer shared with you."
          />
        ) : null}

        {!loading && !error && found ? (
          <>
            <p className="mb-1 text-[11px] text-[#6B6870]" style={sans}>
              {logType === 'workout' ? 'Workout' : 'Meal'} · {formatDateTime(found.created_at)}
            </p>
            <TabBar tabs={tabs} active={tab} onChange={setTab} label="Log sections" />
            <SwipePanel tabs={tabs} active={tab} onChange={setTab}>
              <div hidden={tab !== 'details'} data-testid="log-details">
                {workout ? <WorkoutAttachmentCard workout={workout} expanded /> : null}
                {meal ? (
                  <div className="flex flex-col gap-3">
                    <MealPostCard meal={meal} />
                    {meal.notes ? (
                      <p className="whitespace-pre-wrap rounded-2xl bg-[#1E1B1F] p-3 text-[13px] text-[#A09EA3]" style={sans}>{meal.notes}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div hidden={tab !== 'comments'}>
                <LogCommentsPanel logType={logType} logId={logId} athleteId={athleteId} onCountChange={setCommentCount} />
              </div>
            </SwipePanel>
          </>
        ) : null}
      </div>
    </div>
  )
}
