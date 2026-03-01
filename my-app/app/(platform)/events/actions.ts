'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function rsvpEvent(
  eventId: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify event is published
  const { data: event } = await supabase
    .from('events')
    .select('id, max_capacity, status')
    .eq('id', eventId)
    .eq('status', 'published')
    .single()

  if (!event) return { error: 'Event not found.' }

  // Capacity check
  if (event.max_capacity !== null) {
    const { count } = await supabase
      .from('event_signups')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'confirmed')

    if ((count ?? 0) >= event.max_capacity) {
      return { error: 'This event is fully booked.' }
    }
  }

  const { error } = await supabase
    .from('event_signups')
    .upsert(
      { event_id: eventId, user_id: user.id, status: 'confirmed' },
      { onConflict: 'event_id,user_id' }
    )

  if (error) return { error: 'Failed to sign up. Please try again.' }

  return { success: true }
}

export async function cancelRsvp(
  eventId: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('event_signups')
    .update({ status: 'cancelled' })
    .eq('event_id', eventId)
    .eq('user_id', user.id)

  if (error) return { error: 'Failed to cancel. Please try again.' }

  return { success: true }
}
