import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../constants/tokens';

// ── Draft types ───────────────────────────────────────────────────────────────

export type DraftSet = {
  set_index: number;
  is_warmup: boolean;
  is_failure: boolean;
  is_dropset: boolean;
  weight_kg: number | null;
  weight_type: string | null;
  weight_value_raw: string | null;
  added_weight_kg: number | null;
  machine_level: number | null;
  reps: number | null;
  reps_left: number | null;
  reps_right: number | null;
  duration_seconds: number | null;
  distance_m: number | null;
  pace_seconds_per_km: number | null;
  time_seconds: number | null;
  splits_seconds: number[] | null;
  effort_percent: number | null;
  rest_seconds: number | null;
  rest_between_reps_seconds: number | null;
  notes: string | null;
};

export type DraftExercise = {
  exercise_index: number;
  name: string;
  name_original: string | null;
  name_unknown: boolean;
  category: string | null;
  equipment: string | null;
  laterality: string | null;
  is_superset_with: number | null;
  notes: string | null;
  total_volume_kg: number | null;
  max_weight_kg: number | null;
  total_reps: number | null;
  set_count: number | null;
  sets: DraftSet[];
};

export type DraftBlock = {
  block_index: number;
  block_name: string | null;
  block_type: string | null;
  emom_interval_seconds: number | null;
  circuit_rounds: number | null;
  intensity_percent: number | null;
  notes: string | null;
  exercises: DraftExercise[];
};

// ── Blank constructors ────────────────────────────────────────────────────────

function blankSet(set_index: number): DraftSet {
  return {
    set_index,
    is_warmup: false, is_failure: false, is_dropset: false,
    weight_kg: null, weight_type: null, weight_value_raw: null,
    added_weight_kg: null, machine_level: null,
    reps: null, reps_left: null, reps_right: null,
    duration_seconds: null, distance_m: null,
    pace_seconds_per_km: null, time_seconds: null,
    splits_seconds: null, effort_percent: null,
    rest_seconds: null, rest_between_reps_seconds: null,
    notes: null,
  };
}

function blankExercise(exercise_index: number): DraftExercise {
  return {
    exercise_index, name: '',
    name_original: null, name_unknown: false,
    category: null, equipment: null, laterality: null,
    is_superset_with: null, notes: null,
    total_volume_kg: null, max_weight_kg: null,
    total_reps: null, set_count: null,
    sets: [blankSet(0)],
  };
}

export function blankBlock(block_index: number): DraftBlock {
  return {
    block_index, block_name: null, block_type: 'main',
    emom_interval_seconds: null, circuit_rounds: null,
    intensity_percent: null, notes: null,
    exercises: [blankExercise(0)],
  };
}

const BLOCK_TYPES = [
  { value: 'warmup',   label: 'Warm-up' },
  { value: 'main',     label: 'Main' },
  { value: 'cooldown', label: 'Cool-down' },
  { value: 'circuit',  label: 'Circuit' },
  { value: 'emom',     label: 'EMOM' },
  { value: 'amrap',    label: 'AMRAP' },
  { value: 'superset', label: 'Superset' },
];

const num = (v: string) => (v === '' ? null : isNaN(Number(v)) ? null : Number(v));

// ── Set row ───────────────────────────────────────────────────────────────────

