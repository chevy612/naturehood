import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../../../lib/supabase';
import { colors, fonts, spacing, commonStyles } from '../../../../../constants/tokens';
import { fetchWorkout, updateAiStructured, type AiStructuredExercise, type AiStructuredWorkout } from '../../../../../lib/actions/workout-detail';

const INTENSITY_OPTIONS: Array<'low' | 'moderate' | 'high'> = ['low', 'moderate', 'high'];

export default function AiReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high' | undefined>(undefined);
  const [summary, setSummary] = useState('');
  const [exercises, setExercises] = useState<AiStructuredExercise[]>([]);

  useEffect(() => {
    if (!id) return;
    fetchWorkout(id).then((data) => {
      if (data?.ai_structured) {
        const ai: AiStructuredWorkout = data.ai_structured;
        setIntensity(ai.estimated_intensity);
        setSummary(ai.summary ?? '');
        setExercises(ai.exercises ?? []);
      }
      setLoading(false);
    });
  }, [id]);

  function updateExercise(index: number, field: keyof AiStructuredExercise, value: string) {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[index] };
      if (field === 'name' || field === 'notes' || field === 'reps') {
        (ex as any)[field] = value || undefined;
      } else {
        const num = parseFloat(value);
        (ex as any)[field] = isNaN(num) ? undefined : num;
      }
      next[index] = ex;
      return next;
    });
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function addExercise() {
    setExercises((prev) => [...prev, { name: '' }]);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updated: AiStructuredWorkout = {
        exercises: exercises.filter((ex) => ex.name.trim()),
        summary: summary.trim() || undefined,
        estimated_intensity: intensity,
      };

      const { error } = await updateAiStructured(id!, user.id, updated);
      if (error) throw new Error(error);
      router.back();
    } catch (err: any) {
      setSaveError(err?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={commonStyles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={commonStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={commonStyles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={commonStyles.navHeaderSpacer} activeOpacity={0.7}>
          <Text style={commonStyles.navBackIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={commonStyles.navHeaderTitle}>Edit AI Report</Text>
        <View style={commonStyles.navHeaderSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Intensity */}
        <View style={styles.section}>
          <Text style={commonStyles.sectionLabel}>INTENSITY</Text>
          <View style={styles.intensityRow}>
            {INTENSITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.intensityBtn, intensity === opt && styles.intensityBtnActive]}
                onPress={() => setIntensity(opt)}
                activeOpacity={0.8}
              >
                <Text style={[styles.intensityBtnText, intensity === opt && styles.intensityBtnTextActive]}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={commonStyles.sectionLabel}>SUMMARY</Text>
          <TextInput
            style={styles.textInput}
            value={summary}
            onChangeText={setSummary}
            placeholder="One sentence describing the session…"
            placeholderTextColor={colors.textMuted}
            multiline
          />
        </View>

        {/* Exercises */}
        <View style={styles.section}>
          <Text style={commonStyles.sectionLabel}>EXERCISES</Text>
          {exercises.map((ex, i) => (
            <View key={i} style={styles.exerciseCard}>
              <View style={styles.exerciseNameRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  value={ex.name}
                  onChangeText={(v) => updateExercise(i, 'name', v)}
                  placeholder="Exercise name"
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity onPress={() => removeExercise(i)} activeOpacity={0.7} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.metricsRow}>
                {(['sets', 'reps', 'weight_kg', 'distance_km', 'duration_seconds'] as const).map((field) => (
                  <View key={field} style={styles.metricField}>
                    <Text style={styles.metricLabel}>
                      {field === 'weight_kg' ? 'kg' : field === 'distance_km' ? 'km' : field === 'duration_seconds' ? 'sec' : field}
                    </Text>
                    <TextInput
                      style={styles.metricInput}
                      value={ex[field] != null ? String(ex[field]) : ''}
                      onChangeText={(v) => updateExercise(i, field, v)}
                      keyboardType={field === 'reps' ? 'default' : 'decimal-pad'}
                      placeholder="—"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                ))}
              </View>

              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={ex.notes ?? ''}
                onChangeText={(v) => updateExercise(i, 'notes', v)}
                placeholder="Notes (optional)"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addExercise} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </View>

        {saveError ? (
          <Text style={[commonStyles.textError, { marginHorizontal: spacing.md }]}>{saveError}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 60, gap: spacing.lg },
  section: { paddingHorizontal: spacing.md, gap: spacing.sm },

  intensityRow: { flexDirection: 'row', gap: 8 },
  intensityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    borderRadius: 6,
  },
  intensityBtnActive: { borderColor: colors.accent, backgroundColor: colors.accent + '15' },
  intensityBtnText: { fontSize: 12, fontFamily: fonts.bodyMed, color: colors.textMuted },
  intensityBtnTextActive: { color: colors.accent },

  textInput: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textPrimary,
  },

  exerciseCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    gap: 8,
    backgroundColor: colors.card,
  },
  exerciseNameRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  deleteBtn: { paddingHorizontal: 10, paddingVertical: 10 },
  deleteBtnText: { fontSize: 14, color: colors.error, fontFamily: fonts.body },

  metricsRow: { flexDirection: 'row', gap: 6 },
  metricField: { flex: 1, gap: 3, alignItems: 'center' },
  metricLabel: {
    fontSize: 10,
    fontFamily: fonts.headingM,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metricInput: {
    width: '100%',
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  notesInput: { fontSize: 13, paddingVertical: 8 },

  addBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnText: { fontSize: 13, fontFamily: fonts.bodyMed, color: colors.textMuted },

  saveBtn: {
    marginHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontSize: 13,
    fontFamily: fonts.heading,
    color: colors.background,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});