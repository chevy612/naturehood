import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, fonts, spacing } from '../../constants/tokens';

// ── Draft types ───────────────────────────────────────────────────────────────

export type DraftSprintRep = {
  rep_index: number;
  time_seconds: number | null;
  split_times_seconds: number[] | null;
  wind_ms: number | null;
  completed: boolean;
  notes: string | null;
};

export type DraftSprintEffort = {
  effort_index: number;
  drill_type: string;
  distance_m: number | null;
  phase_distances_m: number[] | null;
  effort_percent: number | null;
  footwear: string | null;
  rest_between_reps_seconds: number | null;
  rest_between_sets_seconds: number | null;
  sets: number | null;
  notes: string | null;
  reps: DraftSprintRep[];
};

const DRILL_TYPES = [
  'block_start', 'fly', 'acceleration', 'tempo',
  'speed_endurance', 'hill_sprint', 'hurdle', 'relay_exchange', 'time_trial',
] as const;

const num = (v: string) => (v === '' ? null : isNaN(Number(v)) ? null : Number(v));

function blankRep(rep_index: number): DraftSprintRep {
  return { rep_index, time_seconds: null, split_times_seconds: null, wind_ms: null, completed: true, notes: null };
}

export function blankEffort(effort_index: number): DraftSprintEffort {
  return {
    effort_index, drill_type: 'acceleration',
    distance_m: null, phase_distances_m: null,
    effort_percent: null, footwear: null,
    rest_between_reps_seconds: null, rest_between_sets_seconds: null,
    sets: null, notes: null,
    reps: [blankRep(0)],
  };
}

// ── Rep row ───────────────────────────────────────────────────────────────────

