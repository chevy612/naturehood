'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar } from './Avatar'
import { PillTag } from '@/app/components/ui/tags'

// ─────────────────────────────────────────────
// FEED CARD
// Displays a single public training log in the home feed.
// ─────────────────────────────────────────────

type ProfileRow = { name: string | null; username: string | null; avatar_url: string | null }

type FeedLog = {
  id: string
  title: string
  logged_date: string
  duration_minutes: number | null
  workout_types: string[] | null
  workout_log: string | null
  profiles: ProfileRow | null
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function FeedCard({ log }: { log: FeedLog }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const profile = log.profiles
  const displayName = profile?.name ?? profile?.username ?? 'Member'
  const username = profile?.username ?? null
  const isTruncated = (log.workout_log?.length ?? 0) > 120

  const preview = log.workout_log
    ? isExpanded
      ? log.workout_log
      : log.workout_log.length > 120
        ? log.workout_log.slice(0, 120).trimEnd() + '…'
        : log.workout_log
    : null

  return (
    <div className="border border-[#3A373C] bg-[#1A1719] p-5">
      {/* Header row */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar name={displayName} size="sm" photoUrl={profile?.avatar_url ?? null} />
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] font-semibold text-white leading-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {displayName}
          </p>
          {username && (
            <Link
              href={`/${username}`}
              className="text-[11px] text-[#6B6870] hover:text-[#A09EA3] transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              @{username}
            </Link>
          )}
        </div>
        <span
          className="text-[11px] text-[#6B6870] shrink-0 pt-0.5"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {formatDate(log.logged_date)}
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-[15px] font-bold text-white mb-3 leading-snug"
        style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}
      >
        {log.title}
      </h3>

      {/* Pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {log.duration_minutes && (
          <PillTag label={`${log.duration_minutes} min`} variant="ghost-green" size="sm" />
        )}
        {log.workout_types?.map((type) => (
          <PillTag key={type} label={type} variant="ghost-dark" size="sm" />
        ))}
      </div>

      {/* Workout log preview / full */}
      {preview && (
        <p
          className="text-[13px] text-[#6B6870] leading-relaxed whitespace-pre-line"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {preview}
        </p>
      )}

      {isTruncated && (
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="mt-2 text-[11px] font-medium text-[#C8F04D] hover:text-white transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {isExpanded ? 'Show less' : 'See more'}
        </button>
      )}
    </div>
  )
}
