import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors, commonStyles } from '../../../constants/tokens';
import FeedCard from '../../../components/FeedCard';
import { fetchFeed, type FeedItem } from '../../../lib/actions/home';

export default function HomeScreen() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(async (pageIndex: number, replace: boolean) => {
    const { items: newItems, hasMore: more } = await fetchFeed(pageIndex);
    setHasMore(more);
    setItems(prev => replace ? newItems : [...prev, ...newItems]);
  }, []);

  useEffect(() => {
    loadPage(0, true).finally(() => setLoading(false));
  }, [loadPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    await loadPage(0, true);
    setRefreshing(false);
  }, [loadPage]);

  const onEndReached = useCallback(async () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    await loadPage(next, false);
  }, [hasMore, loading, page, loadPage]);

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
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
