import Link from 'next/link'
import { Avatar } from './Avatar'
import { PillTag } from '@/app/components/ui/tags'

// ─────────────────────────────────────────────
// FEED CARD
// Displays a single public training log in the home feed.
// ─────────────────────────────────────────────

type ProfileRow = { name: string | null; username: string | null }

type FeedLog = {
  id: string
  title: string
  logged_date: string
  duration_minutes: number | null
  workout_log: string | null
  // Supabase returns joined rows as an array when the FK is via auth.users
  profiles: ProfileRow | ProfileRow[] | null
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function FeedCard({ log }: { log: FeedLog }) {
  const profile = Array.isArray(log.profiles) ? log.profiles[0] ?? null : log.profiles
  const displayName = profile?.name ?? profile?.username ?? 'Member'
  const username = profile?.username ?? null

  // Truncate workout_log preview to ~120 chars
  const preview = log.workout_log
    ? log.workout_log.length > 120
      ? log.workout_log.slice(0, 120).trimEnd() + '…'
      : log.workout_log
    : null

  return (
    <div className="border border-[#3A373C] bg-[#1A1719] p-5">
      {/* Header row */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar name={displayName} size="sm" />
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
        <PillTag label="Strength" variant="ghost-dark" size="sm" />
      </div>

      {/* Workout log preview */}
      {preview && (
        <p
          className="text-[13px] text-[#6B6870] leading-relaxed whitespace-pre-line"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {preview}
        </p>
      )}
    </div>
  )
}
