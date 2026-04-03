import { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors } from '../../../constants/tokens';
import { fetchEvents, rsvpEvent, type Event } from '../../../lib/actions/events';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingScreen } from '@/components/loading/loading-screen';

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rsvping, setRsvping] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    const data = await fetchEvents();
    setEvents(data);
  }, []);

  useEffect(() => {
    loadEvents().finally(() => setLoading(false));
  }, [loadEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  async function handleRsvp(event: Event) {
    setRsvping(event.id);
    const { error } = await rsvpEvent(event);

    if (error === 'full') {
      Alert.alert('Event Full', 'This event has reached capacity.');
    } else if (error) {
      Alert.alert('Error', error);
    }

    await loadEvents();
    setRsvping(null);
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      <PageHeader title="Events" />

      <FlatList
        data={events}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          <Text variant="muted" className="text-center mt-10">No upcoming events right now.</Text>
        }
        renderItem={({ item }) => {
          const isFull = item.max_capacity !== null && item.confirmed_count >= item.max_capacity && !item.user_rsvp;
          const spotsLeft = item.max_capacity !== null ? item.max_capacity - item.confirmed_count : null;
          const date = new Date(item.event_date).toLocaleDateString('en-AU', {
            weekday: 'short', day: 'numeric', month: 'short',
          });

          return (
            <Card>
              <CardContent className="gap-2">
                <View className="flex-row justify-between items-center">
                  <Text variant="muted" className="text-[11px]">
                    {date}{item.event_time ? ` · ${item.event_time.slice(0, 5)}` : ''}
                  </Text>
                  {spotsLeft !== null && (
                    <Text className={`text-[11px] ${isFull ? 'text-destructive' : 'text-primary'}`}>
                      {isFull ? 'Full' : `${spotsLeft} spots left`}
                    </Text>
                  )}
                </View>

                <Text variant="large">{item.title}</Text>

                {item.location && (
                  <View className="flex-row items-center gap-1">
                    <MapPin size={12} color={colors.textMuted} />
                    <Text variant="muted" className="text-xs">{item.location}</Text>
                  </View>
                )}

                {item.description && (
                  <Text variant="muted" className="text-xs leading-relaxed" numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                <Button
                  variant={item.user_rsvp ? 'default' : 'outline'}
                  size="sm"
                  disabled={isFull || rsvping === item.id}
                  onPress={() => handleRsvp(item)}
                  className="mt-1"
                >
                  {rsvping === item.id ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text>{item.user_rsvp ? 'Cancel RSVP' : isFull ? 'Event Full' : 'Sign Up'}</Text>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        }}
      />
    </View>
  );
}