function RepRow({ rep, onChange, onDelete }: {
  rep: DraftSprintRep;
  onChange: (patch: Partial<DraftSprintRep>) => void;
  onDelete: () => void;
}) {
  return (
    <View style={s.repRow}>
      <Text style={s.repIndex}>{rep.rep_index + 1}</Text>

      <TextInput
        style={s.repInput}
        value={rep.time_seconds != null ? String(rep.time_seconds) : ''}
        onChangeText={(v) => onChange({ time_seconds: num(v) })}
        placeholder="time (s)"
        placeholderTextColor={colors.textMuted}
        keyboardType="decimal-pad"
      />
      <TextInput
        style={s.repInput}
        value={rep.wind_ms != null ? String(rep.wind_ms) : ''}
        onChangeText={(v) => onChange({ wind_ms: num(v) })}
        placeholder="wind m/s"
        placeholderTextColor={colors.textMuted}
        keyboardType="decimal-pad"
      />

      <TouchableOpacity
        onPress={() => onChange({ completed: !rep.completed })}
        style={[s.statusBtn, !rep.completed && s.statusBtnDnf]}
        activeOpacity={0.7}
      >
        <Text style={[s.statusBtnText, !rep.completed && s.statusBtnTextDnf]}>
          {rep.completed ? 'OK' : 'DNF'}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={[s.repInput, { flex: 1 }]}
        value={rep.notes ?? ''}
        onChangeText={(v) => onChange({ notes: v || null })}
        placeholder="note"
        placeholderTextColor={colors.textMuted}
      />

      <TouchableOpacity onPress={onDelete} style={s.deleteBtn} activeOpacity={0.7}>
        <Text style={s.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Effort card ───────────────────────────────────────────────────────────────

function EffortCard({ effort, onChange, onDelete }: {
  effort: DraftSprintEffort;
  onChange: (patch: Partial<DraftSprintEffort>) => void;
  onDelete: () => void;
}) {
  const updateRep = (i: number, patch: Partial<DraftSprintRep>) =>
    onChange({ reps: effort.reps.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });

  const deleteRep = (i: number) =>
    onChange({ reps: effort.reps.filter((_, idx) => idx !== i) });

  const addRep = () =>
    onChange({ reps: [...effort.reps, blankRep(effort.reps.length)] });

  return (
    <View style={s.effortCard}>
      {/* Drill type selector */}
      <View style={s.effortHeader}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.drillTypesRow}>
          {DRILL_TYPES.map((dt) => {
            const active = effort.drill_type === dt;
            return (
              <TouchableOpacity
                key={dt}
                onPress={() => onChange({ drill_type: dt })}
                style={[s.drillBtn, active && s.drillBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={[s.drillBtnText, active && s.drillBtnTextActive]}>
                  {dt.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity onPress={onDelete} style={s.deleteBtn} activeOpacity={0.7}>
          <Text style={s.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics */}
      <View style={s.metricsRow}>
        <View style={s.metricField}>
          <Text style={s.metricLabel}>Distance (m)</Text>
          <TextInput
            style={s.metricInput}
            value={effort.distance_m != null ? String(effort.distance_m) : ''}
            onChangeText={(v) => onChange({ distance_m: num(v) })}
            placeholder="—"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={s.metricField}>
          <Text style={s.metricLabel}>Effort %</Text>
          <TextInput
            style={s.metricInput}
            value={effort.effort_percent != null ? String(effort.effort_percent) : ''}
            onChangeText={(v) => onChange({ effort_percent: num(v) as number | null })}
            placeholder="—"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
          />
        </View>
        <View style={s.metricField}>
          <Text style={s.metricLabel}>Rest (s)</Text>
          <TextInput
            style={s.metricInput}
            value={effort.rest_between_reps_seconds != null ? String(effort.rest_between_reps_seconds) : ''}
            onChangeText={(v) => onChange({ rest_between_reps_seconds: num(v) as number | null })}
            placeholder="—"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Reps */}
      <View style={s.repsContainer}>
        <View style={s.repHeaderRow}>
          <Text style={[s.repHeaderLabel, { width: 16 }]} />
          <Text style={[s.repHeaderLabel, { width: 68 }]}>Time (s)</Text>
          <Text style={[s.repHeaderLabel, { width: 68 }]}>Wind</Text>
          <Text style={[s.repHeaderLabel, { width: 40 }]}>Status</Text>
          <Text style={[s.repHeaderLabel, { flex: 1 }]}>Note</Text>
        </View>
        {effort.reps?.map((rep, i) => (
          <RepRow
            key={i}
            rep={rep}
            onChange={(patch) => updateRep(i, patch)}
            onDelete={() => deleteRep(i)}
          />
        ))}
        <TouchableOpacity onPress={addRep} style={s.addSmallBtn} activeOpacity={0.7}>
          <Text style={s.addSmallBtnText}>+ Add Rep</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

type Props = {
  efforts: DraftSprintEffort[];
  surface: string | null;
  footwear: string | null;
  onEffortsChange: (efforts: DraftSprintEffort[]) => void;
  onMetaChange: (patch: { surface?: string | null; footwear?: string | null }) => void;
};

export default function SprintPanel({ efforts, surface, footwear, onEffortsChange, onMetaChange }: Props) {
  const updateEffort = (i: number, patch: Partial<DraftSprintEffort>) =>
    onEffortsChange(efforts.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));

  const deleteEffort = (i: number) => onEffortsChange(efforts.filter((_, idx) => idx !== i));

  const addEffort = () => onEffortsChange([...efforts, blankEffort(efforts.length)]);

  return (
    <View style={s.container}>
      <Text style={s.panelLabel}>SPRINT SESSION</Text>

      {/* Session-level meta */}
      <View style={s.sessionMetaRow}>
        <View style={s.sessionMetaField}>
          <Text style={s.sessionMetaLabel}>Surface</Text>
          <TextInput
            style={s.sessionMetaInput}
            value={surface ?? ''}
            onChangeText={(v) => onMetaChange({ surface: v || null })}
            placeholder="track, grass…"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={s.sessionMetaField}>
          <Text style={s.sessionMetaLabel}>Footwear</Text>
          <TextInput
            style={s.sessionMetaInput}
            value={footwear ?? ''}
            onChangeText={(v) => onMetaChange({ footwear: v || null })}
            placeholder="spikes, flats…"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      {efforts.map((effort, i) => (
        <EffortCard
          key={i}
          effort={effort}
          onChange={(patch) => updateEffort(i, patch)}
          onDelete={() => deleteEffort(i)}
        />
      ))}

      <TouchableOpacity onPress={addEffort} style={s.addOutlineBtn} activeOpacity={0.7}>
        <Text style={s.addOutlineBtnText}>+ Add Effort</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { gap: spacing.md },
  panelLabel: {
    fontSize: 10, fontFamily: fonts.headingM, color: colors.accent,
    letterSpacing: 3, textTransform: 'uppercase',
  },

  sessionMetaRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  sessionMetaField: { gap: 4 },
  sessionMetaLabel: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted },
  sessionMetaInput: {
    width: 140, backgroundColor: colors.surface1,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 10, paddingVertical: 8,
    fontSize: 13, fontFamily: fonts.body, color: colors.textPrimary,
  },

  effortCard: {
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.card, padding: spacing.sm, gap: spacing.sm,
  },
  effortHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  drillTypesRow: { flexDirection: 'row', gap: 6 },
  drillBtn: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  drillBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  drillBtnText: { fontSize: 10, fontFamily: fonts.bodyMed, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  drillBtnTextActive: { color: colors.background },

  metricsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metricField: { gap: 4, alignItems: 'center' },
  metricLabel: { fontSize: 11, fontFamily: fonts.body, color: colors.textMuted },
  metricInput: {
    width: 72, backgroundColor: colors.surface1,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 8, paddingVertical: 6,
    fontSize: 12, fontFamily: fonts.body, color: colors.textPrimary, textAlign: 'center',
  },

  repsContainer: { borderTopWidth: 1, borderTopColor: colors.surface2, paddingTop: 8, gap: 0 },
  repHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 4 },
  repHeaderLabel: { fontSize: 9, fontFamily: fonts.headingM, color: colors.border, textTransform: 'uppercase', letterSpacing: 1 },
  repRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 5, borderTopWidth: 1, borderTopColor: colors.surface2,
  },
  repIndex: { fontSize: 11, color: colors.textMuted, fontFamily: fonts.body, width: 16, textAlign: 'right' },
  repInput: {
    width: 68, backgroundColor: colors.surface1,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 6, paddingVertical: 5,
    fontSize: 12, fontFamily: fonts.body, color: colors.textPrimary, textAlign: 'center',
  },
  statusBtn: {
    paddingHorizontal: 8, paddingVertical: 5,
    borderWidth: 1, borderColor: colors.border,
  },
  statusBtnDnf: { borderColor: colors.error },
  statusBtnText: { fontSize: 9, fontFamily: fonts.bodyMed, color: colors.textMuted, textTransform: 'uppercase' },
  statusBtnTextDnf: { color: colors.error },

  addSmallBtn: { marginTop: 8 },
  addSmallBtnText: { fontSize: 11, fontFamily: fonts.bodyMed, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },

  addOutlineBtn: {
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: 10, alignItems: 'center',
  },
  addOutlineBtnText: { fontSize: 11, fontFamily: fonts.bodyMed, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5 },

  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 13, color: colors.error, fontFamily: fonts.body },
});
