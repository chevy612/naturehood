import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { ScrollView, TouchableOpacity, View } from 'react-native';

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
    <View className="flex-row items-center gap-1 py-1.5 border-t border-border/40">
      <Text variant="muted" className="w-4 text-right">{rep.rep_index + 1}</Text>

      <Input
        className="w-17 text-center"
        value={rep.time_seconds != null ? String(rep.time_seconds) : ''}
        onChangeText={(v) => onChange({ time_seconds: num(v) })}
        placeholder="time (s)"
        keyboardType="decimal-pad"
      />
      <Input
        className="w-17 text-center"
        value={rep.wind_ms != null ? String(rep.wind_ms) : ''}
        onChangeText={(v) => onChange({ wind_ms: num(v) })}
        placeholder="wind m/s"
        keyboardType="decimal-pad"
      />

      <TouchableOpacity
        onPress={() => onChange({ completed: !rep.completed })}
        className={`px-2 py-1.5 border ${rep.completed ? 'border-border' : 'border-destructive'}`}
        activeOpacity={0.7}
      >
        <Text className={`text-[9px] uppercase ${rep.completed ? 'text-muted-foreground' : 'text-destructive'}`}>
          {rep.completed ? 'OK' : 'DNF'}
        </Text>
      </TouchableOpacity>

      <Input
        className="flex-1"
        value={rep.notes ?? ''}
        onChangeText={(v) => onChange({ notes: v || null })}
        placeholder="note"
      />

      <TouchableOpacity onPress={onDelete} className="p-1.5" activeOpacity={0.7}>
        <Text className="text-destructive">✕</Text>
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
    <View className="border border-border bg-card p-2 gap-2">
      {/* Drill type selector */}
      <View className="flex-row items-center gap-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-1.5">
            {DRILL_TYPES.map((dt) => {
              const active = effort.drill_type === dt;
              return (
                <TouchableOpacity
                  key={dt}
                  onPress={() => onChange({ drill_type: dt })}
                  className={`px-2.5 py-1 border ${active ? 'bg-primary border-primary' : 'border-border'}`}
                  activeOpacity={0.7}
                >
                  <Text className={`text-[10px] uppercase ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    {dt.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        <TouchableOpacity onPress={onDelete} className="p-1.5" activeOpacity={0.7}>
          <Text className="text-destructive">✕</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics */}
      <View className="flex-row gap-3 flex-wrap">
        <View className="gap-1 items-center">
          <Text variant="muted">Distance (m)</Text>
          <Input
            className="w-18 text-center"
            value={effort.distance_m != null ? String(effort.distance_m) : ''}
            onChangeText={(v) => onChange({ distance_m: num(v) })}
            placeholder="—"
            keyboardType="decimal-pad"
          />
        </View>
        <View className="gap-1 items-center">
          <Text variant="muted">Effort %</Text>
          <Input
            className="w-18 text-center"
            value={effort.effort_percent != null ? String(effort.effort_percent) : ''}
            onChangeText={(v) => onChange({ effort_percent: num(v) as number | null })}
            placeholder="—"
            keyboardType="number-pad"
          />
        </View>
        <View className="gap-1 items-center">
          <Text variant="muted">Rest (s)</Text>
          <Input
            className="w-18 text-center"
            value={effort.rest_between_reps_seconds != null ? String(effort.rest_between_reps_seconds) : ''}
            onChangeText={(v) => onChange({ rest_between_reps_seconds: num(v) as number | null })}
            placeholder="—"
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Reps */}
      <View className="border-t border-border/40 pt-2 gap-0">
        <View className="flex-row items-center gap-1 pb-1">
          <Text className="w-4" />
          <Text variant="muted" className="w-17 text-[9px] uppercase tracking-wide">Time (s)</Text>
          <Text variant="muted" className="w-17 text-[9px] uppercase tracking-wide">Wind</Text>
          <Text variant="muted" className="w-10 text-[9px] uppercase tracking-wide">Status</Text>
          <Text variant="muted" className="flex-1 text-[9px] uppercase tracking-wide">Note</Text>
        </View>
        {effort.reps?.map((rep, i) => (
          <RepRow
            key={i}
            rep={rep}
            onChange={(patch) => updateRep(i, patch)}
            onDelete={() => deleteRep(i)}
          />
        ))}
        <TouchableOpacity onPress={addRep} className="mt-2" activeOpacity={0.7}>
          <Text variant="muted">+ Add Rep</Text>
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

export function SprintPanel({ efforts, surface, footwear, onEffortsChange, onMetaChange }: Props) {
  const updateEffort = (i: number, patch: Partial<DraftSprintEffort>) =>
    onEffortsChange(efforts.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));

  const deleteEffort = (i: number) => onEffortsChange(efforts.filter((_, idx) => idx !== i));

  const addEffort = () => onEffortsChange([...efforts, blankEffort(efforts.length)]);

  return (
    <View className="gap-4">
      <Text variant="small">SPRINT SESSION</Text>

      {/* Session-level meta */}
      <View className="flex-row gap-4 flex-wrap">
        <View className="gap-1">
          <Text variant="muted">Surface</Text>
          <Input
            className="w-35"
            value={surface ?? ''}
            onChangeText={(v) => onMetaChange({ surface: v || null })}
            placeholder="track, grass…"
          />
        </View>
        <View className="gap-1">
          <Text variant="muted">Footwear</Text>
          <Input
            className="w-35"
            value={footwear ?? ''}
            onChangeText={(v) => onMetaChange({ footwear: v || null })}
            placeholder="spikes, flats…"
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

      <TouchableOpacity onPress={addEffort} className="border border-border py-2.5 items-center" activeOpacity={0.7}>
        <Text variant="muted">+ Add Effort</Text>
      </TouchableOpacity>
    </View>
  );
}
