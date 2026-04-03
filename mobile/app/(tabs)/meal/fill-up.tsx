import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { colors, fonts, commonStyles } from '../../../constants/tokens';
import Button from '../../../components/ui/Button';
import { useMealStore } from '../../../stores/meal-store';
import { supabase } from '../../../lib/supabase';
import { createMealRecord, uploadFoodImage } from '../../../lib/actions/meal';
import { analyzeFoodWithAI } from '../../../lib/services/ai-food';
import type { AiFoodAnalysis } from '../../../lib/types/meal';

// ─────────────────────────────────────────────────────────────────────────────
// MealInfoFillUpScreen — form to log meal details before saving or AI analysis
// ─────────────────────────────────────────────────────────────────────────────

export default function MealInfoFillUpScreen() {
  const router = useRouter();

  // Zustand state
  const imageUri = useMealStore((s) => s.imageUri);
  const title = useMealStore((s) => s.title);
  const calories = useMealStore((s) => s.calories);
  const weightG = useMealStore((s) => s.weightG);
  const mealNotes = useMealStore((s) => s.mealNotes);
  const savingRecord = useMealStore((s) => s.savingRecord);
  const analyzingAI = useMealStore((s) => s.analyzingAI);
  const setField = useMealStore((s) => s.setField);
  const setLoading = useMealStore((s) => s.setLoading);
  const setRecordInfo = useMealStore((s) => s.setRecordInfo);
  const setAiResult = useMealStore((s) => s.setAiResult);
  const reset = useMealStore((s) => s.reset);

  // Local error state
  const [titleError, setTitleError] = useState(false);

  const isAnyLoading = savingRecord || analyzingAI;

  // ── Shared: upload image + create record ──────────────────────────────────

  async function uploadAndCreateRecord(): Promise<{
    mealId: string;
    s3Link: string;
    userId: string;
    accessToken: string;
  } | null> {
    // Validate required fields
    if (!title.trim()) {
      setTitleError(true);
      Alert.alert('Title required', 'Please add a meal title.');
      return null;
    }
    setTitleError(false);

    if (!imageUri) {
      Alert.alert('Error', 'No image captured. Please go back and take a photo.');
      return null;
    }

    // Get current user + session token
    const { data: { user } } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();

    if (!user || !session) {
      Alert.alert('Error', 'You must be logged in.');
      return null;
    }

    // Upload image to Supabase Storage
    const { url, error: uploadErr } = await uploadFoodImage(user.id, imageUri);
    if (uploadErr || !url) {
      Alert.alert('Upload Failed', 'Could not upload the image. Please try again.');
      return null;
    }

    // Generate a unique meal ID
    const mealId = crypto.randomUUID();

    // Create the meal record
    const parsedCalories = calories ? parseFloat(calories) : null;

    const { error: createErr } = await createMealRecord({
      meal_id: mealId,
      user_id: user.id,
      title: title.trim(),
      calories: isNaN(parsedCalories as number) ? null : parsedCalories,
      user_notes: mealNotes.trim() || null,
      s3_link: url,
    });

    if (createErr) {
      Alert.alert('Error', 'Failed to save meal record. Please try again.');
      return null;
    }

    // Store record info in Zustand for downstream screens
    setRecordInfo(mealId, url);

    return { mealId, s3Link: url, userId: user.id, accessToken: session.access_token };
  }

  // ── Save Record flow ──────────────────────────────────────────────────────

  async function handleSaveRecord() {
    setLoading('savingRecord', true);

    const result = await uploadAndCreateRecord();
    setLoading('savingRecord', false);

    if (!result) return; // error already shown

    // Success — navigate back to history
    reset();
    router.replace('/(tabs)/meal/');
  }

  // ── AI Analysis flow ──────────────────────────────────────────────────────

  async function handleAIAnalysis() {
    setLoading('analyzingAI', true);

    const result = await uploadAndCreateRecord();
    if (!result) {
      setLoading('analyzingAI', false);
      return;
    }

    // Call backend AI endpoint
    const { analysis, error: aiErr } = await analyzeFoodWithAI(
      result.mealId,
      result.accessToken,
    );

    setLoading('analyzingAI', false);

    if (aiErr || !analysis) {
      // AI failed — offer fallback to manual save
      Alert.alert(
        'AI Analysis Failed',
        aiErr || 'Could not analyse the image. Your meal has been saved without AI data.',
        [
          {
            text: 'Return to Meals',
            onPress: () => {
              reset();
              router.replace('/(tabs)/meal/');
            },
          },
          { text: 'OK', style: 'cancel' },
        ],
      );
      return;
    }

    // Store AI result and navigate to summary
    setAiResult(analysis as AiFoodAnalysis);
    router.push('/(tabs)/meal/summary');
  }

  // ── Back handler ──────────────────────────────────────────────────────────

  function handleBack() {
    reset();
    router.back();
  }

  return (
    <View style={styles.container}>
      {/* ── Nav header ──────────────────────────────────────────────────── */}
      <View style={commonStyles.navHeader as any}>
        <TouchableOpacity onPress={handleBack} style={commonStyles.navHeaderSpacer as any}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={commonStyles.navHeaderTitle}>Log Your Meal</Text>
        <View style={commonStyles.navHeaderSpacer as any} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Image preview ─────────────────────────────────────────────── */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          </View>
        )}

        {/* ── Form fields ───────────────────────────────────────────────── */}
        <View style={styles.form}>
          <Field label="MEAL TITLE *">
            <TextInput
              style={[styles.input, titleError && styles.inputError]}
              value={title}
              onChangeText={(t) => {
                setField('title', t);
                if (t.trim()) setTitleError(false);
              }}
              placeholder="e.g. Grilled chicken salad"
              placeholderTextColor={colors.textMuted}
            />
            {titleError && <Text style={styles.errorText}>Title is required</Text>}
          </Field>

          <Field label="CALORIES (KCAL)">
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={(v) => setField('calories', v)}
              placeholder="Optional — AI can estimate this"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </Field>

          <Field label="ESTIMATED WEIGHT (Gram)">
            <TextInput
              style={styles.input}
              value={weightG}
              onChangeText={(v) => setField('weightG', v)}
              placeholder="Optional — helps AI estimate portions"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </Field>

          <Field label="MEAL NOTES">
            <TextInput
              style={[styles.input, styles.textarea]}
              value={mealNotes}
              onChangeText={(v) => setField('mealNotes', v)}
              placeholder="Any extra details? e.g. homemade, restaurant, dressing, etc."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
            />
          </Field>
        </View>
      </ScrollView>

      {/* ── Bottom buttons ───────────────────────────────────────────────── */}
      <View style={styles.bottomBar}>
        {/* Save Record — outline / secondary */}
        <Button
          title="SAVE RECORD"
          onPress={handleSaveRecord}
          variant="outline"
          loading={savingRecord}
          disabled={isAnyLoading}
        />

        {/* AI Analysis — primary / accent */}
        <Button
          title="AI ANALYSIS"
          onPress={handleAIAnalysis}
          variant="primary"
          loading={analyzingAI}
          disabled={isAnyLoading}
        />
      </View>
    </View>
  );
}

// ── Field wrapper ───────────────────────────────────────────────────────────

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
  content: { paddingBottom: 160 },

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
    height: 240,
  },

  // Form
  form: { padding: 16, gap: 20 },
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
  inputError: {
    borderColor: colors.error,
  },
  textarea: { minHeight: 100, paddingTop: 12 },
  errorText: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.error,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    gap: 10,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
