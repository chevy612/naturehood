import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors, fonts, commonStyles, spacing } from '../../../constants/tokens';
import Button from '../../../components/ui/Button';
import { useMealStore } from '../../../stores/meal-store';
import { updateMealRecord } from '../../../lib/actions/meal';
import { hasAiFoodData, MEAL_TYPES, MEAL_TYPE_LABELS } from '../../../lib/types/meal';
import type { MealType } from '../../../lib/types/meal';
import { supabase } from '../../../lib/supabase';
import { parseNullableFloat } from '../../../utils/mealUtils';

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

    // Build update payload
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Nav header ──────────────────────────────────────────────────── */}
      <View style={commonStyles.navHeader as any}>
        <TouchableOpacity onPress={handleBack} style={commonStyles.navHeaderSpacer as any}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={commonStyles.navHeaderTitle}>Meal Summary</Text>
        <View style={commonStyles.navHeaderSpacer as any} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* ── Image preview ─────────────────────────────────────────────── */}
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          </View>
        ) : null}

        {/* ── No food detected message ──────────────────────────────────── */}
        {noFood && (
          <View style={styles.noFoodBanner}>
            <Text style={styles.noFoodText}>
              No food was detected in the image. You can still edit the fields below manually.
            </Text>
          </View>
        )}

        {/* ── Confidence badge ──────────────────────────────────────────── */}
        {confidence !== undefined && (
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>AI Correctness Confidence</Text>
            <Text style={styles.confidenceValue}>{Math.round(confidence * 100)}%</Text>
          </View>
        )}

        {/* ── Editable fields ───────────────────────────────────────────── */}
        <View style={styles.form}>
          <Field label="MEAL TITLE">
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Grilled chicken salad"
              placeholderTextColor={colors.textMuted}
            />
          </Field>

          <Field label="CALORIES (KCAL)">
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              placeholder="e.g. 450"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </Field>

          <Field label="PROTEIN (G)">
            <TextInput
              style={styles.input}
              value={protein}
              onChangeText={setProtein}
              placeholder="e.g. 30"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </Field>

          <Field label="MEAL TYPE">
            <View style={styles.mealTypePicker}>
              {MEAL_TYPES.map((type) => {
                const isSelected = mealType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.mealTypeChip, isSelected && styles.mealTypeChipSelected]}
                    activeOpacity={0.7}
                    onPress={() => setMealType(isSelected ? null : type)}
                  >
                    <Text
                      style={[
                        styles.mealTypeChipText,
                        isSelected && styles.mealTypeChipTextSelected,
                      ]}
                    >
                      {MEAL_TYPE_LABELS[type]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Field>

          <Field label="DESCRIPTION">
            <TextInput
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="AI-generated meal description"
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
            />
          </Field>
        </View>

        {/* ── AI Breakdown ──────────────────────────────────────────────── */}
        {breakdownItems.length > 0 && (
          <View style={styles.breakdownSection}>
            <Text style={commonStyles.sectionLabel}>NUTRITIONAL BREAKDOWN</Text>
            {breakdownItems.map((item, i) => (
              <View key={i} style={styles.breakdownCard}>
                <View style={styles.breakdownHeader}>
                  <Text style={styles.breakdownName}>{item.item}</Text>
                  <Text style={styles.breakdownCal}>{item.calories} kcal</Text>
                </View>
                <Text style={styles.breakdownMeta}>
                  {item.estimated_weight_g}g | Protein: {item.macros.p}g | Carbs: {item.macros.c}g |
                  Fat: {item.macros.f}g
                </Text>
                <Text style={styles.breakdownLogic}>{item.logic}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Preparation assumptions ───────────────────────────────────── */}
        {assumptions.length > 0 && (
          <View style={styles.assumptionsSection}>
            <Text style={commonStyles.sectionLabel}>ASSUMPTIONS</Text>
            {assumptions.map((a, i) => (
              <Text key={i} style={commonStyles.textCaption}>
                {a}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Bottom button ────────────────────────────────────────────────── */}
      <View style={styles.bottomBar}>
        <Button
          title={isDirty ? 'SAVE AND RETURN' : 'DONE'}
          onPress={handleDone}
          variant="primary"
          loading={savingSummary}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Reusable field wrapper ──────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={commonStyles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: commonStyles.screen,
  content: { paddingBottom: 120 },

  // Image
  imageContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: 230,
  },

  // No food banner
  noFoodBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#2e1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  noFoodText: {
    color: colors.error,
    fontFamily: fonts.body,
    fontSize: 13,
  },

  // Confidence
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confidenceLabel: {
    fontSize: 12,
    fontFamily: fonts.bodyMed,
    color: colors.textMuted,
  },
  confidenceValue: {
    fontSize: 13,
    fontFamily: fonts.heading,
    color: colors.accent,
  },

  // Form
  form: { padding: spacing.md, gap: spacing.md },
  input: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textPrimary,
  },
  textarea: { minHeight: 80, paddingTop: spacing.md },

  // Meal type picker (chip row)
  mealTypePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mealTypeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface1,
  },
  mealTypeChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '20',
  },
  mealTypeChipText: {
    fontSize: 12,
    fontFamily: fonts.bodyMed,
    color: colors.textDisabled,
  },
  mealTypeChipTextSelected: {
    color: colors.accent,
  },

  // Breakdown
  breakdownSection: { paddingHorizontal: spacing.md, gap: spacing.sm, marginTop: spacing.sm },
  breakdownCard: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownName: {
    fontSize: 13,
    fontFamily: fonts.bodyMed,
    color: colors.textPrimary,
    flex: 1,
  },
  breakdownCal: {
    fontSize: 13,
    fontFamily: fonts.heading,
    color: colors.accent,
  },
  breakdownMeta: {
    fontSize: 11,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
  breakdownLogic: {
    fontSize: 11,
    fontFamily: fonts.body,
    color: colors.textDisabled,
    fontStyle: 'italic',
  },

  // Assumptions
  assumptionsSection: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
