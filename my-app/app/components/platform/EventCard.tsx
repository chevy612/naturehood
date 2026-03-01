import Link from 'next/link'
import { PillTag } from '@/app/components/ui/tags'

// ─────────────────────────────────────────────
// EVENT CARD
// Displays a single event in the events list.
// ─────────────────────────────────────────────

type EventRow = {
  id: string
  title: string
  description: string | null
  location: string | null
  event_date: string
  event_time: string | null
  max_capacity: number | null
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    full: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  }
}

function formatTime(timeStr: string | null): string | null {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

export function EventCard({
  event,
  spotsLeft,
  userSignedUp,
}: {
  event: EventRow
  spotsLeft: number | null
  userSignedUp: boolean
}) {
  const date = formatEventDate(event.event_date)
  const time = formatTime(event.event_time)
  const full = spotsLeft !== null && spotsLeft <= 0

  return (
    <Link href={`/events/${event.id}`} className="block">
      <div className="flex gap-4 border border-[#3A373C] bg-[#1A1719] p-5 hover:border-[#C8F04D]/40 transition-colors duration-150">
        {/* Date block */}
        <div className="flex flex-col items-center justify-center shrink-0 w-14 h-14 bg-[#C8F04D]/10 border border-[#C8F04D]/20">
          <span
            className="text-[22px] font-bold leading-none text-[#C8F04D]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {date.day}
          </span>
          <span
            className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#C8F04D]/70 mt-0.5"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {date.month}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-[15px] font-bold text-white leading-snug mb-1"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}
          >
            {event.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
            {event.location && (
              <span
                className="text-[12px] text-[#6B6870]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {event.location}
              </span>
            )}
            {time && (
              <span
                className="text-[12px] text-[#6B6870]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {time}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {userSignedUp && (
              <PillTag label="Signed up" variant="accent" size="sm" />
            )}
            {full && !userSignedUp && (
              <PillTag label="Full" variant="ghost-dark" size="sm" />
            )}
            {!full && spotsLeft !== null && spotsLeft <= 10 && !userSignedUp && (
              <PillTag label={`${spotsLeft} spots left`} variant="ghost-green" size="sm" />
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
