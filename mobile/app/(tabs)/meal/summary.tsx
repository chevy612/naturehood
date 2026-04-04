import { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useMealStore } from '../../../stores/meal-store';
import { updateMealRecord } from '../../../lib/actions/meal';
import { hasAiFoodData, MEAL_TYPES, MEAL_TYPE_LABELS } from '../../../lib/types/meal';
import type { MealType } from '../../../lib/types/meal';
import { supabase } from '../../../lib/supabase';
import { parseNullableFloat } from '../../../utils/mealUtils';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { SectionLabel } from '@/components/layout/section-label';

// ─────────────────────────────────────────────────────────────────────────────
// MealSummaryScreen — displays AI analysis results with editable fields
// ─────────────────────────────────────────────────────────────────────────────

export default function MealSummaryScreen() {
  const router = useRouter();

  // Zustand state
  const imageUri = useMealStore((s) => s.imageUri);
  const aiResult = useMealStore((s) => s.aiResult);
  const currentMealId = useMealStore((s) => s.currentMealId);
  const savingSummary = useMealStore((s) => s.savingSummary);
  const setLoading = useMealStore((s) => s.setLoading);
  const reset = useMealStore((s) => s.reset);

  // Pre-fill editable fields from AI result + form data
  const storeTitle = useMealStore((s) => s.title);
  const storeProtein = useMealStore((s) => s.protein);
  const storeMealType = useMealStore((s) => s.mealType);

  const aiData = aiResult && hasAiFoodData(aiResult.data) ? aiResult.data : null;
  const aiCalories = aiData
    ? Math.round(
        (aiData.meal_summary.total_calories_range.min +
          aiData.meal_summary.total_calories_range.max) /
          2
      )
    : null;

  // Compute total protein from AI breakdown if available
  const aiProtein = aiData
    ? aiData.breakdown.reduce((sum, item) => sum + (item.macros.p ?? 0), 0)
    : null;

  const [title, setTitle] = useState(storeTitle || '');
  const [calories, setCalories] = useState(aiCalories?.toString() ?? '');
  const [protein, setProtein] = useState(
    storeProtein || (aiProtein ? Math.round(aiProtein).toString() : '')
  );
  const [mealType, setMealType] = useState<MealType | null>(storeMealType);
  const [description, setDescription] = useState(aiResult?.description ?? '');

  // Track whether user has changed anything
  const isDirty = useMemo(() => {
    const titleChanged = title !== (storeTitle || '');
    const caloriesChanged = calories !== (aiCalories?.toString() ?? '');
    const proteinChanged =
      protein !== (storeProtein || (aiProtein ? Math.round(aiProtein).toString() : ''));
    const mealTypeChanged = mealType !== storeMealType;
    const descChanged = description !== (aiResult?.description ?? '');
    return titleChanged || caloriesChanged || proteinChanged || mealTypeChanged || descChanged;
  }, [
    title,
    calories,
    protein,
    mealType,
    description,
    storeTitle,
    aiCalories,
    storeProtein,
    aiProtein,
    storeMealType,
    aiResult?.description,
  ]);

  // ── Back handler — discard changes and go to history ─────────────────
  function handleBack() {
    reset();
    router.replace('/(tabs)/meal/');
  }

  // ── Save + Return ──────────────────────────────────────────────────────
  async function handleDone() {
    if (!currentMealId) {
      handleBack();
      return;
    }

    setLoading('savingSummary', true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'You must be logged in.');
      setLoading('savingSummary', false);
      return;
    }

    const parsedCal = parseNullableFloat(calories);
    const parsedProtein = parseNullableFloat(protein);

    const { error } = await updateMealRecord(currentMealId, user.id, {
      title: title || null,
      calories: parsedCal,
      protein: parsedProtein,
      meal_type: mealType ?? null,
    });

    setLoading('savingSummary', false);

    if (error) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
      return;
    }

    reset();
    router.replace('/(tabs)/meal/');
  }

  // ── AI breakdown rendering ─────────────────────────────────────────────
  const breakdownItems = aiData?.breakdown ?? [];
  const assumptions = aiData?.preparation_assumptions ?? [];
  const confidence = aiData?.meal_summary.confidence_score;
  const noFood = aiResult && !hasAiFoodData(aiResult.data);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Nav header ──────────────────────────────────────────────────── */}
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <Button variant="ghost" size="icon" onPress={handleBack}>
          <Icon as={ChevronLeft} size={24} />
        </Button>
        <Text className="flex-1 text-center text-sm font-semibold">Meal Summary</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* ── Image preview ─────────────────────────────────────────────── */}
        {imageUri ? (
          <View className="mx-4 mt-2 rounded-xl overflow-hidden border border-border">
            <Image source={{ uri: imageUri }} className="w-full h-[230px]" resizeMode="cover" />
          </View>
        ) : null}

        {/* ── No food detected message ──────────────────────────────────── */}
        {noFood && (
          <View className="mx-4 mt-2 p-4 bg-destructive/10 rounded-lg border border-destructive">
            <Text className="text-destructive text-sm">
              No food was detected in the image. You can still edit the fields below manually.
            </Text>
          </View>
        )}

        {/* ── Confidence badge ──────────────────────────────────────────── */}
        {confidence !== undefined && (
          <View className="mx-4 mt-3 flex-row justify-between items-center px-4 py-2.5 bg-surface-1 rounded-lg border border-border">
            <Text className="text-xs text-muted-foreground font-medium">
              AI Correctness Confidence
            </Text>
            <Text className="text-sm font-semibold text-primary">
              {Math.round(confidence * 100)}%
            </Text>
          </View>
        )}

        {/* ── Editable fields ───────────────────────────────────────────── */}
        <View className="p-4 gap-5">
          <Field label="Meal Title">
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Grilled chicken salad"
            />
          </Field>

          <Field label="Calories (kcal)">
            <Input
              value={calories}
              onChangeText={setCalories}
              placeholder="e.g. 450"
              keyboardType="numeric"
            />
          </Field>

          <Field label="Protein (g)">
            <Input
              value={protein}
              onChangeText={setProtein}
              placeholder="e.g. 30"
              keyboardType="numeric"
            />
          </Field>

          <Field label="Meal Type">
            <View className="flex-row flex-wrap gap-2">
              {MEAL_TYPES.map((type) => {
                const isSelected = mealType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.7}
                    onPress={() => setMealType(isSelected ? null : type)}
                  >
                    <Badge variant={isSelected ? 'default' : 'outline'}>
                      <Text>{MEAL_TYPE_LABELS[type]}</Text>
                    </Badge>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Field>

          <Field label="Description">
            <Textarea
              value={description}
              onChangeText={setDescription}
              placeholder="AI-generated meal description"
              numberOfLines={4}
            />
          </Field>
        </View>

        {/* ── AI Breakdown ──────────────────────────────────────────────── */}
        {breakdownItems.length > 0 && (
          <View className="px-4 gap-2 mt-1">
            <SectionLabel text="Nutritional Breakdown" />
            {breakdownItems.map((item, i) => (
              <View
                key={i}
                className="bg-surface-1 border border-border rounded-lg p-4 gap-1"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-medium flex-1">{item.item}</Text>
                  <Text className="text-sm font-semibold text-primary">{item.calories} kcal</Text>
                </View>
                <Text className="text-xs text-muted-foreground">
                  {item.estimated_weight_g}g | Protein: {item.macros.p}g | Carbs: {item.macros.c}g | Fat: {item.macros.f}g
                </Text>
                <Text className="text-xs text-muted-foreground italic">{item.logic}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Preparation assumptions ───────────────────────────────────── */}
        {assumptions.length > 0 && (
          <View className="px-4 gap-2 mt-4">
            <SectionLabel text="Assumptions" />
            {assumptions.map((a, i) => (
              <Text key={i} className="text-xs text-muted-foreground">
                {a}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Bottom button ────────────────────────────────────────────────── */}
      <View className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-background border-t border-border">
        <Button variant="default" onPress={handleDone} disabled={savingSummary}>
          {savingSummary ? (
            <ActivityIndicator size="small" color="#141115" />
          ) : (
            <Text>{isDirty ? 'SAVE AND RETURN' : 'DONE'}</Text>
          )}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Field wrapper ───────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-1.5">
      <SectionLabel text={label} />
      {children}
    </View>
  );
}
