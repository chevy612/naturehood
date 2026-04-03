import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { TouchableOpacity, View } from 'react-native';

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
    <View className="flex-row items-center gap-1 py-1.5 border-t border-border/40">
      <Text variant="muted" className="w-4 text-right">{set.set_index + 1}</Text>

      <View className="flex-row gap-0.5">
        {(['is_warmup', 'is_failure', 'is_dropset'] as const).map((flag) => (
          <TouchableOpacity
            key={flag}
            onPress={() => onChange({ [flag]: !set[flag] })}
            className={`px-1 py-0.5 border ${set[flag] ? 'bg-primary border-primary' : 'border-border'}`}
            activeOpacity={0.7}
          >
            <Text className={`text-[9px] uppercase ${set[flag] ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              {flag === 'is_warmup' ? 'WU' : flag === 'is_failure' ? 'F' : 'D'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        className="w-13 text-center"
        value={set.weight_kg != null ? String(set.weight_kg) : ''}
        onChangeText={(v) => onChange({ weight_kg: num(v) })}
        placeholder="kg"
        keyboardType="decimal-pad"
      />
      <Input
        className="w-11 text-center"
        value={set.reps != null ? String(set.reps) : ''}
        onChangeText={(v) => onChange({ reps: num(v) as number | null })}
        placeholder="reps"
        keyboardType="number-pad"
      />
      <Input
        className="w-10 text-center"
        value={set.effort_percent != null ? String(set.effort_percent) : ''}
        onChangeText={(v) => onChange({ effort_percent: num(v) as number | null })}
        placeholder="%"
        keyboardType="number-pad"
      />
      <Input
        className="flex-1"
        value={set.notes ?? ''}
        onChangeText={(v) => onChange({ notes: v || null })}
        placeholder="note"
      />

      <TouchableOpacity onPress={onDelete} className="p-1.5" activeOpacity={0.7}>
        <Text className="text-destructive">✕</Text>
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
    <View className="border border-border bg-card">
      <View className="flex-row items-center gap-2 px-3 pt-2.5 pb-2">
        <Input
          className="flex-1"
          value={exercise.name}
          onChangeText={(v) => onChange({ name: v })}
          placeholder="Exercise name"
        />
        <TouchableOpacity onPress={() => setCollapsed((c) => !c)} className="px-1.5 py-1" activeOpacity={0.7}>
          <Text variant="muted">{collapsed ? '▸' : '▾'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} className="p-1.5" activeOpacity={0.7}>
          <Text className="text-destructive">✕</Text>
        </TouchableOpacity>
      </View>

      {!collapsed && (
        <View className="border-t border-border px-3 pb-2.5">
          <View className="flex-row items-center gap-1 pt-2 pb-1">
            <Text className="w-4" />
            <Text variant="muted" className="w-13 text-[9px] uppercase tracking-wide">Flags</Text>
            <Text variant="muted" className="w-11 text-[9px] uppercase tracking-wide">Weight</Text>
            <Text variant="muted" className="w-11 text-[9px] uppercase tracking-wide">Reps</Text>
            <Text variant="muted" className="w-10 text-[9px] uppercase tracking-wide">Effort</Text>
            <Text variant="muted" className="flex-1 text-[9px] uppercase tracking-wide">Note</Text>
          </View>
          {exercise.sets.map((set, i) => (
            <SetRow
              key={i}
              set={set}
              onChange={(patch) => updateSet(i, patch)}
              onDelete={() => deleteSet(i)}
            />
          ))}
          <TouchableOpacity onPress={addSet} className="mt-2" activeOpacity={0.7}>
            <Text variant="muted">+ Add Set</Text>
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
    <View className="border border-border p-2 gap-2">
      <View className="flex-row items-start gap-2">
        <View className="flex-1 gap-2">
          <Input
            value={block.block_name ?? ''}
            onChangeText={(v) => onChange({ block_name: v || null })}
            placeholder="Block name (optional)"
          />
          <View className="flex-row flex-wrap gap-1.5">
            {BLOCK_TYPES.map(({ value, label }) => {
              const active = block.block_type === value;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => onChange({ block_type: value })}
                  className={`px-2.5 py-1 border ${active ? 'bg-primary border-primary' : 'border-border'}`}
                  activeOpacity={0.7}
                >
                  <Text className={`text-[10px] uppercase ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <TouchableOpacity onPress={onDelete} className="p-1.5" activeOpacity={0.7}>
          <Text className="text-destructive">✕</Text>
        </TouchableOpacity>
      </View>

      <View className="gap-2">
        {block.exercises.map((ex, i) => (
          <ExerciseCard
            key={i}
            exercise={ex}
            onChange={(patch) => updateExercise(i, patch)}
            onDelete={() => deleteExercise(i)}
          />
        ))}
      </View>

      <TouchableOpacity onPress={addExercise} className="border border-border py-2.5 items-center" activeOpacity={0.7}>
        <Text variant="muted">+ Add Exercise</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

type Props = {
  blocks: DraftBlock[];
  onChange: (blocks: DraftBlock[]) => void;
};

export function StrengthPanel({ blocks, onChange }: Props) {
  const updateBlock = (i: number, patch: Partial<DraftBlock>) =>
    onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

  const deleteBlock = (i: number) => onChange(blocks.filter((_, idx) => idx !== i));

  const addBlock = () => onChange([...blocks, blankBlock(blocks.length)]);

  return (
    <View className="gap-4">
      <Text variant="small">BLOCKS & EXERCISES</Text>

      {blocks.map((block, i) => (
        <BlockCard
          key={i}
          block={block}
          onChange={(patch) => updateBlock(i, patch)}
          onDelete={() => deleteBlock(i)}
        />
      ))}

      <TouchableOpacity onPress={addBlock} className="border border-border py-2.5 items-center" activeOpacity={0.7}>
        <Text variant="muted">+ Add Block</Text>
      </TouchableOpacity>
    </View>
  );
}
