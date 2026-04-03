import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera as CameraIcon } from 'lucide-react-native';
import { colors, fonts, commonStyles } from '../../../constants/tokens';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';
import { fetchMealHistory } from '../../../lib/actions/meal';
import { useMealStore } from '../../../stores/meal-store';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import EmptyState from '../../../components/ui/EmptyState';
import type { MealRecord } from '../../../lib/types/meal';

// ─────────────────────────────────────────────────────────────────────────────
// MealHistoryScreen — list of past meals + floating "Scan New Meal" button
// ─────────────────────────────────────────────────────────────────────────────

export default function MealHistoryScreen() {
  const router = useRouter();

  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Zustand actions for starting a new scan
  const setImage = useMealStore((s) => s.setImage);
  const reset = useMealStore((s) => s.reset);

  // ── Load meals on focus (re-fetches when returning from other screens) ───

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, []),
  );

  async function loadMeals() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await fetchMealHistory(user.id);
    setMeals(data);
    setLoading(false);
    setRefreshing(false);
  }

  function handleRefresh() {
    setRefreshing(true);
    loadMeals();
  }

  // ── Scan new meal — request camera, capture photo, navigate ─────────────

  async function handleScanNewMeal() {
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in your device settings to scan meals.',
        [{ text: 'OK' }],
      );
      return;
    }

    // Launch native camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    // Reset any previous draft and store the new image
    reset();
    setImage(result.assets[0].uri);

    // Navigate to the fill-up form
    router.push('/(tabs)/meal/fill-up');
  }

  // ── Format date for display ─────────────────────────────────────────────

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ── Render a single meal card ───────────────────────────────────────────

  function renderMealCard({ item }: { item: MealRecord }) {
    const hasAI = !!item.ai_analysis;

    return (
      <View style={styles.card}>
        {/* Thumbnail */}
        {item.s3_link && (
          <Image source={{ uri: item.s3_link }} style={styles.cardImage} resizeMode="cover" />
        )}

        <View style={styles.cardBody}>
          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title || 'Untitled Meal'}
          </Text>

          {/* Calories + AI badge */}
          <View style={styles.cardMetaRow}>
            {item.calories != null && (
              <Text style={styles.cardCalories}>{Math.round(item.calories)} kcal</Text>
            )}
            {hasAI && (
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            )}
          </View>

          {/* Date */}
          <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────────

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <View style={commonStyles.pageHeader}>
        <Text style={commonStyles.pageHeaderTitle}>Meals</Text>
      </View>

      {/* ── Meal list ───────────────────────────────────────────────────── */}
      <FlatList
        data={meals}
        keyExtractor={(item) => item.meal_id}
        renderItem={renderMealCard}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={<EmptyState message="No meals logged yet. Tap below to scan your first meal!" />}
      />

      {/* ── Floating Action Button ────────────────────────────────────────── */}
      <View style={styles.fabContainer}>
        <Button
          title="SCAN NEW MEAL"
          onPress={handleScanNewMeal}
          variant="primary"
          icon={<CameraIcon size={18} color={colors.background} />}
          shadow
          style={styles.fab}
        />
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: commonStyles.screen,

  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 100, // room for FAB
  },

  // ── Card ──────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: 90,
    height: 90,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: fonts.headingM,
    color: colors.textPrimary,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardCalories: {
    fontSize: 13,
    fontFamily: fonts.bodyMed,
    color: colors.accent,
  },
  aiBadge: {
    backgroundColor: colors.accent + '25',
    borderWidth: 1,
    borderColor: colors.accent + '50',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  aiBadgeText: {
    fontSize: 9,
    fontFamily: fonts.heading,
    color: colors.accent,
    letterSpacing: 1,
  },
  cardDate: {
    fontSize: 11,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },

  // ── Floating Action Button ────────────────────────────────────────────
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
});
