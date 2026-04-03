import { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
} from 'react-native';
import { FeedCard } from '@/components/feed-card';
import { LoadingScreen } from '@/components/loading/loading-screen';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingFooter } from '@/components/loading/loading-footer';
import { Text } from '@/components/ui/text';
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
    <View className="flex-1 bg-background">
      <PageHeader title="Community Feed" />

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={<LoadingFooter visible={hasMore} />}
        ListEmptyComponent={
          <Text variant="muted" className="text-center mt-10">No workouts yet. Be the first to log one!</Text>
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
