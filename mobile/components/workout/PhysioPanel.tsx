import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../constants/tokens';
import StrengthPanel, { type DraftBlock, blankBlock } from './StrengthPanel';

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
    <View style={s.areaCard}>
      <View style={s.areaHeader}>
        <TextInput
          style={s.areaName}
          value={area.area}
          onChangeText={(v) => onChange({ area: v })}
          placeholder="Body area (e.g. left hamstring)"
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity onPress={onDelete} style={s.deleteBtn} activeOpacity={0.7}>
          <Text style={s.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Side */}
      <View style={s.sidesRow}>
        {SIDES.map((side) => {
          const active = area.side === side;
          return (
            <TouchableOpacity
              key={side}
              onPress={() => onChange({ side: active ? null : side })}
              style={[s.sideBtn, active && s.sideBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={[s.sideBtnText, active && s.sideBtnTextActive]}>
                {side.charAt(0).toUpperCase() + side.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pain scores */}
      <View style={s.painRow}>
        <View style={s.painField}>
          <Text style={s.painLabel}>Pain before</Text>
          <TextInput
            style={s.painInput}
            value={area.pain_score_before != null ? String(area.pain_score_before) : ''}
            onChangeText={(v) => onChange({ pain_score_before: num(v) })}
            placeholder="0–10"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={s.painField}>
          <Text style={s.painLabel}>Pain after</Text>
          <TextInput
            style={s.painInput}
            value={area.pain_score_after != null ? String(area.pain_score_after) : ''}
            onChangeText={(v) => onChange({ pain_score_after: num(v) })}
            placeholder="0–10"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Injury + treatment */}
      <View style={s.fieldRow}>
        <Text style={s.fieldLabel}>Injury</Text>
        <TextInput
          style={s.fieldInput}
          value={area.injury_name ?? ''}
          onChangeText={(v) => onChange({ injury_name: v || null })}
          placeholder="e.g. hamstring strain"
          placeholderTextColor={colors.textMuted}
        />
      </View>
      <View style={s.fieldRow}>
        <Text style={s.fieldLabel}>Treatment</Text>
        <TextInput
          style={s.fieldInput}
          value={area.treatment_type ?? ''}
          onChangeText={(v) => onChange({ treatment_type: v || null })}
          placeholder="e.g. dry needling, massage"
          placeholderTextColor={colors.textMuted}
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

export default function PhysioPanel({
  bodyAreas, exerciseBlocks,
  physioProvider, physioClearanceStatus, physioNotes,
  onBodyAreasChange, onExerciseBlocksChange, onDetailsChange,
}: Props) {
  const updateArea = (i: number, patch: Partial<DraftBodyArea>) =>
    onBodyAreasChange(bodyAreas.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  const deleteArea = (i: number) => onBodyAreasChange(bodyAreas.filter((_, idx) => idx !== i));

  const addArea = () => onBodyAreasChange([...bodyAreas, blankArea(bodyAreas.length)]);

  return (
    <View style={s.container}>
      <Text style={s.panelLabel}>PHYSIO SESSION</Text>

      {/* Provider */}
      <View style={s.section}>
        <Text style={s.subLabel}>PROVIDER</Text>
        <View style={s.pillsRow}>
          {PROVIDERS.map((p) => {
            const active = physioProvider === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => onDetailsChange({ physioProvider: active ? null : p })}
                style={[s.pill, active && s.pillActive]}
                activeOpacity={0.7}
              >
                <Text style={[s.pillText, active && s.pillTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Clearance */}
      <View style={s.section}>
        <Text style={s.subLabel}>CLEARANCE</Text>
        <View style={s.pillsRow}>
          {CLEARANCE_STATUSES.map(({ value, label }) => {
            const active = physioClearanceStatus === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => onDetailsChange({ physioClearanceStatus: active ? null : value })}
                style={[s.pill, active && s.pillActive]}
                activeOpacity={0.7}
              >
                <Text style={[s.pillText, active && s.pillTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Notes */}
      <TextInput
        style={s.notesInput}
        value={physioNotes ?? ''}
        onChangeText={(v) => onDetailsChange({ physioNotes: v || null })}
        placeholder="Physio session notes…"
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={2}
      />

      {/* Body areas */}
      <View style={s.section}>
        <Text style={s.subLabel}>BODY AREAS</Text>
        {bodyAreas.map((area, i) => (
          <BodyAreaCard
            key={i}
            area={area}
            onChange={(patch) => updateArea(i, patch)}
            onDelete={() => deleteArea(i)}
          />
        ))}
        <TouchableOpacity onPress={addArea} style={s.addOutlineBtn} activeOpacity={0.7}>
          <Text style={s.addOutlineBtnText}>+ Add Body Area</Text>
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
          style={s.addOutlineBtn}
          activeOpacity={0.7}
        >
          <Text style={s.addOutlineBtnText}>+ Add Rehab Exercises</Text>
        </TouchableOpacity>
      )}
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
  subLabel: {
    fontSize: 10, fontFamily: fonts.headingM, color: colors.textMuted,
    letterSpacing: 3, textTransform: 'uppercase',
  },
  section: { gap: spacing.sm },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border },
  pillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillText: { fontSize: 11, fontFamily: fonts.bodyMed, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  pillTextActive: { color: colors.background },

  notesInput: {
    backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 13, fontFamily: fonts.body, color: colors.textPrimary,
    minHeight: 56, textAlignVertical: 'top',
  },

  areaCard: {
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
    padding: spacing.sm, gap: 10,
  },
  areaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  areaName: {
    flex: 1, fontSize: 13, fontFamily: fonts.heading, color: colors.textPrimary,
    borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 4,
  },
  sidesRow: { flexDirection: 'row', gap: 8 },
  sideBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  sideBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  sideBtnText: { fontSize: 10, fontFamily: fonts.bodyMed, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  sideBtnTextActive: { color: colors.background },

  painRow: { flexDirection: 'row', gap: 16 },
  painField: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  painLabel: { fontSize: 11, fontFamily: fonts.body, color: colors.textMuted },
  painInput: {
    width: 56, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 8, paddingVertical: 6,
    fontSize: 12, fontFamily: fonts.body, color: colors.textPrimary, textAlign: 'center',
  },

  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fieldLabel: { fontSize: 11, fontFamily: fonts.body, color: colors.textMuted, width: 64 },
  fieldInput: {
    flex: 1, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 10, paddingVertical: 7,
    fontSize: 12, fontFamily: fonts.body, color: colors.textPrimary,
  },

  addOutlineBtn: {
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: 10, alignItems: 'center',
  },
  addOutlineBtnText: { fontSize: 11, fontFamily: fonts.bodyMed, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5 },

  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 13, color: colors.error, fontFamily: fonts.body },
});
