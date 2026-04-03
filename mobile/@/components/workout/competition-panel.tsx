import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { TouchableOpacity, View } from 'react-native';

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
    <View className="gap-2 py-2 border-t border-border/40">
      <View className="flex-row gap-1.5">
        {ROUND_TYPES.map((rt) => {
          const active = round.round_type === rt;
          return (
            <TouchableOpacity
              key={rt}
              onPress={() => onChange({ round_type: rt })}
              className={`px-2.5 py-1 border ${active ? 'bg-primary border-primary' : 'border-border'}`}
              activeOpacity={0.7}
            >
              <Text className={`text-[9px] uppercase ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {rt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="flex-row items-center gap-1.5">
        <Input
          className="w-19 text-center"
          value={round.time_seconds != null ? String(round.time_seconds) : ''}
          onChangeText={(v) => onChange({ time_seconds: num(v) })}
          placeholder="time (s)"
          keyboardType="decimal-pad"
        />
        <Input
          className="w-15 text-center"
          value={round.wind_ms != null ? String(round.wind_ms) : ''}
          onChangeText={(v) => onChange({ wind_ms: num(v) })}
          placeholder="wind"
          keyboardType="decimal-pad"
        />
        <Input
          className="w-13 text-center"
          value={round.ranking != null ? String(round.ranking) : ''}
          onChangeText={(v) => onChange({ ranking: num(v) as number | null })}
          placeholder="rank"
          keyboardType="number-pad"
        />

        {(['pb', 'sb'] as const).map((flag) => (
          <TouchableOpacity
            key={flag}
            onPress={() => onChange({ [flag]: !round[flag] })}
            className={`px-2 py-1.5 border ${round[flag] ? 'bg-primary border-primary' : 'border-border'}`}
            activeOpacity={0.7}
          >
            <Text className={`text-[9px] uppercase ${round[flag] ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              {flag.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}

        <Input
          className="flex-1"
          value={round.notes ?? ''}
          onChangeText={(v) => onChange({ notes: v || null })}
          placeholder="note"
        />

        <TouchableOpacity onPress={onDelete} className="p-1.5" activeOpacity={0.7}>
          <Text className="text-destructive">✕</Text>
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

export function CompetitionPanel({ result, onChange }: Props) {
  const updateRound = (i: number, patch: Partial<DraftRound>) =>
    onChange({ rounds: result.rounds.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });

  const deleteRound = (i: number) =>
    onChange({ rounds: result.rounds.filter((_, idx) => idx !== i) });

  const addRound = () =>
    onChange({ rounds: [...result.rounds, blankRound(result.rounds.length)] });

  return (
    <View className="gap-4">
      <Text variant="small">COMPETITION DETAILS</Text>

      {/* Metadata fields */}
      <View className="border border-border px-2">
        {([
          ['Event', 'event', 'e.g. 100m'],
          ['Competition', 'competition_name', '—'],
          ['Venue', 'venue', '—'],
          ['Conditions', 'conditions', 'e.g. +0.5 m/s'],
          ['Notes', 'notes', '—'],
        ] as const).map(([label, key, placeholder]) => (
          <View key={key} className="flex-row items-center gap-3 py-2.5 border-t border-border/40">
            <Text variant="muted" className="w-[90px]">{label}</Text>
            <Input
              className="flex-1"
              value={(result[key] as string) ?? ''}
              onChangeText={(v) => onChange({ [key]: v || null } as Partial<DraftCompetitionResult>)}
              placeholder={placeholder}
            />
          </View>
        ))}
        <View className="flex-row items-center gap-3 py-2.5 border-t border-border/40">
          <Text variant="muted" className="w-[90px]">Lane</Text>
          <Input
            className="w-15 text-center"
            value={result.lane != null ? String(result.lane) : ''}
            onChangeText={(v) => onChange({ lane: v === '' ? null : Number(v) })}
            placeholder="—"
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Status */}
      <View className="gap-2">
        <Text variant="small">STATUS</Text>
        <View className="flex-row gap-2">
          {STATUSES.map((status) => {
            const active = result.status === status;
            return (
              <TouchableOpacity
                key={status}
                onPress={() => onChange({ status })}
                className={`px-3.5 py-2 border ${active ? 'bg-primary border-primary' : 'border-border'}`}
                activeOpacity={0.7}
              >
                <Text className={`text-[10px] uppercase ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {status.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {result.status === 'dns' && (
          <Input
            value={result.dns_reason ?? ''}
            onChangeText={(v) => onChange({ dns_reason: v || null })}
            placeholder="DNS reason"
          />
        )}
      </View>

      {/* Rounds */}
      <View className="gap-2">
        <Text variant="small">ROUNDS</Text>
        {result.rounds.map((round, i) => (
          <RoundRow
            key={i}
            round={round}
            onChange={(patch) => updateRound(i, patch)}
            onDelete={() => deleteRound(i)}
          />
        ))}
        <TouchableOpacity onPress={addRound} className="border border-border py-2.5 items-center mt-1" activeOpacity={0.7}>
          <Text variant="muted">+ Add Round</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
