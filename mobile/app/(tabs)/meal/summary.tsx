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
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors, fonts, commonStyles } from '../../../constants/tokens';
import Button from '../../../components/ui/Button';
import { useMealStore } from '../../../stores/meal-store';
import { updateMealRecord } from '../../../lib/actions/meal';
import { hasAiFoodData } from '../../../lib/types/meal';
import { supabase } from '../../../lib/supabase';

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

  const aiData = aiResult && hasAiFoodData(aiResult.data) ? aiResult.data : null;
  const aiCalories = aiData
    ? Math.round((aiData.meal_summary.total_calories_range.min + aiData.meal_summary.total_calories_range.max) / 2)
    : null;

  const [title, setTitle] = useState(storeTitle || '');
  const [calories, setCalories] = useState(aiCalories?.toString() ?? '');
  const [description, setDescription] = useState(aiResult?.description ?? '');

  // Track whether user has changed anything
  const isDirty = useMemo(() => {
    const titleChanged = title !== (storeTitle || '');
    const caloriesChanged = calories !== (aiCalories?.toString() ?? '');
    const descChanged = description !== (aiResult?.description ?? '');
    return titleChanged || caloriesChanged || descChanged;
  }, [title, calories, description, storeTitle, aiCalories, aiResult?.description]);

  // ── Back handler — discard changes and go to history ─────────────────────
  function handleBack() {
    reset();
    router.replace('/(tabs)/meal/');
  }

  // ── Save + Return ───────────────────────────────────────────────────────
  async function handleDone() {
    if (!currentMealId) {
      handleBack();
      return;
    }

    setLoading('savingSummary', true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'You must be logged in.');
      setLoading('savingSummary', false);
      return;
    }

    // Build update payload — save edits into user_notes for future reference
    const parsedCal = calories ? parseFloat(calories) : null;

    const { error } = await updateMealRecord(currentMealId, user.id, {
      title: title || null,
      calories: isNaN(parsedCal as number) ? null : parsedCal,
      user_notes: isDirty
        ? JSON.stringify({ edited_title: title, edited_calories: calories, edited_description: description })
        : undefined,
    });

    setLoading('savingSummary', false);

    if (error) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
      return;
    }

    reset();
    router.replace('/(tabs)/meal/');
  }

  // ── AI breakdown rendering ──────────────────────────────────────────────
  const breakdownItems = aiData?.breakdown ?? [];
  const assumptions = aiData?.preparation_assumptions ?? [];
  const confidence = aiData?.meal_summary.confidence_score;
  const noFood = aiResult && !hasAiFoodData(aiResult.data);

  return (
    <View style={styles.container}>
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
      >
        {/* ── Image preview (smaller) ───────────────────────────────────── */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          </View>
        )}

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
            <Text style={styles.confidenceLabel}>AI Confidence</Text>
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
                  {item.estimated_weight_g}g • P: {item.macros.p}g • C: {item.macros.c}g • F: {item.macros.f}g
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
              <Text key={i} style={styles.assumptionText}>• {a}</Text>
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
    </View>
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
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: 200,
  },

  // No food banner
  noFoodBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
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
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
  form: { padding: 16, gap: 16 },
  input: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textPrimary,
  },
  textarea: { minHeight: 80, paddingTop: 12 },

  // Breakdown
  breakdownSection: { paddingHorizontal: 16, gap: 10, marginTop: 8 },
  breakdownCard: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    gap: 4,
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
  assumptionsSection: { paddingHorizontal: 16, gap: 6, marginTop: 16 },
  assumptionText: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
