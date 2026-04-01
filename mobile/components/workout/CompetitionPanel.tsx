import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../constants/tokens';

// ── Draft types ───────────────────────────────────────────────────────────────

export type DraftRound = {
  round_index: number;
  round_type: 'heat' | 'semifinal' | 'final' | 'relay';
  time_seconds: number | null;
  wind_ms: number | null;
  ranking: number | null;
  pb: boolean;
  sb: boolean;
  relay_leg: number | null;
  relay_split_seconds: number | null;
  notes: string | null;
};

export type DraftCompetitionResult = {
  event: string | null;
  competition_name: string | null;
  venue: string | null;
  lane: number | null;
  status: 'completed' | 'dns' | 'dnf' | 'dq';
  dns_reason: string | null;
  conditions: string | null;
  best_time_seconds: number | null;
  notes: string | null;
  rounds: DraftRound[];
};

const ROUND_TYPES = ['heat', 'semifinal', 'final', 'relay'] as const;
const STATUSES = ['completed', 'dns', 'dnf', 'dq'] as const;

const num = (v: string) => (v === '' ? null : isNaN(Number(v)) ? null : Number(v));

export function blankCompetitionResult(): DraftCompetitionResult {
  return {
    event: null, competition_name: null, venue: null, lane: null,
    status: 'completed', dns_reason: null, conditions: null,
    best_time_seconds: null, notes: null, rounds: [],
  };
}

function blankRound(round_index: number): DraftRound {
  return {
    round_index, round_type: 'final',
    time_seconds: null, wind_ms: null, ranking: null,
    pb: false, sb: false, relay_leg: null, relay_split_seconds: null, notes: null,
  };
}

// ── Round row ─────────────────────────────────────────────────────────────────

