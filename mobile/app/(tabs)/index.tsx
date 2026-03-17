import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, commonStyles } from '../../constants/tokens';
import FeedCard from '../../components/FeedCard';

type Log = {
  id: string;
  title: string;
  logged_date: string;
  duration_minutes: number | null;
  workout_log: string | null;
  workout_types: string[];
  user_id: string;
};

type Profile = {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
};

type FeedItem = Log & { profile: Profile | null };

const PAGE_SIZE = 20;

export default function HomeScreen() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async (pageIndex: number, replace: boolean) => {
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Step 1: fetch public training logs
    const { data: logs } = await supabase
      .from('training_logs')
      .select('id, title, logged_date, duration_minutes, workout_types, workout_log, user_id')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    const logList = logs ?? [];

    // Step 2: fetch profiles for those users
    // (FK goes through auth.users so PostgREST can't auto-join)
    const userIds = [...new Set(logList.map(l => l.user_id))];
    const { data: profilesData } = userIds.length > 0
      ? await supabase.from('profiles').select('id, name, username, avatar_url').in('id', userIds)
      : { data: [] };

    const profileMap = Object.fromEntries((profilesData ?? []).map(p => [p.id, p]));
    const combined: FeedItem[] = logList.map(l => ({ ...l, profile: profileMap[l.user_id] ?? null }));

    setHasMore(logList.length === PAGE_SIZE);
    setItems(prev => replace ? combined : [...prev, ...combined]);
  }, []);

  useEffect(() => {
    fetchFeed(0, true).finally(() => setLoading(false));
  }, [fetchFeed]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    await fetchFeed(0, true);
    setRefreshing(false);
  }, [fetchFeed]);

  const onEndReached = useCallback(async () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    await fetchFeed(next, false);
  }, [hasMore, loading, page, fetchFeed]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Community Feed</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          hasMore ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} /> : null
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No workouts yet. Be the first to log one!</Text>
        }
        renderItem={({ item }) => (
          <FeedCard
            id={item.id}
            title={item.title}
            logged_date={item.logged_date}
            duration_minutes={item.duration_minutes}
            workout_types={item.workout_types}
            workout_log={item.workout_log}
            profile={item.profile}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:  commonStyles.screen,
  centered:   commonStyles.centered,
  pageHeader: commonStyles.pageHeader,
  pageTitle:  commonStyles.pageHeaderTitle,
  list: {
    padding: 16,
    gap: 12,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    marginTop: 40,
  },
});
