import { useState } from 'react';
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
import { ChevronLeft, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../../lib/supabase';
import {
  createMealRecord,
  uploadFoodImage,
  incrementAiUsageRemote,
} from '../../../lib/actions/meal';
import { analyzeFoodWithAI } from '../../../lib/services/ai-food-analysis';
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '../../../lib/types/meal';
import type { AiFoodAnalysis, MealType } from '../../../lib/types/meal';
import { useMealStore } from '../../../stores/meal-store';
import { useAiUsageStore, AI_LIMIT } from '../../../stores/meal-store';
import { parseNullableFloat } from '../../../utils/mealUtils';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { SectionLabel } from '@/components/layout/section-label';
import { colors } from '../../../constants/tokens';

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
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.back,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    console.log('[fill-up] uploadAndCreateRecord() start');

    if (!title.trim()) {
      console.log('[fill-up] returning null — title empty');
      setTitleError(true);
      return null;
    }
    setTitleError(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log('[fill-up] user:', user?.id ?? 'null', '| session:', session ? 'present' : 'null');

    if (!user || !session) {
      Alert.alert('Error', 'You must be logged in.');
      return null;
    }

    let s3Url = '';
    if (imageUri) {
      console.log('[fill-up] uploading image, uri length:', imageUri.length);
      const { url, error: uploadErr } = await uploadFoodImage(user.id, imageUri);
      console.log('[fill-up] upload result — url:', url, '| error:', uploadErr);
      if (uploadErr || !url) {
        Alert.alert('Upload Failed', 'Could not upload the image. Please try again.');
        return null;
      }
      s3Url = url;
    }

    const mealId = uuidv4();
    console.log('[fill-up] generated mealId:', mealId);

    const parsedCalories = parseNullableFloat(calories);
    const parsedProtein = parseNullableFloat(protein);

    console.log('[fill-up] calling createMealRecord — s3_link:', s3Url || '(empty)');
    const { error: createErr } = await createMealRecord({
      meal_id: mealId,
      user_id: user.id,
      title: title.trim(),
      calories: parsedCalories,
      protein: parsedProtein,
      meal_type: mealType ?? null,
      user_notes: mealNotes.trim() || null,
      s3_link: s3Url,
    });

    console.log('[fill-up] createMealRecord error:', createErr ?? 'none');

    if (createErr) {
      Alert.alert('Error', 'Failed to save meal record. Please try again.');
      return null;
    }

    setRecordInfo(mealId, s3Url);

    console.log('[fill-up] uploadAndCreateRecord() success — mealId:', mealId);
    return { mealId, s3Link: s3Url, userId: user.id, accessToken: session.access_token };
  }

  // ── Save Record flow ──────────────────────────────────────────────────

  async function handleSaveRecord() {
    setLoading('savingRecord', true);
    const result = await uploadAndCreateRecord();
    setLoading('savingRecord', false);
    if (!result) return;
    reset();
    router.replace('/(tabs)/meal/');
  }

  // ── AI Analysis flow ──────────────────────────────────────────────────

  async function handleAIAnalysis() {
    console.log('[fill-up] handleAIAnalysis() — aiUsedCount:', aiUsedCount, '/ limit:', AI_LIMIT);

    if (aiUsedCount >= AI_LIMIT) {
      Alert.alert(
        'AI Limit Reached',
        `You've used all ${AI_LIMIT} AI analyses for this period. Your meal can still be saved manually.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading('analyzingAI', true);

    const result = await uploadAndCreateRecord();
    console.log('[fill-up] uploadAndCreateRecord result:', result ? 'ok' : 'null');
    if (!result) {
      setLoading('analyzingAI', false);
      return;
    }

    incrementAiUsage();
    incrementAiUsageRemote(result.userId, aiUsedCount).catch((err) =>
      console.warn('[meal] Failed to sync AI usage remotely:', err)
    );

    console.log('[fill-up] calling analyzeFoodWithAI — mealId:', result.mealId);
    const { analysis, error: aiErr } = await analyzeFoodWithAI(result.mealId, result.accessToken);

    console.log(
      '[fill-up] analyzeFoodWithAI — analysis:',
      analysis ? 'present' : 'null',
      '| error:',
      aiErr ?? 'none'
    );
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
        ]
      );
      return;
    }

    setAiResult(analysis as AiFoodAnalysis);
    router.push('/(tabs)/meal/summary');
  }

  // ── Back handler ──────────────────────────────────────────────────────

  function handleBack() {
    reset();
    router.back();
  }

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
        <Text className="flex-1 text-center text-sm font-semibold">Log Your Meal</Text>
        {/* Spacer to balance the back button */}
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 160 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* ── Image section ─────────────────────────────────────────────── */}
        {hasImage ? (
          <TouchableOpacity
            className="mx-4 mt-4 rounded-xl overflow-hidden border border-border"
            activeOpacity={0.8}
            onPress={handleAddImage}
          >
            <Image source={{ uri: imageUri! }} className="w-full h-60" resizeMode="cover" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="mx-4 mt-4 h-44 rounded-xl border-2 border-border border-dashed bg-surface-1 items-center justify-center gap-2"
            activeOpacity={0.7}
            onPress={handleAddImage}
          >
            <Icon as={Camera} size={28} className="text-muted-foreground" />
            <Text variant="muted" className="text-[11px] font-semibold tracking-widest uppercase">
              Add Food Image
            </Text>
          </TouchableOpacity>
        )}

        {/* ── Form fields ───────────────────────────────────────────────── */}
        <View className="p-4 gap-5">
          <Field label="Meal Title *">
            <Input
              value={title}
              onChangeText={(t) => {
                setField('title', t);
                if (t.trim()) setTitleError(false);
              }}
              placeholder="e.g. Grilled chicken salad"
              className={titleError ? 'border-destructive' : ''}
            />
            {titleError && <Text className="text-destructive text-sm mt-1">Title is required</Text>}
          </Field>

          <Field label="Calories (kcal)">
            <Input
              value={calories}
              onChangeText={(v) => setField('calories', v)}
              placeholder="Optional — AI can estimate this"
              keyboardType="numeric"
            />
          </Field>

          <Field label="Estimated Protein (g)">
            <Input
              value={protein}
              onChangeText={(v) => setField('protein', v)}
              placeholder="Optional — AI can estimate this"
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

          <Field label="Meal Notes">
            <Textarea
              value={mealNotes}
              onChangeText={(v) => setField('mealNotes', v)}
              placeholder="Any extra details? e.g. homemade, restaurant, dressing, etc."
              numberOfLines={4}
            />
          </Field>
        </View>
      </ScrollView>

      {/* ── Bottom buttons ───────────────────────────────────────────────── */}
      <View className="absolute bottom-0 left-0 right-0 p-4 pb-8 gap-2.5 bg-background border-t border-border">
        <Button variant="outline" onPress={handleSaveRecord} disabled={isAnyLoading}>
          {savingRecord ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text>SAVE RECORD</Text>
          )}
        </Button>

        <Button variant="default" onPress={handleAIAnalysis} disabled={isAnyLoading || !hasImage}>
          {analyzingAI ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text>AI ANALYSIS</Text>
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
