import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { colors, fonts, commonStyles } from '../../../constants/tokens';
import Button from '../../../components/ui/Button';
import { useMealStore } from '../../../stores/meal-store';
import { useAiUsageStore, AI_LIMIT } from '../../../stores/meal-store';
import { supabase } from '../../../lib/supabase';
import {
  createMealRecord,
  uploadFoodImage,
  incrementAiUsageRemote,
} from '../../../lib/actions/meal';
import { analyzeFoodWithAI } from '../../../lib/services/ai-food';
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '../../../lib/types/meal';
import type { AiFoodAnalysis, MealType } from '../../../lib/types/meal';

// ─────────────────────────────────────────────────────────────────────────────
// MealInfoFillUpScreen — form to log meal details before saving or AI analysis
// ─────────────────────────────────────────────────────────────────────────────

export default function MealInfoFillUpScreen() {
  const router = useRouter();

  // Zustand — meal draft
  const imageUri = useMealStore((s) => s.imageUri);
  const title = useMealStore((s) => s.title);
  const calories = useMealStore((s) => s.calories);
  const protein = useMealStore((s) => s.protein);
  const mealType = useMealStore((s) => s.mealType);
  const mealNotes = useMealStore((s) => s.mealNotes);
  const savingRecord = useMealStore((s) => s.savingRecord);
  const analyzingAI = useMealStore((s) => s.analyzingAI);
  const setField = useMealStore((s) => s.setField);
  const setMealType = useMealStore((s) => s.setMealType);
  const setImage = useMealStore((s) => s.setImage);
  const setLoading = useMealStore((s) => s.setLoading);
  const setRecordInfo = useMealStore((s) => s.setRecordInfo);
  const setAiResult = useMealStore((s) => s.setAiResult);
  const reset = useMealStore((s) => s.reset);

  // Zustand — AI usage
  const aiUsedCount = useAiUsageStore((s) => s.aiUsedCount);
  const incrementAiUsage = useAiUsageStore((s) => s.incrementAiUsage);

  // Local UI state
  const [titleError, setTitleError] = useState(false);

  const isAnyLoading = savingRecord || analyzingAI;
  const hasImage = !!imageUri;

  // ── Camera / image picker ──────────────────────────────────────────────

  async function handleAddImage() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in your device settings to capture food images.',
        [{ text: 'OK' }],
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    setImage(result.assets[0].uri);
  }

  // ── Shared: upload image + create record ──────────────────────────────

  async function uploadAndCreateRecord(): Promise<{
    mealId: string;
    s3Link: string;
    userId: string;
    accessToken: string;
  } | null> {
    // Validate required fields
    if (!title.trim()) {
      setTitleError(true);
      return null;
    }
    setTitleError(false);

    // Get current user + session token
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!user || !session) {
      Alert.alert('Error', 'You must be logged in.');
      return null;
    }

    // Upload image if we have one
    let s3Url = '';
    if (imageUri) {
      const { url, error: uploadErr } = await uploadFoodImage(user.id, imageUri);
      if (uploadErr || !url) {
        Alert.alert('Upload Failed', 'Could not upload the image. Please try again.');
        return null;
      }
      s3Url = url;
    }

    // Generate a unique meal ID
    const mealId = uuidv4();

    // Parse numeric fields
    const parsedCalories = calories ? parseFloat(calories) : null;
    const parsedProtein = protein ? parseFloat(protein) : null;

    const { error: createErr } = await createMealRecord({
      meal_id: mealId,
      user_id: user.id,
      title: title.trim(),
      calories: isNaN(parsedCalories as number) ? null : parsedCalories,
      protein: isNaN(parsedProtein as number) ? null : parsedProtein,
      meal_type: mealType ?? null,
      user_notes: mealNotes.trim() || null,
      s3_link: s3Url,
    });

    if (createErr) {
      Alert.alert('Error', 'Failed to save meal record. Please try again.');
      return null;
    }

    // Store record info in Zustand for downstream screens
    setRecordInfo(mealId, s3Url);

    return { mealId, s3Link: s3Url, userId: user.id, accessToken: session.access_token };
  }

  // ── Save Record flow ──────────────────────────────────────────────────

  async function handleSaveRecord() {
    setLoading('savingRecord', true);

    const result = await uploadAndCreateRecord();
    setLoading('savingRecord', false);

    if (!result) return; // error already shown

    // Success — navigate back to history
    reset();
    router.replace('/(tabs)/meal/');
  }

  // ── AI Analysis flow ──────────────────────────────────────────────────

  async function handleAIAnalysis() {
    // Check AI usage limit
    if (aiUsedCount >= AI_LIMIT) {
      Alert.alert(
        'AI Limit Reached',
        `You've used all ${AI_LIMIT} AI analyses for this period. Your meal can still be saved manually.`,
        [{ text: 'OK' }],
      );
      return;
    }

    setLoading('analyzingAI', true);

    const result = await uploadAndCreateRecord();
    if (!result) {
      setLoading('analyzingAI', false);
      return;
    }

    // Increment AI usage count (optimistic local + remote)
    incrementAiUsage();
    incrementAiUsageRemote(result.userId, aiUsedCount).catch((err) =>
      console.warn('[meal] Failed to sync AI usage remotely:', err),
    );

    // Call backend AI endpoint
    const { analysis, error: aiErr } = await analyzeFoodWithAI(result.mealId, result.accessToken);

    setLoading('analyzingAI', false);

    if (aiErr || !analysis) {
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

  // ── Back handler ──────────────────────────────────────────────────────

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
        {/* ── Image section ─────────────────────────────────────────────── */}
        {hasImage ? (
          <TouchableOpacity
            style={styles.imageContainer}
            activeOpacity={0.8}
            onPress={handleAddImage}
          >
            <Image source={{ uri: imageUri! }} style={styles.image} resizeMode="cover" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.imagePlaceholder}
            activeOpacity={0.7}
            onPress={handleAddImage}
          >
            <Camera size={28} color={colors.textMuted} />
            <Text style={styles.imagePlaceholderText}>ADD FOOD IMAGE</Text>
          </TouchableOpacity>
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

          <Field label="ESTIMATED PROTEIN (G)">
            <TextInput
              style={styles.input}
              value={protein}
              onChangeText={(v) => setField('protein', v)}
              placeholder="Optional — AI can estimate this"
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
                    style={[
                      styles.mealTypeChip,
                      isSelected && styles.mealTypeChipSelected,
                    ]}
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

        {/* AI Analysis — primary / accent — disabled when no image */}
        <Button
          title="AI ANALYSIS"
          onPress={handleAIAnalysis}
          variant="primary"
          loading={analyzingAI}
          disabled={isAnyLoading || !hasImage}
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

  // Image preview
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

  // Image placeholder (dotted border)
  imagePlaceholder: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.surface1,
  },
  imagePlaceholderText: {
    fontSize: 11,
    fontFamily: fonts.headingM,
    color: colors.textMuted,
    letterSpacing: 2,
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

  // Meal type picker (chip row)
  mealTypePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealTypeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface1,
  },
  mealTypeChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '20',
  },
  mealTypeChipText: {
    fontSize: 12,
    fontFamily: fonts.bodyMed,
    color: colors.textMuted,
  },
  mealTypeChipTextSelected: {
    color: colors.accent,
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
