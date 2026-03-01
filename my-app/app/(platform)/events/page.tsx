import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventCard } from '@/app/components/platform/EventCard'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: events } = await supabase
    .from('events')
    .select('id, title, description, location, event_date, event_time, max_capacity')
    .eq('status', 'published')
    .gte('event_date', today)
    .order('event_date', { ascending: true })

  const eventList = events ?? []

  // Fetch user's signups for this set of events
  const eventIds = eventList.map((e) => e.id)
  const { data: mySignups } = eventIds.length > 0
    ? await supabase
        .from('event_signups')
        .select('event_id, status')
        .eq('user_id', user.id)
        .in('event_id', eventIds)
    : { data: [] }

  const signedUpSet = new Set(
    (mySignups ?? []).filter((s) => s.status === 'confirmed').map((s) => s.event_id)
  )

  // Fetch confirmed counts for all events
  const countMap: Record<string, number> = {}
  if (eventIds.length > 0) {
    const { data: counts } = await supabase
      .from('event_signups')
      .select('event_id')
      .in('event_id', eventIds)
      .eq('status', 'confirmed')

    for (const row of counts ?? []) {
      countMap[row.event_id] = (countMap[row.event_id] ?? 0) + 1
    }
  }

  return (
    <div className="min-h-screen bg-[#141115] px-4 py-10">
      <div className="max-w-2xl mx-auto">

        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-10"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Events
        </p>

        {eventList.length === 0 ? (
          <p
            className="text-[14px] text-[#6B6870] py-16 text-center"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            No upcoming events. Check back soon.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {eventList.map((event) => {
              const confirmedCount = countMap[event.id] ?? 0
              const spotsLeft = event.max_capacity !== null
                ? event.max_capacity - confirmedCount
                : null

              return (
                <EventCard
                  key={event.id}
                  event={event}
                  spotsLeft={spotsLeft}
                  userSignedUp={signedUpSet.has(event.id)}
                />
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