function RoundRow({ round, onChange, onDelete }: {
  round: DraftRound;
  onChange: (patch: Partial<DraftRound>) => void;
  onDelete: () => void;
}) {
  return (
    <View style={s.roundRow}>
      {/* Round type */}
      <View style={s.roundTypesRow}>
        {ROUND_TYPES.map((rt) => {
          const active = round.round_type === rt;
          return (
            <TouchableOpacity
              key={rt}
              onPress={() => onChange({ round_type: rt })}
              style={[s.roundTypeBtn, active && s.roundTypeBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={[s.roundTypeBtnText, active && s.roundTypeBtnTextActive]}>{rt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.roundMetricsRow}>
        <TextInput
          style={s.roundInput}
          value={round.time_seconds != null ? String(round.time_seconds) : ''}
          onChangeText={(v) => onChange({ time_seconds: num(v) })}
          placeholder="time (s)"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
        />
        <TextInput
          style={[s.roundInput, { width: 60 }]}
          value={round.wind_ms != null ? String(round.wind_ms) : ''}
          onChangeText={(v) => onChange({ wind_ms: num(v) })}
          placeholder="wind"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
        />
        <TextInput
          style={[s.roundInput, { width: 52 }]}
          value={round.ranking != null ? String(round.ranking) : ''}
          onChangeText={(v) => onChange({ ranking: num(v) as number | null })}
          placeholder="rank"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
        />

        {/* PB / SB */}
        {(['pb', 'sb'] as const).map((flag) => (
          <TouchableOpacity
            key={flag}
            onPress={() => onChange({ [flag]: !round[flag] })}
            style={[s.flagBtn, round[flag] && s.flagBtnActive]}
            activeOpacity={0.7}
          >
            <Text style={[s.flagBtnText, round[flag] && s.flagBtnTextActive]}>
              {flag.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}

        <TextInput
          style={[s.roundInput, { flex: 1 }]}
          value={round.notes ?? ''}
          onChangeText={(v) => onChange({ notes: v || null })}
          placeholder="note"
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity onPress={onDelete} style={s.deleteBtn} activeOpacity={0.7}>
          <Text style={s.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

type Props = {
  result: DraftCompetitionResult;
  onChange: (patch: Partial<DraftCompetitionResult>) => void;
};

export default function CompetitionPanel({ result, onChange }: Props) {
  const updateRound = (i: number, patch: Partial<DraftRound>) =>
    onChange({ rounds: result.rounds.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });

  const deleteRound = (i: number) =>
    onChange({ rounds: result.rounds.filter((_, idx) => idx !== i) });

  const addRound = () =>
    onChange({ rounds: [...result.rounds, blankRound(result.rounds.length)] });

  return (
    <View style={s.container}>
      <Text style={s.panelLabel}>COMPETITION DETAILS</Text>

      {/* Metadata fields */}
      <View style={s.metaCard}>
        {([
          ['Event', 'event', 'e.g. 100m'],
          ['Competition', 'competition_name', '—'],
          ['Venue', 'venue', '—'],
          ['Conditions', 'conditions', 'e.g. +0.5 m/s'],
          ['Notes', 'notes', '—'],
        ] as const).map(([label, key, placeholder]) => (
          <View key={key} style={s.metaRow}>
            <Text style={s.metaLabel}>{label}</Text>
            <TextInput
              style={s.metaInput}
              value={(result[key] as string) ?? ''}
              onChangeText={(v) => onChange({ [key]: v || null } as Partial<DraftCompetitionResult>)}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
            />
          </View>
        ))}
        <View style={s.metaRow}>
          <Text style={s.metaLabel}>Lane</Text>
          <TextInput
            style={[s.metaInput, { width: 60 }]}
            value={result.lane != null ? String(result.lane) : ''}
            onChangeText={(v) => onChange({ lane: v === '' ? null : Number(v) })}
            placeholder="—"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Status */}
      <View style={s.section}>
        <Text style={s.subLabel}>STATUS</Text>
        <View style={s.statusRow}>
          {STATUSES.map((status) => {
            const active = result.status === status;
            return (
              <TouchableOpacity
                key={status}
                onPress={() => onChange({ status })}
                style={[s.statusBtn, active && s.statusBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={[s.statusBtnText, active && s.statusBtnTextActive]}>
                  {status.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {result.status === 'dns' && (
          <TextInput
            style={s.dnsInput}
            value={result.dns_reason ?? ''}
            onChangeText={(v) => onChange({ dns_reason: v || null })}
            placeholder="DNS reason"
            placeholderTextColor={colors.textMuted}
          />
        )}
      </View>

      {/* Rounds */}
      <View style={s.section}>
        <Text style={s.subLabel}>ROUNDS</Text>
        {result.rounds.map((round, i) => (
          <RoundRow
            key={i}
            round={round}
            onChange={(patch) => updateRound(i, patch)}
            onDelete={() => deleteRound(i)}
          />
        ))}
        <TouchableOpacity onPress={addRound} style={s.addOutlineBtn} activeOpacity={0.7}>
          <Text style={s.addOutlineBtnText}>+ Add Round</Text>
        </TouchableOpacity>
      </View>
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

  metaCard: { borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm },
  metaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.surface2,
  },
  metaLabel: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, width: 90 },
  metaInput: { flex: 1, fontSize: 13, fontFamily: fonts.body, color: colors.textPrimary },

  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  statusBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  statusBtnText: { fontSize: 10, fontFamily: fonts.bodyMed, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  statusBtnTextActive: { color: colors.background },
  dnsInput: {
    backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, fontFamily: fonts.body, color: colors.textPrimary,
  },

  roundRow: { gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.surface2 },
  roundTypesRow: { flexDirection: 'row', gap: 6 },
  roundTypeBtn: { paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: colors.border },
  roundTypeBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  roundTypeBtnText: { fontSize: 9, fontFamily: fonts.bodyMed, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  roundTypeBtnTextActive: { color: colors.background },
  roundMetricsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roundInput: {
    width: 76, backgroundColor: colors.surface1,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 6, paddingVertical: 5,
    fontSize: 12, fontFamily: fonts.body, color: colors.textPrimary, textAlign: 'center',
  },
  flagBtn: { paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: colors.border },
  flagBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  flagBtnText: { fontSize: 9, fontFamily: fonts.bodyMed, color: colors.border, textTransform: 'uppercase' },
  flagBtnTextActive: { color: colors.background },

  addOutlineBtn: {
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: 10, alignItems: 'center', marginTop: 4,
  },
  addOutlineBtnText: { fontSize: 11, fontFamily: fonts.bodyMed, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5 },

  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 13, color: colors.error, fontFamily: fonts.body },
});
