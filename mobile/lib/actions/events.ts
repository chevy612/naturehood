import { supabase } from '../supabase';

export type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  event_time: string | null;
  max_capacity: number | null;
  confirmed_count: number;
  user_rsvp: boolean;
};

export async function fetchEvents(): Promise<Event[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date().toISOString().split('T')[0];

  const { data: eventsData } = await supabase
    .from('events')
    .select('id, title, description, location, event_date, event_time, max_capacity')
    .eq('status', 'published')
    .gte('event_date', today)
    .order('event_date', { ascending: true });

  if (!eventsData) return [];

  const { data: signupsData } = await supabase
    .from('event_signups')
    .select('event_id, user_id, status')
    .in('event_id', eventsData.map(e => e.id))
    .eq('status', 'confirmed');

  return eventsData.map(ev => {
    const signups = signupsData?.filter(s => s.event_id === ev.id) ?? [];
    return {
      ...ev,
      confirmed_count: signups.length,
      user_rsvp: signups.some(s => s.user_id === user?.id),
    };
  });
}

export async function rsvpEvent(
  event: Event
): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (event.user_rsvp) {
    const { error } = await supabase
      .from('event_signups')
      .update({ status: 'cancelled' })
      .eq('event_id', event.id)
      .eq('user_id', user.id);
    return { error: error?.message ?? null };
  }

  if (event.max_capacity !== null && event.confirmed_count >= event.max_capacity) {
    return { error: 'full' };
  }

  const { error } = await supabase
    .from('event_signups')
    .upsert({ event_id: event.id, user_id: user.id, status: 'confirmed' });
  return { error: error?.message ?? null };
}
