import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors, fonts } from '../../../constants/tokens';
import { fetchEvents, rsvpEvent, type Event } from '../../../lib/actions/events';

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
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Events</Text>
      </View>

      <FlatList
        data={events}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No upcoming events right now.</Text>
        }
        renderItem={({ item }) => {
          const isFull = item.max_capacity !== null && item.confirmed_count >= item.max_capacity && !item.user_rsvp;
          const spotsLeft = item.max_capacity !== null ? item.max_capacity - item.confirmed_count : null;
          const date = new Date(item.event_date).toLocaleDateString('en-AU', {
            weekday: 'short', day: 'numeric', month: 'short',
          });

          return (
            <View style={styles.card}>
              <View style={styles.cardMeta}>
                <Text style={styles.cardDate}>{date}{item.event_time ? ` · ${item.event_time.slice(0, 5)}` : ''}</Text>
                {spotsLeft !== null && (
                  <Text style={[styles.spots, isFull && styles.spotsRed]}>
                    {isFull ? 'Full' : `${spotsLeft} spots left`}
                  </Text>
                )}
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>

              {item.location && (
                <View style={styles.row}>
                  <MapPin size={12} color={colors.textMuted} />
                  <Text style={styles.cardSub}>{item.location}</Text>
                </View>
              )}

              {item.description && (
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              )}

              <TouchableOpacity
                style={[
                  styles.rsvpBtn,
                  item.user_rsvp && styles.rsvpBtnActive,
                  isFull && styles.rsvpBtnDisabled,
                ]}
                onPress={() => handleRsvp(item)}
                disabled={isFull || rsvping === item.id}
                activeOpacity={0.8}
              >
                {rsvping === item.id ? (
                  <ActivityIndicator size="small" color={item.user_rsvp ? colors.background : colors.textPrimary} />
                ) : (
                  <Text style={[styles.rsvpText, item.user_rsvp && styles.rsvpTextActive]}>
                    {item.user_rsvp ? 'Cancel RSVP' : isFull ? 'Event Full' : 'Sign Up'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: { fontSize: 13, fontFamily: fonts.heading, color: colors.textPrimary, letterSpacing: -0.1 },
  list: { padding: 16, gap: 12 },
  empty: { textAlign: 'center', color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, marginTop: 40 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: 11, fontFamily: fonts.bodyMed, color: colors.textMuted },
  spots: { fontSize: 11, fontFamily: fonts.body, color: colors.accent },
  spotsRed: { color: colors.error },
  cardTitle: { fontSize: 16, fontFamily: fonts.heading, color: colors.textPrimary, letterSpacing: -0.2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardSub: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted },
  cardDesc: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, lineHeight: 18 },
  rsvpBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  rsvpBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  rsvpBtnDisabled: { opacity: 0.4 },
  rsvpText: { fontSize: 12, fontFamily: fonts.heading, color: colors.textPrimary, letterSpacing: 1 },
  rsvpTextActive: { color: colors.background },
});