function SetRow({ set, onChange, onDelete }: {
  set: DraftSet;
  onChange: (patch: Partial<DraftSet>) => void;
  onDelete: () => void;
}) {
  return (
    <View style={s.setRow}>
      <Text style={s.setIndex}>{set.set_index + 1}</Text>

      {/* Flags: WU / F / D */}
      <View style={s.flagsRow}>
        {(['is_warmup', 'is_failure', 'is_dropset'] as const).map((flag) => (
          <TouchableOpacity
            key={flag}
            onPress={() => onChange({ [flag]: !set[flag] })}
            style={[s.flagBtn, set[flag] && s.flagBtnActive]}
            activeOpacity={0.7}
          >
            <Text style={[s.flagBtnText, set[flag] && s.flagBtnTextActive]}>
              {flag === 'is_warmup' ? 'WU' : flag === 'is_failure' ? 'F' : 'D'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={s.setInput}
        value={set.weight_kg != null ? String(set.weight_kg) : ''}
        onChangeText={(v) => onChange({ weight_kg: num(v) })}
        placeholder="kg"
        placeholderTextColor={colors.textMuted}
        keyboardType="decimal-pad"
      />
      <TextInput
        style={s.setInput}
        value={set.reps != null ? String(set.reps) : ''}
        onChangeText={(v) => onChange({ reps: num(v) as number | null })}
        placeholder="reps"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
      />
      <TextInput
        style={[s.setInput, { width: 40 }]}
        value={set.effort_percent != null ? String(set.effort_percent) : ''}
        onChangeText={(v) => onChange({ effort_percent: num(v) as number | null })}
        placeholder="%"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
      />
      <TextInput
        style={[s.setInput, { flex: 1 }]}
        value={set.notes ?? ''}
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

// ── Exercise card ─────────────────────────────────────────────────────────────

function ExerciseCard({ exercise, onChange, onDelete }: {
  exercise: DraftExercise;
  onChange: (patch: Partial<DraftExercise>) => void;
  onDelete: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const updateSet = (i: number, patch: Partial<DraftSet>) =>
    onChange({ sets: exercise.sets.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });

  const deleteSet = (i: number) =>
    onChange({ sets: exercise.sets.filter((_, idx) => idx !== i) });

  const addSet = () =>
    onChange({ sets: [...exercise.sets, blankSet(exercise.sets.length)] });

  return (
    <View style={s.exerciseCard}>
      <View style={s.exerciseHeader}>
        <TextInput
          style={s.exerciseName}
          value={exercise.name}
          onChangeText={(v) => onChange({ name: v })}
          placeholder="Exercise name"
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity onPress={() => setCollapsed((c) => !c)} style={s.collapseBtn} activeOpacity={0.7}>
          <Text style={s.collapseBtnText}>{collapsed ? '▸' : '▾'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={s.deleteBtn} activeOpacity={0.7}>
          <Text style={s.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {!collapsed && (
        <View style={s.setsContainer}>
          <View style={s.setHeaderRow}>
            <Text style={[s.setHeaderLabel, { width: 16 }]} />
            <Text style={[s.setHeaderLabel, { width: 52 }]}>Flags</Text>
            <Text style={[s.setHeaderLabel, { width: 52 }]}>Weight</Text>
            <Text style={[s.setHeaderLabel, { width: 44 }]}>Reps</Text>
            <Text style={[s.setHeaderLabel, { width: 40 }]}>Effort</Text>
            <Text style={[s.setHeaderLabel, { flex: 1 }]}>Note</Text>
          </View>
          {exercise.sets.map((set, i) => (
            <SetRow
              key={i}
              set={set}
              onChange={(patch) => updateSet(i, patch)}
              onDelete={() => deleteSet(i)}
            />
          ))}
          <TouchableOpacity onPress={addSet} style={s.addSmallBtn} activeOpacity={0.7}>
            <Text style={s.addSmallBtnText}>+ Add Set</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Block card ────────────────────────────────────────────────────────────────

function BlockCard({ block, onChange, onDelete }: {
  block: DraftBlock;
  onChange: (patch: Partial<DraftBlock>) => void;
  onDelete: () => void;
}) {
  const updateExercise = (i: number, patch: Partial<DraftExercise>) =>
    onChange({ exercises: block.exercises.map((ex, idx) => (idx === i ? { ...ex, ...patch } : ex)) });

  const deleteExercise = (i: number) =>
    onChange({ exercises: block.exercises.filter((_, idx) => idx !== i) });

  const addExercise = () =>
    onChange({ exercises: [...block.exercises, blankExercise(block.exercises.length)] });

  return (
    <View style={s.blockCard}>
      <View style={s.blockHeader}>
        <View style={{ flex: 1, gap: 8 }}>
          <TextInput
            style={s.blockName}
            value={block.block_name ?? ''}
            onChangeText={(v) => onChange({ block_name: v || null })}
            placeholder="Block name (optional)"
            placeholderTextColor={colors.textMuted}
          />
          <View style={s.blockTypesRow}>
            {BLOCK_TYPES.map(({ value, label }) => {
              const active = block.block_type === value;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => onChange({ block_type: value })}
                  style={[s.typeBtn, active && s.typeBtnActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[s.typeBtnText, active && s.typeBtnTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <TouchableOpacity onPress={onDelete} style={s.deleteBtn} activeOpacity={0.7}>
          <Text style={s.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 8 }}>
        {block.exercises.map((ex, i) => (
          <ExerciseCard
            key={i}
            exercise={ex}
            onChange={(patch) => updateExercise(i, patch)}
            onDelete={() => deleteExercise(i)}
          />
        ))}
      </View>

      <TouchableOpacity onPress={addExercise} style={s.addOutlineBtn} activeOpacity={0.7}>
        <Text style={s.addOutlineBtnText}>+ Add Exercise</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

type Props = {
  blocks: DraftBlock[];
  onChange: (blocks: DraftBlock[]) => void;
};

export default function StrengthPanel({ blocks, onChange }: Props) {
  const updateBlock = (i: number, patch: Partial<DraftBlock>) =>
    onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

  const deleteBlock = (i: number) => onChange(blocks.filter((_, idx) => idx !== i));

  const addBlock = () => onChange([...blocks, blankBlock(blocks.length)]);

  return (
    <View style={s.container}>
      <Text style={s.panelLabel}>BLOCKS & EXERCISES</Text>

      {blocks.map((block, i) => (
        <BlockCard
          key={i}
          block={block}
          onChange={(patch) => updateBlock(i, patch)}
          onDelete={() => deleteBlock(i)}
        />
      ))}

      <TouchableOpacity onPress={addBlock} style={s.addOutlineBtn} activeOpacity={0.7}>
        <Text style={s.addOutlineBtnText}>+ Add Block</Text>
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

  blockCard: {
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.sm, gap: spacing.sm,
  },
  blockHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  blockName: {
    fontSize: 13, fontFamily: fonts.heading, color: colors.textPrimary,
    borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 4,
  },
  blockTypesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeBtn: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  typeBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  typeBtnText: { fontSize: 10, fontFamily: fonts.bodyMed, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  typeBtnTextActive: { color: colors.background },

  exerciseCard: {
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
  },
  exerciseHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8,
  },
  exerciseName: {
    flex: 1, fontSize: 13, fontFamily: fonts.heading, color: colors.textPrimary,
  },
  collapseBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  collapseBtnText: { fontSize: 14, color: colors.textMuted },

  setsContainer: {
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: 12, paddingBottom: 10,
  },
  setHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 8, paddingBottom: 4 },
  setHeaderLabel: { fontSize: 9, fontFamily: fonts.headingM, color: colors.border, textTransform: 'uppercase', letterSpacing: 1 },

  setRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.surface2,
  },
  setIndex: { fontSize: 11, color: colors.textMuted, fontFamily: fonts.body, width: 16, textAlign: 'right' },
  flagsRow: { flexDirection: 'row', gap: 3 },
  flagBtn: {
    paddingHorizontal: 4, paddingVertical: 2,
    borderWidth: 1, borderColor: colors.border,
  },
  flagBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  flagBtnText: { fontSize: 9, fontFamily: fonts.bodyMed, color: colors.border, textTransform: 'uppercase' },
  flagBtnTextActive: { color: colors.background },
  setInput: {
    width: 52, backgroundColor: colors.surface1,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 6, paddingVertical: 5,
    fontSize: 12, fontFamily: fonts.body, color: colors.textPrimary, textAlign: 'center',
  },

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
