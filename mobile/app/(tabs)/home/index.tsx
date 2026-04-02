import { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { commonStyles } from '../../../constants/tokens';
import FeedCard from '../../../components/FeedCard';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import PageHeader from '../../../components/ui/PageHeader';
import LoadingFooter from '../../../components/ui/LoadingFooter';
import EmptyState from '../../../components/ui/EmptyState';
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
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <PageHeader title="Community Feed" />

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={<LoadingFooter visible={hasMore} />}
        ListEmptyComponent={
          <EmptyState message="No workouts yet. Be the first to log one!" />
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
  container: commonStyles.screen,
  list: {
    padding: 16,
    gap: 12,
  },
});
