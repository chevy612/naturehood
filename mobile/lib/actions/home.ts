import { supabase } from '../supabase';

export type Log = {
  id: string;
  title: string;
  logged_date: string;
  duration_minutes: number | null;
  workout_log: string | null;
  workout_types: string[];
  user_id: string;
};

export type FeedProfile = {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
};

export type FeedItem = Log & { profile: FeedProfile | null };

const PAGE_SIZE = 20;

export async function fetchFeed(
  pageIndex: number
): Promise<{ items: FeedItem[]; hasMore: boolean }> {
  const from = pageIndex * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: logs } = await supabase
    .from('training_logs')
    .select('id, title, logged_date, duration_minutes, workout_types, workout_log, user_id')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  const logList = logs ?? [];
  const userIds = [...new Set(logList.map(l => l.user_id))];

  const { data: profilesData } = userIds.length > 0
    ? await supabase.from('profiles').select('id, name, username, avatar_url').in('id', userIds)
    : { data: [] };

  const profileMap = Object.fromEntries((profilesData ?? []).map(p => [p.id, p]));
  const items: FeedItem[] = logList.map(l => ({ ...l, profile: profileMap[l.user_id] ?? null }));

  return { items, hasMore: logList.length === PAGE_SIZE };
}
