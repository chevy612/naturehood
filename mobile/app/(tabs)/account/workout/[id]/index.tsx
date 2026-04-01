import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../../../lib/supabase';
import { colors, fonts, spacing, commonStyles } from '../../../../../constants/tokens';
import PillTag from '../../../../../components/PillTag';
import SessionResult from '../../../../../components/workout/SessionResult';
import {
  fetchWorkout,
  analyzeWorkoutWithAI,
  isAthleteSessionLog,
  type WorkoutDetail,
  type AiStructuredExercise,
} from '../../../../../lib/actions/workout-detail';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatExerciseMetrics(ex: AiStructuredExercise): string {
  const parts: string[] = [];
  if (ex.sets && ex.reps) parts.push(`${ex.sets} × ${ex.reps}`);
  else if (ex.sets) parts.push(`${ex.sets} sets`);
  else if (ex.reps) parts.push(`${ex.reps} reps`);
  if (ex.weight_kg) parts.push(`${ex.weight_kg} kg`);
  if (ex.distance_km) parts.push(`${ex.distance_km} km`);
  if (ex.duration_seconds) parts.push(`${Math.round(ex.duration_seconds / 60)} min`);
  return parts.join(' · ');
}

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  async function load() {
    if (!id) return;
    const data = await fetchWorkout(id);
    if (data) setWorkout(data);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [id]);

  async function handleAnalyze() {
    if (!workout) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const { error } = await analyzeWorkoutWithAI(workout.id, session.access_token);
      if (error) throw new Error(error);
      await load();
    } catch (err: any) {
      setAnalyzeError(err?.message ?? 'Something went wrong');
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Workout not found.</Text>
      </View>
    );
  }

  const ai = workout.ai_structured;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.body}>
        <Text style={styles.date}>{formatDate(workout.logged_date)}</Text>
        <Text style={styles.title}>{workout.title}</Text>

        <View style={styles.pillsRow}>
          {workout.duration_minutes != null && (
            <View style={styles.durationPill}>
              <Text style={styles.durationText}>{workout.duration_minutes} min</Text>
            </View>
          )}
          {workout.workout_types.map((type) => (
            <PillTag key={type} label={type} variant="ghost-green" />
          ))}
          {!workout.is_public && <PillTag label="Private" variant="ghost-dark" />}
        </View>

        <View style={styles.divider} />

        <Text style={styles.notesLabel}>NOTES</Text>
        {workout.workout_log ? (
          <Text style={styles.notes}>{workout.workout_log}</Text>
        ) : (
          <Text style={styles.notesEmpty}>(No notes recorded)</Text>
        )}

        <View style={styles.divider} />

        {/* Stale banner */}
        {ai && workout.ai_needs_refresh && (
          <View style={styles.staleBanner}>
            <Text style={styles.staleText}>
              Your workout log was edited. This AI report may be outdated.
            </Text>
            <TouchableOpacity onPress={handleAnalyze} disabled={analyzing} activeOpacity={0.7}>
              <Text style={[styles.reanalyseBtn, analyzing && { opacity: 0.5 }]}>
                {analyzing ? 'Analysing…' : 'Re-analyse'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* AI Section */}
        {ai ? (
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiLabel}>AI ANALYSIS</Text>
            </View>

            {/* v2 — AthleteSessionLog */}
            {isAthleteSessionLog(ai) ? (
              <SessionResult session={ai} />
            ) : (
              /* v1 legacy fallback — AiStructuredWorkout */
              <>
                {'estimated_intensity' in ai && ai.estimated_intensity && (
                  <Text style={[
                    styles.aiIntensity,
                    { color: ai.estimated_intensity === 'high' ? colors.accent : colors.textDisabled },
                  ]}>
                    {ai.estimated_intensity} intensity
                  </Text>
                )}
                {'summary' in ai && ai.summary ? (
                  <Text style={styles.aiSummary}>{ai.summary as string}</Text>
                ) : null}
                {'exercises' in ai && Array.isArray(ai.exercises) && ai.exercises.length > 0 && (
                  <View>
                    {(ai.exercises as AiStructuredExercise[]).map((ex, i) => {
                      const metrics = formatExerciseMetrics(ex);
                      return (
                        <View key={i} style={styles.exerciseRow}>
                          <Text style={styles.exerciseName}>{ex.name}</Text>
                          <View style={styles.exerciseRight}>
                            {metrics ? <Text style={styles.exerciseMetrics}>{metrics}</Text> : null}
                            {ex.notes ? <Text style={styles.exerciseNotes}>{ex.notes}</Text> : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </>
            )}

            <TouchableOpacity
              onPress={() => router.push(`/account/workout/${workout.id}/ai-report` as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.editAiText}>Edit AI report →</Text>
            </TouchableOpacity>
          </View>
        ) : workout.workout_log ? (
          <View>
            <Text style={commonStyles.textCaption}>No AI analysis yet.</Text>
            {analyzeError ? <Text style={[commonStyles.textError, { marginTop: 4 }]}>{analyzeError}</Text> : null}
            <TouchableOpacity
              style={[styles.analyzeBtn, analyzing && styles.analyzeBtnDisabled]}
              onPress={handleAnalyze}
              disabled={analyzing}
              activeOpacity={0.8}
            >
              {analyzing ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Text style={styles.analyzeBtnText}>Analyze with AI</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   commonStyles.screen,
  content:     commonStyles.screenContent,
  centered:    commonStyles.centered,
  header:      commonStyles.navHeader,
  backBtn:     commonStyles.navHeaderSpacer,
  backIcon:    commonStyles.navBackIcon,
  headerTitle: commonStyles.navHeaderTitle,
  divider:     commonStyles.divider,
  notesLabel:  { ...commonStyles.sectionLabel, marginBottom: 4 },
  notes:       { ...commonStyles.textBody, lineHeight: 22 },
  errorText:   commonStyles.textCaption,

  body: { padding: spacing.md, gap: spacing.sm },
  date: commonStyles.textCaption,
  title: { fontSize: 20, fontFamily: fonts.heading, color: colors.textPrimary, marginTop: 4 },
  pillsRow: { ...commonStyles.pillsRow, marginTop: 4 },
  durationPill: {
    backgroundColor: colors.surface1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationText: { fontSize: 11, fontFamily: fonts.bodyMed, color: colors.textDisabled },
  notesEmpty: { fontSize: 13, fontFamily: fonts.body, color: colors.textDisabled, fontStyle: 'italic' },

  analyzeBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.accent,
  },
  analyzeBtnDisabled: { opacity: 0.6 },
  analyzeBtnText: {
    fontSize: 12,
    fontFamily: fonts.heading,
    color: colors.background,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  aiCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiLabel: { fontSize: 10, fontFamily: fonts.headingM, color: colors.accent, letterSpacing: 3, textTransform: 'uppercase' },
  aiIntensity: { fontSize: 11, fontFamily: fonts.bodyMed, textTransform: 'uppercase', letterSpacing: 1 },
  aiSummary: { fontSize: 13, fontFamily: fonts.body, color: colors.textDisabled, fontStyle: 'italic', lineHeight: 20 },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  exerciseName: { fontSize: 13, fontFamily: fonts.body, color: colors.textPrimary, flex: 1 },
  exerciseRight: { alignItems: 'flex-end', gap: 2, flexShrink: 0 },
  exerciseMetrics: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted },
  exerciseNotes: { fontSize: 11, fontFamily: fonts.body, color: colors.textMuted, fontStyle: 'italic' },
  editAiText: { fontSize: 12, fontFamily: fonts.bodyMed, color: colors.accent, marginTop: 4 },

  staleBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: '#5C4A1E',
    backgroundColor: '#2A1F0A',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  staleText: { fontSize: 12, fontFamily: fonts.body, color: '#F0B429', flex: 1, lineHeight: 18 },
  reanalyseBtn: {
    fontSize: 11,
    fontFamily: fonts.headingM,
    color: '#F0B429',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    flexShrink: 0,
  },
});
