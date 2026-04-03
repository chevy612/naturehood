import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { TouchableOpacity, View } from 'react-native';
import { StrengthPanel, type DraftBlock, blankBlock } from './strength-panel';

// ── Draft types ───────────────────────────────────────────────────────────────

export type DraftBodyArea = {
  area_index: number;
  area: string;
  side: 'left' | 'right' | 'bilateral' | null;
  injury_name: string | null;
  pain_score_before: number | null;
  pain_score_after: number | null;
  treatment_type: string | null;
};

const SIDES = ['left', 'right', 'bilateral'] as const;
const PROVIDERS = ['physiotherapist', 'coach', 'self'] as const;
const CLEARANCE_STATUSES = [
  { value: 'cleared',           label: 'Cleared' },
  { value: 'modified_training', label: 'Modified' },
  { value: 'rest_only',         label: 'Rest Only' },
  { value: 'pending_review',    label: 'Pending' },
] as const;

function blankArea(area_index: number): DraftBodyArea {
  return {
    area_index, area: '',
    side: null, injury_name: null,
    pain_score_before: null, pain_score_after: null,
    treatment_type: null,
  };
}

const num = (v: string, max = 10) =>
  v === '' ? null : Math.min(max, Math.max(0, Number(v)));

// ── Body area card ────────────────────────────────────────────────────────────

function BodyAreaCard({ area, onChange, onDelete }: {
  area: DraftBodyArea;
  onChange: (patch: Partial<DraftBodyArea>) => void;
  onDelete: () => void;
}) {
  return (
    <View className="border border-border bg-card p-2 gap-2.5">
      <View className="flex-row items-center gap-2">
        <Input
          className="flex-1"
          value={area.area}
          onChangeText={(v) => onChange({ area: v })}
          placeholder="Body area (e.g. left hamstring)"
        />
        <TouchableOpacity onPress={onDelete} className="p-1.5" activeOpacity={0.7}>
          <Text className="text-destructive">✕</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-2">
        {SIDES.map((side) => {
          const active = area.side === side;
          return (
            <TouchableOpacity
              key={side}
              onPress={() => onChange({ side: active ? null : side })}
              className={`px-3 py-1.5 border ${active ? 'bg-primary border-primary' : 'border-border'}`}
              activeOpacity={0.7}
            >
              <Text className={`text-[10px] uppercase ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {side.charAt(0).toUpperCase() + side.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="flex-row gap-4">
        <View className="flex-row items-center gap-2">
          <Text variant="muted">Pain before</Text>
          <Input
            className="w-14 text-center"
            value={area.pain_score_before != null ? String(area.pain_score_before) : ''}
            onChangeText={(v) => onChange({ pain_score_before: num(v) })}
            placeholder="0–10"
            keyboardType="decimal-pad"
          />
        </View>
        <View className="flex-row items-center gap-2">
          <Text variant="muted">Pain after</Text>
          <Input
            className="w-14 text-center"
            value={area.pain_score_after != null ? String(area.pain_score_after) : ''}
            onChangeText={(v) => onChange({ pain_score_after: num(v) })}
            placeholder="0–10"
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View className="flex-row items-center gap-2.5">
        <Text variant="muted" className="w-16">Injury</Text>
        <Input
          className="flex-1"
          value={area.injury_name ?? ''}
          onChangeText={(v) => onChange({ injury_name: v || null })}
          placeholder="e.g. hamstring strain"
        />
      </View>
      <View className="flex-row items-center gap-2.5">
        <Text variant="muted" className="w-16">Treatment</Text>
        <Input
          className="flex-1"
          value={area.treatment_type ?? ''}
          onChangeText={(v) => onChange({ treatment_type: v || null })}
          placeholder="e.g. dry needling, massage"
        />
      </View>
    </View>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

type Props = {
  bodyAreas: DraftBodyArea[];
  exerciseBlocks: DraftBlock[];
  physioProvider: string | null;
  physioClearanceStatus: string | null;
  physioNotes: string | null;
  onBodyAreasChange: (areas: DraftBodyArea[]) => void;
  onExerciseBlocksChange: (blocks: DraftBlock[]) => void;
  onDetailsChange: (patch: { physioProvider?: string | null; physioClearanceStatus?: string | null; physioNotes?: string | null }) => void;
};

export function PhysioPanel({
  bodyAreas, exerciseBlocks,
  physioProvider, physioClearanceStatus, physioNotes,
  onBodyAreasChange, onExerciseBlocksChange, onDetailsChange,
}: Props) {
  const updateArea = (i: number, patch: Partial<DraftBodyArea>) =>
    onBodyAreasChange(bodyAreas.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  const deleteArea = (i: number) => onBodyAreasChange(bodyAreas.filter((_, idx) => idx !== i));

  const addArea = () => onBodyAreasChange([...bodyAreas, blankArea(bodyAreas.length)]);

  return (
    <View className="gap-4">
      <Text variant="small">PHYSIO SESSION</Text>

      {/* Provider */}
      <View className="gap-2">
        <Text variant="small">PROVIDER</Text>
        <View className="flex-row flex-wrap gap-2">
          {PROVIDERS.map((p) => {
            const active = physioProvider === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => onDetailsChange({ physioProvider: active ? null : p })}
                className={`px-3.5 py-2 border ${active ? 'bg-primary border-primary' : 'border-border'}`}
                activeOpacity={0.7}
              >
                <Text className={active ? 'text-primary-foreground' : 'text-muted-foreground'}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Clearance */}
      <View className="gap-2">
        <Text variant="small">CLEARANCE</Text>
        <View className="flex-row flex-wrap gap-2">
          {CLEARANCE_STATUSES.map(({ value, label }) => {
            const active = physioClearanceStatus === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => onDetailsChange({ physioClearanceStatus: active ? null : value })}
                className={`px-3.5 py-2 border ${active ? 'bg-primary border-primary' : 'border-border'}`}
                activeOpacity={0.7}
              >
                <Text className={active ? 'text-primary-foreground' : 'text-muted-foreground'}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Textarea
        value={physioNotes ?? ''}
        onChangeText={(v) => onDetailsChange({ physioNotes: v || null })}
        placeholder="Physio session notes…"
        numberOfLines={2}
      />

      {/* Body areas */}
      <View className="gap-2">
        <Text variant="small">BODY AREAS</Text>
        {bodyAreas.map((area, i) => (
          <BodyAreaCard
            key={i}
            area={area}
            onChange={(patch) => updateArea(i, patch)}
            onDelete={() => deleteArea(i)}
          />
        ))}
        <TouchableOpacity onPress={addArea} className="border border-border py-2.5 items-center" activeOpacity={0.7}>
          <Text variant="muted">+ Add Body Area</Text>
        </TouchableOpacity>
      </View>

      {/* Rehab exercises */}
      {exerciseBlocks.length > 0 ? (
        <StrengthPanel blocks={exerciseBlocks} onChange={onExerciseBlocksChange} />
      ) : (
        <TouchableOpacity
          onPress={() => onExerciseBlocksChange([{
            ...blankBlock(0),
            block_name: 'Rehab Exercises',
            exercises: [],
          }])}
          className="border border-border py-2.5 items-center"
          activeOpacity={0.7}
        >
          <Text variant="muted">+ Add Rehab Exercises</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
