import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../constants/tokens';

export type SessionType =
  | 'strength' | 'sprint' | 'conditioning' | 'competition'
  | 'physio' | 'rehab' | 'recovery' | 'mixed';

export type PerceivedIntensity = 'low' | 'moderate' | 'high' | 'max';

export type ReadinessFeel = 'good' | 'great' | 'tired' | 'sore';

export type SessionMeta = {
  session_type: SessionType;
  perceived_intensity: PerceivedIntensity | null;
  readiness_feel: ReadinessFeel | null;
  readiness_pain_score: number | null;
  session_notes: string | null;
  parser_confidence?: number | null;
  parser_version?: string | null;
  parsing_warnings?: string[] | null;
};

const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: 'strength',     label: 'Strength' },
  { value: 'sprint',       label: 'Sprint' },
  { value: 'conditioning', label: 'Conditioning' },
  { value: 'competition',  label: 'Competition' },
  { value: 'physio',       label: 'Physio' },
  { value: 'rehab',        label: 'Rehab' },
  { value: 'recovery',     label: 'Recovery' },
  { value: 'mixed',        label: 'Mixed' },
];

const INTENSITIES: { value: PerceivedIntensity; label: string }[] = [
  { value: 'low',      label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high',     label: 'High' },
  { value: 'max',      label: 'Max' },
];

const READINESS_FEELS: ReadinessFeel[] = ['good', 'great', 'tired', 'sore'];

type Props = {
  meta: SessionMeta;
  onChange: (patch: Partial<SessionMeta>) => void;
};

export default function SessionMetaPanel({ meta, onChange }: Props) {
  return (
    <View style={s.container}>

      {/* Session type */}
      <View style={s.section}>
        <Text style={s.label}>SESSION TYPE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsRow}>
          {SESSION_TYPES.map(({ value, label }) => {
            const active = meta.session_type === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => onChange({ session_type: value })}
                style={[s.pill, active && s.pillActive]}
                activeOpacity={0.7}
              >
                <Text style={[s.pillText, active && s.pillTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Perceived intensity */}
      <View style={s.section}>
        <Text style={s.label}>INTENSITY</Text>
        <View style={s.pillsRow}>
          {INTENSITIES.map(({ value, label }) => {
            const active = meta.perceived_intensity === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => onChange({ perceived_intensity: active ? null : value })}
                style={[s.pill, active && s.pillActive]}
                activeOpacity={0.7}
              >
                <Text style={[s.pillText, active && s.pillTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Readiness */}
      <View style={s.section}>
        <Text style={s.label}>READINESS</Text>
        <View style={s.pillsRow}>
          {READINESS_FEELS.map((feel) => {
            const active = meta.readiness_feel === feel;
            return (
              <TouchableOpacity
                key={feel}
                onPress={() => onChange({ readiness_feel: active ? null : feel })}
                style={[s.pill, active && s.pillActive]}
                activeOpacity={0.7}
              >
                <Text style={[s.pillText, active && s.pillTextActive]}>
                  {feel.charAt(0).toUpperCase() + feel.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={s.painRow}>
          <Text style={s.painLabel}>Pain score</Text>
          <TextInput
            style={s.painInput}
            value={meta.readiness_pain_score != null ? String(meta.readiness_pain_score) : ''}
            onChangeText={(v) => {
              if (v === '') { onChange({ readiness_pain_score: null }); return; }
              const n = Math.min(10, Math.max(0, Number(v)));
              if (!isNaN(n)) onChange({ readiness_pain_score: n });
            }}
            placeholder="0–10"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Session notes */}
      <View style={s.section}>
        <Text style={s.label}>SESSION NOTES</Text>
        <TextInput
          style={s.notesInput}
          value={meta.session_notes ?? ''}
          onChangeText={(v) => onChange({ session_notes: v || null })}
          placeholder="AI summary or your own notes…"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Parser confidence (read-only) */}
      {meta.parser_confidence != null && (
        <View style={s.confidenceRow}>
          <Text style={s.confidenceLabel}>Parser confidence</Text>
          <Text style={[
            s.confidenceValue,
            meta.parser_confidence >= 0.8 ? { color: colors.accent } :
            meta.parser_confidence >= 0.6 ? { color: colors.textDisabled } :
            { color: colors.error },
          ]}>
            {Math.round(meta.parser_confidence * 100)}%
          </Text>
          {meta.parser_version && (
            <Text style={s.parserVersion}>v{meta.parser_version}</Text>
          )}
        </View>
      )}

      {/* Parsing warnings (read-only) */}
      {meta.parsing_warnings && meta.parsing_warnings.length > 0 && (
        <View style={s.warningsBox}>
          {meta.parsing_warnings.map((w, i) => (
            <Text key={i} style={s.warningText}>{w}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: spacing.lg },
  section:   { gap: spacing.sm },
  label: {
    fontSize: 10,
    fontFamily: fonts.headingM,
    color: colors.accent,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pillText: {
    fontSize: 11,
    fontFamily: fonts.bodyMed,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pillTextActive: { color: colors.background },

  painRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  painLabel: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, width: 80 },
  painInput: {
    width: 64,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  notesInput: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textPrimary,
    minHeight: 72,
    textAlignVertical: 'top',
  },

  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  confidenceLabel: { fontSize: 11, fontFamily: fonts.body, color: colors.textMuted },
  confidenceValue: { fontSize: 11, fontFamily: fonts.bodyMed },
  parserVersion:   { fontSize: 10, fontFamily: fonts.body, color: colors.border },

  warningsBox: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 4,
  },
  warningText: { fontSize: 12, fontFamily: fonts.body, color: colors.textDisabled },
});
