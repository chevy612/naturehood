import { useState, useCallback } from 'react';
import { View, SectionList, Image, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { PlusCircle } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { fetchMealHistory } from '../../../lib/actions/meal';
import { useMealStore } from '../../../stores/meal-store';
import type { MealRecord, MealType } from '../../../lib/types/meal';
import { MEAL_TYPE_LABELS, MEAL_TYPE_COLORS } from '../../../lib/types/meal';
import { groupByDay } from '../../../utils/mealUtils';
import type { Section } from '../../../utils/mealUtils';

import { PageHeader } from '@/components/layout/page-header';
import { SectionLabel } from '@/components/layout/section-label';
import { LoadingScreen } from '@/components/loading/loading-screen';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

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
    }, [])
  );

  async function loadMeals() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    router.push('/(tabs)/meal/summary');
  }

  // ── Section header ────────────────────────────────────────────────────

  function renderSectionHeader({ section }: { section: Section }) {
    return (
      <View className="py-2 mt-1">
        <SectionLabel text={section.title} />
      </View>
    );
  }

  // ── Meal card ─────────────────────────────────────────────────────────

  function renderMealCard({ item }: { item: MealRecord }) {
    const mealTypeLabel = item.meal_type ? MEAL_TYPE_LABELS[item.meal_type as MealType] : null;
    const mealTypeColor = item.meal_type ? MEAL_TYPE_COLORS[item.meal_type as MealType] : null;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleMealPress(item)}
        className="mb-2.5"
      >
        <Card className="flex-row overflow-hidden py-0 rounded-xl" style={{ maxHeight: 60 }}>
          {/* Square image preview */}
          {item.s3_link ? (
            <Image
              source={{ uri: item.s3_link }}
              className="w-[60px] h-[60px]"
              resizeMode="cover"
            />
          ) : (
            <View className="w-[60px] h-[60px] bg-surface-1 items-center justify-center">
              <Text variant="muted" className="text-[10px]">
                No Image
              </Text>
            </View>
          )}

          <CardContent className="flex-1 justify-center gap-1 py-0 px-3">
            {/* Title */}
            <Text className="text-sm font-semibold" numberOfLines={1}>
              {item.title || 'Untitled Meal'}
            </Text>

            {/* Meal type badge + macros */}
            <View className="flex-row items-center gap-2">
              {mealTypeLabel && mealTypeColor && (
                <Badge
                  variant="outline"
                  className="rounded"
                  style={{
                    borderColor: mealTypeColor + '50',
                    backgroundColor: mealTypeColor + '25',
                  }}
                >
                  <Text className="text-[10px] font-semibold" style={{ color: mealTypeColor }}>
                    {mealTypeLabel}
                  </Text>
                </Badge>
              )}
              {item.calories != null && (
                <Text className="text-[13px] font-medium text-primary">
                  {Math.round(item.calories)} kcal
                </Text>
              )}
              {item.protein != null && (
                <Text className="text-[13px] font-medium text-primary">
                  Protein {Math.round(item.protein)}g
                </Text>
              )}
            </View>
          </CardContent>
        </Card>
      </TouchableOpacity>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────

  if (loading) return <LoadingScreen />;

  const sections = groupByDay(meals);

  return (
    <View className="flex-1 bg-background">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <PageHeader title="Meals" />

      {/* ── Grouped meal list ────────────────────────────────────────────── */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.meal_id}
        renderItem={renderMealCard}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#C8F04D" />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-16 px-6">
            <Text variant="muted" className="text-center">
              No meals logged yet. Tap below to log your first meal!
            </Text>
          </View>
        }
      />

      {/* ── Floating pill button ─────────────────────────────────────────── */}
      <View className="absolute bottom-10 left-0 right-0 items-center">
        <Button
          variant="default"
          size="lg"
          onPress={handleAddNewMeal}
          className="rounded-full px-6"
        >
          <Icon as={PlusCircle} className="text-primary-foreground" size={18} />
          <Text>LOG NEW MEAL</Text>
        </Button>
      </View>
    </View>
  );
}
