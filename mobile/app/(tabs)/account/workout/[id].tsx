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
import { supabase } from '../../../../lib/supabase';
import { colors, fonts, spacing, commonStyles } from '../../../../constants/tokens';
import PillTag from '../../../../components/PillTag';

type WorkoutDetail = {
  id: string;
  title: string;
  logged_date: string;
  duration_minutes: number | null;
  workout_types: string[];
  workout_log: string | null;
  is_public: boolean;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    supabase
      .from('training_logs')
      .select('id, title, logged_date, duration_minutes, workout_types, workout_log, is_public')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setWorkout(data);
        setLoading(false);
      });
  }, [id]);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.date}>{formatDate(workout.logged_date)}</Text>
        <Text style={styles.title}>{workout.title}</Text>

        {/* Pills row */}
        <View style={styles.pillsRow}>
          {workout.duration_minutes != null && (
            <View style={styles.durationPill}>
              <Text style={styles.durationText}>{workout.duration_minutes} min</Text>
            </View>
          )}
          {workout.workout_types.map((type) => (
            <PillTag key={type} label={type} variant="ghost-green" />
          ))}
          {!workout.is_public && (
            <PillTag label="Private" variant="ghost-dark" />
          )}
        </View>

        <View style={styles.divider} />

        {/* Notes */}
        <Text style={styles.notesLabel}>NOTES</Text>
        {workout.workout_log ? (
          <Text style={styles.notes}>{workout.workout_log}</Text>
        ) : (
          <Text style={styles.notesEmpty}>(No notes recorded)</Text>
        )}
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

  body: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  date: commonStyles.textCaption,
  title: {
    fontSize: 20,
    fontFamily: fonts.heading,
    color: colors.textPrimary,
    marginTop: 4,
  },

  pillsRow: { ...commonStyles.pillsRow, marginTop: 4 },
  durationPill: {
    backgroundColor: colors.surface1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationText: {
    fontSize: 11,
    fontFamily: fonts.bodyMed,
    color: colors.textDisabled,
  },

  notesEmpty: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textDisabled,
    fontStyle: 'italic',
  },
  errorText: commonStyles.textCaption,
});
