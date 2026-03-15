import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, fonts, commonStyles } from '../../constants/tokens';
import Avatar from '../../components/Avatar';
import PillTag from '../../components/PillTag';

type FeedItem = {
  id: string;
  title: string;
  logged_date: string;
  duration_minutes: number | null;
  workout_log: string | null;
  workout_types: string[];
  profiles: {
    username: string;
    name: string;
    avatar_url: string | null;
  } | null;
};

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

    const { data, error } = await supabase
      .from('training_logs')
      .select('id, title, logged_date, duration_minutes, workout_log, workout_types, profiles(username, name, avatar_url)')
      .eq('is_public', true)
      .order('logged_date', { ascending: false })
      .range(from, to);

    if (error || !data) return;

    setHasMore(data.length === PAGE_SIZE);
    setItems(prev => replace ? (data as FeedItem[]) : [...prev, ...(data as FeedItem[])]);
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
        renderItem={({ item }) => <FeedCard item={item} />}
      />
    </View>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const profile = item.profiles;
  const date = new Date(item.logged_date).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar
          name={profile?.name ?? profile?.username ?? '?'}
          photoUrl={profile?.avatar_url ?? null}
          size="sm"
        />
        <View style={styles.cardMeta}>
          <Text style={styles.cardName}>{profile?.name ?? profile?.username}</Text>
          <Text style={styles.cardDate}>{date}{item.duration_minutes ? ` · ${item.duration_minutes} min` : ''}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>

      {item.workout_types?.length > 0 && (
        <View style={styles.tags}>
          {item.workout_types.map(type => (
            <PillTag key={type} label={type} />
          ))}
        </View>
      )}

      {item.workout_log ? (
        <Text style={styles.cardLog} numberOfLines={3}>{item.workout_log}</Text>
      ) : null}
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
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardMeta: {
    flex: 1,
  },
  cardName: {
    fontSize: 13,
    fontFamily: fonts.bodyMed,
    color: colors.textPrimary,
  },
  cardDate: {
    fontSize: 11,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: fonts.heading,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cardLog: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
    lineHeight: 18,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 40,
  },
});
