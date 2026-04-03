import { useState, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { PlusCircleIcon } from 'lucide-react-native';
import { colors, fonts, commonStyles } from '../../../constants/tokens';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';
import { fetchMealHistory } from '../../../lib/actions/meal';
import { useMealStore } from '../../../stores/meal-store';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import EmptyState from '../../../components/ui/EmptyState';
import type { MealRecord, MealType } from '../../../lib/types/meal';
import { MEAL_TYPE_LABELS, MEAL_TYPE_COLORS } from '../../../lib/types/meal';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Format a Date as "April 4 (Sat)" */
function formatDayHeader(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()} (${DAY_NAMES[date.getDay()]})`;
}

/** Get a YYYY-MM-DD key for grouping */
function dateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type Section = {
  title: string;
  data: MealRecord[];
};

/** Group meals by day, most recent day first */
function groupByDay(meals: MealRecord[]): Section[] {
  const map = new Map<string, { date: Date; meals: MealRecord[] }>();

  for (const meal of meals) {
    const key = dateKey(meal.created_at);
    if (!map.has(key)) {
      map.set(key, { date: new Date(meal.created_at), meals: [] });
    }
    map.get(key)!.meals.push(meal);
  }

  // Sort keys descending (most recent first) — meals within each day already sorted by API
  const sorted = Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  return sorted.map(([, { date, meals }]) => ({
    title: formatDayHeader(date),
    data: meals,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// MealHistoryScreen
// ─────────────────────────────────────────────────────────────────────────────

export default function MealHistoryScreen() {
  const router = useRouter();

  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const reset = useMealStore((s) => s.reset);

  // ── Load meals on focus ────────────────────────────────────────────────

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

  // ── Navigate to fill-up screen (fresh draft) ──────────────────────────

  function handleAddNewMeal() {
    reset();
    router.push('/(tabs)/meal/fill-up');
  }

  // ── Navigate to summary for an existing meal ──────────────────────────

  function handleMealPress(meal: MealRecord) {
    // Hydrate the store with this meal's data so summary can display it
    const store = useMealStore.getState();
    store.reset();
    store.setImage(meal.s3_link ?? '');
    store.setField('title', meal.title ?? '');
    store.setField('calories', meal.calories?.toString() ?? '');
    store.setField('protein', meal.protein?.toString() ?? '');
    store.setMealType(meal.meal_type ?? null);
    store.setField('mealNotes', meal.user_notes ?? '');
    store.setRecordInfo(meal.meal_id, meal.s3_link ?? '');
    if (meal.ai_analysis) store.setAiResult(meal.ai_analysis);
    // Store description in a way summary can read it
    router.push('/(tabs)/meal/summary');
  }

  // ── Section header ────────────────────────────────────────────────────

  function renderSectionHeader({ section }: { section: Section }) {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    );
  }

  // ── Meal card ─────────────────────────────────────────────────────────

  function renderMealCard({ item }: { item: MealRecord }) {
    const mealTypeLabel = item.meal_type ? MEAL_TYPE_LABELS[item.meal_type as MealType] : null;
    const mealTypeColor = item.meal_type ? MEAL_TYPE_COLORS[item.meal_type as MealType] : null;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => handleMealPress(item)}
      >
        {/* Square image preview */}
        {item.s3_link ? (
          <Image source={{ uri: item.s3_link }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Text style={styles.cardImagePlaceholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.cardBody}>
          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title || 'Untitled Meal'}
          </Text>

          {/* Meal type badge + calories */}
          <View style={styles.cardMetaRow}>
            {mealTypeLabel && mealTypeColor && (
              <View style={[styles.mealTypeBadge, { backgroundColor: mealTypeColor + '25', borderColor: mealTypeColor + '50' }]}>
                <Text style={[styles.mealTypeBadgeText, { color: mealTypeColor }]}>
                  {mealTypeLabel}
                </Text>
              </View>
            )}
            {item.calories != null && (
              <Text style={styles.cardCalories}>{Math.round(item.calories)} kcal</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────

  if (loading) return <LoadingScreen />;

  const sections = groupByDay(meals);

  return (
    <View style={styles.container}>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <View style={commonStyles.pageHeader}>
        <Text style={commonStyles.pageHeaderTitle}>Meals</Text>
      </View>

      {/* ── Grouped meal list ────────────────────────────────────────────── */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.meal_id}
        renderItem={renderMealCard}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <EmptyState message="No meals logged yet. Tap below to log your first meal!" />
        }
      />

      {/* ── Floating pill button ─────────────────────────────────────────── */}
      <View style={styles.fabContainer}>
        <Button
          title="ADD NEW MEAL"
          onPress={handleAddNewMeal}
          variant="primary"
          icon={<PlusCircleIcon size={18} color={colors.background} />}
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
    paddingBottom: 100, // room for FAB
  },

  // ── Section header ──────────────────────────────────────────────────
  sectionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontFamily: fonts.headingM,
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },

  // ── Card ──────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  cardImage: {
    width: 84,
    height: 84,
  },
  cardImagePlaceholder: {
    backgroundColor: colors.surface1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImagePlaceholderText: {
    fontSize: 10,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 6,
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

  // ── Meal type badge ──────────────────────────────────────────────────
  mealTypeBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  mealTypeBadgeText: {
    fontSize: 10,
    fontFamily: fonts.headingM,
    letterSpacing: 0.5,
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
