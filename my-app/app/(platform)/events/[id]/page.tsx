import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PillTag } from '@/app/components/ui/tags'
import { InfoBox } from '@/app/components/ui/notification'
import RsvpButtons from './RsvpButtons'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function formatTime(timeStr: string | null): string | null {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (!event) notFound()

  // User's signup state
  const { data: mySignup } = await supabase
    .from('event_signups')
    .select('status')
    .eq('event_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  // Confirmed count
  const { count: confirmedCount } = await supabase
    .from('event_signups')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)
    .eq('status', 'confirmed')

  const confirmed = confirmedCount ?? 0
  const spotsLeft = event.max_capacity !== null ? event.max_capacity - confirmed : null
  const isFull = spotsLeft !== null && spotsLeft <= 0
  const userSignedUp = mySignup?.status === 'confirmed'
  const time = formatTime(event.event_time)

  return (
    <div className="min-h-screen bg-[#141115] px-4 py-10">
      <div className="max-w-2xl mx-auto">

        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-10"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Event
        </p>

        {/* Title */}
        <h1
          className="text-[28px] font-bold text-white leading-tight mb-6"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
        >
          {event.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
          <div>
            <p
              className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#6B6870] mb-0.5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Date
            </p>
            <p
              className="text-[14px] text-white"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {formatDate(event.event_date)}
            </p>
          </div>

          {time && (
            <div>
              <p
                className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#6B6870] mb-0.5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Time
              </p>
              <p
                className="text-[14px] text-white"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {time}
              </p>
            </div>
          )}

          {event.location && (
            <div>
              <p
                className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#6B6870] mb-0.5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Location
              </p>
              <p
                className="text-[14px] text-white"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {event.location}
              </p>
            </div>
          )}
        </div>

        {/* Capacity status */}
        {event.max_capacity !== null && (
          <div className="mb-6">
            {userSignedUp ? (
              <PillTag label="You're signed up" variant="accent" size="sm" />
            ) : isFull ? (
              <PillTag label="Fully booked" variant="ghost-dark" size="sm" />
            ) : spotsLeft !== null && spotsLeft <= 10 ? (
              <PillTag label={`${spotsLeft} spots remaining`} variant="ghost-green" size="sm" />
            ) : (
              <PillTag label={`${event.max_capacity} capacity`} variant="ghost-dark" size="sm" />
            )}
          </div>
        )}

        {/* Description */}
        {event.description && (
          <p
            className="text-[15px] text-[#A09EA3] leading-relaxed mb-8"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {event.description}
          </p>
        )}

        {/* Full event notice */}
        {isFull && !userSignedUp && (
          <InfoBox color="red" className="mb-6">
            This event is fully booked and not accepting new sign-ups.
          </InfoBox>
        )}

        {/* RSVP / Cancel buttons */}
        <RsvpButtons
          eventId={id}
          userSignedUp={userSignedUp}
          isFull={isFull}
        />

      </div>
    </div>
  )
}
