import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, commonStyles } from '../../constants/tokens';
import PillTag from '../PillTag';

type Props = {
  id: string;
  title: string;
  logged_date: string;
  duration_minutes: number | null;
  workout_types: string[];
  onPress: (id: string) => void;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function WorkoutCard({
  id,
  title,
  logged_date,
  duration_minutes,
  workout_types,
  onPress,
}: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(id)} activeOpacity={0.75}>
      <View style={styles.topRow}>
        <Text style={styles.date}>{formatDate(logged_date)}</Text>
        {duration_minutes != null && (
          <View style={styles.durationPill}>
            <Text style={styles.durationText}>{duration_minutes} min</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>{title}</Text>

      {workout_types.length > 0 && (
        <View style={styles.types}>
          {workout_types.map((type) => (
            <PillTag key={type} label={type} variant="ghost-green" />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
  durationPill: {
    backgroundColor: colors.surface1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationText: {
    fontSize: 11,
    fontFamily: fonts.bodyMed,
    color: colors.textDisabled,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.headingM,
    color: colors.textPrimary,
  },
  types: { ...commonStyles.pillsRow, gap: 6, marginTop: 2 },
});
