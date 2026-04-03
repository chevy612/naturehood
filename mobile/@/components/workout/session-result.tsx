import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import type {
  AthleteSessionLog,
  AthleteBlock,
  AthleteExerciseLog,
  AthleteSetLog,
  CompetitionResult,
  SprintSession,
  PhysioSession,
  SessionType,
  PerceivedIntensity,
} from '../../lib/services/ai';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(2).padStart(5, '0');
  return `${m}:${s}`;
}

function fmtWeight(set: AthleteSetLog): string | null {
  if (set.weight_type === 'bodyweight') return 'BW';
  if (set.weight_type === 'machine_level' && set.machine_level != null) return `Lvl ${set.machine_level}`;
  if (set.weight_type === 'added' && set.added_weight_kg != null) return `+${set.added_weight_kg} kg`;
  if (set.weight_kg != null) return `${set.weight_kg} kg`;
  return null;
}

function sessionTypeLabel(type: SessionType): string {
  const labels: Record<SessionType, string> = {
    strength: 'Strength', sprint: 'Sprint', conditioning: 'Conditioning',
    competition: 'Competition', physio: 'Physio', rehab: 'Rehab',
    prehab: 'Prehab', recovery: 'Recovery', mixed: 'Mixed', unknown: 'Unknown',
  };
  return labels[type] ?? type;
}

function intensityVariant(intensity: PerceivedIntensity | null | undefined): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (intensity) {
    case 'max':      return 'destructive';
    case 'high':     return 'default';
    case 'moderate': return 'secondary';
    default:         return 'outline';
  }
}

// ─── Set row ──────────────────────────────────────────────────────────────────

function SetRow({ set }: { set: AthleteSetLog }) {
  const weight = fmtWeight(set);
  const parts: string[] = [];
  if (set.reps != null) parts.push(`${set.reps} reps`);
  else if (set.duration_seconds != null) parts.push(`${set.duration_seconds}s`);
  if (weight) parts.push(weight);
  if (set.distance_m != null) parts.push(`${set.distance_m}m`);
  if (set.effort_percent != null) parts.push(`${set.effort_percent}%`);

  return (
    <View className="flex-row justify-between items-center py-1">
      <Text variant="muted">
        Set {set.set_index + 1}{set.is_warmup ? ' (WU)' : ''}{set.is_failure ? ' ✗' : ''}
      </Text>
      <Text variant="muted">{parts.join(' · ') || '—'}</Text>
    </View>
  );
}

// ─── Exercise card ────────────────────────────────────────────────────────────

function ExerciseCard({ ex }: { ex: AthleteExerciseLog }) {
  return (
    <View className="border-t border-border pt-2 mt-1 gap-1">
      <View className="flex-row justify-between items-start gap-2">
        <View className="flex-1">
          <Text>{ex.name}</Text>
          {ex.name_original ? (
            <Text variant="muted">({ex.name_original})</Text>
          ) : null}
        </View>
        <View className="items-end">
          {ex.max_weight_kg != null && (
            <Text variant="muted">{ex.max_weight_kg} kg</Text>
          )}
          {ex.total_volume_kg != null && (
            <Text variant="muted">{ex.total_volume_kg.toLocaleString()} kg vol</Text>
          )}
        </View>
      </View>
      {ex.notes ? <Text variant="muted" className="italic">{ex.notes}</Text> : null}
      {ex.sets.map((set) => <SetRow key={set.set_index} set={set} />)}
    </View>
  );
}

// ─── Strength blocks ──────────────────────────────────────────────────────────

function StrengthBlocks({ blocks }: { blocks: AthleteBlock[] }) {
  return (
    <View className="gap-6">
      {blocks.map((block) => (
        <View key={block.block_index}>
          {block.block_name ? (
            <Text variant="small" className="mb-2">
              {block.block_name}
              {block.block_type === 'emom' && block.emom_interval_seconds
                ? `  E${block.emom_interval_seconds / 60}MOM`
                : ''}
              {block.circuit_rounds != null ? `  × ${block.circuit_rounds}` : ''}
            </Text>
          ) : null}
          {block.exercises.map((ex) => (
            <ExerciseCard key={ex.exercise_index} ex={ex} />
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Sprint efforts ───────────────────────────────────────────────────────────

function SprintEfforts({ sprint }: { sprint: SprintSession }) {
  return (
    <View className="gap-4">
      {(sprint.surface || sprint.footwear) ? (
        <Text variant="muted">
          {[sprint.surface, sprint.footwear].filter(Boolean).join(' · ')}
        </Text>
      ) : null}
      {sprint.efforts?.map((effort, i) => (
        <View key={effort.effort_index ?? i} className="border border-border bg-card p-4 gap-2">
          <View className="flex-row items-center gap-2">
            <Text variant="small">
              {effort.drill_type.replace(/_/g, ' ')}
            </Text>
            {effort.distance_m != null && (
              <Text variant="muted">{effort.distance_m}m</Text>
            )}
            {effort.effort_percent != null && (
              <Text variant="muted">@ {effort.effort_percent}%</Text>
            )}
          </View>
          {effort.reps?.map((rep) => (
            <View key={rep.rep_index} className="flex-row justify-between items-center">
              <Text variant="muted">Rep {rep.rep_index + 1}</Text>
              <View className="flex-row gap-2 items-center">
                {rep.time_seconds != null && (
                  <Text>{fmtTime(rep.time_seconds)}</Text>
                )}
                {rep.split_times_seconds && rep.split_times_seconds.length > 0 && (
                  <Text variant="muted">[{rep.split_times_seconds.join(' · ')}]</Text>
                )}
                {rep.completed === false && (
                  <Badge variant="destructive"><Text>DNF</Text></Badge>
                )}
              </View>
            </View>
          ))}
          {effort.notes ? <Text variant="muted" className="italic">{effort.notes}</Text> : null}
        </View>
      ))}
    </View>
  );
}

// ─── Competition result ───────────────────────────────────────────────────────

function CompetitionResultView({ result }: { result: CompetitionResult }) {
  const isNegativeStatus = ['dns', 'dnf', 'dq'].includes(result.status);

  return (
    <View className="gap-2">
      <View className="flex-row items-center flex-wrap gap-2">
        {result.event ? (
          <Text variant="large">{result.event}</Text>
        ) : null}
        {result.competition_name ? (
          <Text variant="muted">{result.competition_name}</Text>
        ) : null}
        <Badge variant={isNegativeStatus ? 'destructive' : 'default'}>
          <Text>{result.status.toUpperCase()}</Text>
        </Badge>
      </View>

      {result.dns_reason ? (
        <Text variant="muted">DNS: {result.dns_reason}</Text>
      ) : null}

      {result.rounds.map((round, i) => (
        <View key={i} className="flex-row justify-between items-center border-t border-border py-2">
          <Text variant="muted" className="capitalize">{round.round_type}</Text>
          <View className="flex-row items-center gap-1.5">
            <Text>{round.time_seconds != null ? fmtTime(round.time_seconds) : '—'}</Text>
            {round.pb && <Badge variant="default"><Text>PB</Text></Badge>}
            {round.sb && !round.pb && <Badge variant="secondary"><Text>SB</Text></Badge>}
          </View>
        </View>
      ))}

      {result.best_time_seconds != null && (
        <View className="flex-row items-baseline gap-2 mt-1">
          <Text variant="small">BEST</Text>
          <Text variant="large">{fmtTime(result.best_time_seconds)}</Text>
        </View>
      )}

      {result.notes ? <Text variant="muted" className="italic">{result.notes}</Text> : null}
    </View>
  );
}

// ─── Physio view ──────────────────────────────────────────────────────────────

function PhysioView({ physio }: { physio: PhysioSession }) {
  return (
    <View className="gap-2">
      <View className="flex-row gap-2 flex-wrap">
        {physio.provider ? (
          <Text variant="muted">{physio.provider}</Text>
        ) : null}
        {physio.clearance_status ? (
          <Badge variant="secondary">
            <Text>{physio.clearance_status.replace(/_/g, ' ').toUpperCase()}</Text>
          </Badge>
        ) : null}
      </View>

      {physio.body_areas && physio.body_areas.length > 0 && (
        <View className="gap-1">
          <Text variant="small">Areas</Text>
          {physio.body_areas.map((area, i) => (
            <View key={i} className="border-t border-border pt-1 gap-0.5">
              <Text>
                {area.side && area.side !== 'bilateral' ? `${area.side} ` : ''}{area.area}
              </Text>
              {area.injury_name ? (
                <Text className="text-destructive text-sm">{area.injury_name}</Text>
              ) : null}
              {area.treatment_type ? (
                <Text variant="muted" className="italic">{area.treatment_type}</Text>
              ) : null}
              {(area.pain_score_before != null || area.pain_score_after != null) && (
                <Text variant="muted">Pain: {area.pain_score_before ?? '?'} → {area.pain_score_after ?? '?'}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {physio.exercises && physio.exercises.length > 0 && (
        <View className="gap-1">
          <Text variant="small">Exercises</Text>
          {physio.exercises.map((ex) => <ExerciseCard key={ex.exercise_index} ex={ex} />)}
        </View>
      )}

      {physio.notes ? <Text variant="muted" className="italic">{physio.notes}</Text> : null}
    </View>
  );
}

// ─── Parser warnings ──────────────────────────────────────────────────────────

function ParserWarnings({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null;
  return (
    <View className="border border-border bg-card p-2 gap-1 mt-1">
      <Text variant="small">PARSER WARNINGS</Text>
      {warnings.map((w, i) => (
        <Text key={i} variant="muted">• {w}</Text>
      ))}
    </View>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View className="border border-border bg-card px-3 py-2 items-center min-w-[60px]">
      <Text variant="large">{value}</Text>
      <Text variant="small">{label}</Text>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SessionResultProps {
  session: AthleteSessionLog;
}

export function SessionResult({ session }: SessionResultProps) {
  const { summary } = session;
  const intensity = summary.estimated_intensity ?? session.perceived_intensity;
  const confidence = summary.parser_confidence ?? 1;

  const stats: { label: string; value: string }[] = [];
  if (summary.total_sets != null)       stats.push({ label: 'Sets',  value: String(summary.total_sets) });
  if (summary.total_reps != null)       stats.push({ label: 'Reps',  value: String(summary.total_reps) });
  if (summary.total_volume_kg != null)  stats.push({ label: 'Vol',   value: `${(summary.total_volume_kg / 1000).toFixed(1)}t` });
  if (summary.total_distance_m != null) stats.push({ label: 'Dist',  value: `${(summary.total_distance_m / 1000).toFixed(2)} km` });

  return (
    <View className="gap-4">
      {/* Header row */}
      <View className="flex-row items-center gap-2 flex-wrap">
        <Badge variant="default">
          <Text>{sessionTypeLabel(session.session_type)}</Text>
        </Badge>
        {session.session_subtype ? (
          <Badge variant="outline">
            <Text>{session.session_subtype}</Text>
          </Badge>
        ) : null}
        {intensity ? (
          <Badge variant={intensityVariant(intensity)} className="ml-auto">
            <Text>{intensity.toUpperCase()}</Text>
          </Badge>
        ) : null}
      </View>

      {summary.session_notes ? (
        <Text variant="muted" className="italic">{summary.session_notes}</Text>
      ) : null}

      {stats.length > 0 && (
        <View className="flex-row gap-2 flex-wrap">
          {stats.map((st) => <StatPill key={st.label} label={st.label} value={st.value} />)}
        </View>
      )}

      {session.readiness && (session.readiness.feel || session.readiness.pain_score != null) ? (
        <View className="flex-row items-center gap-1.5">
          <Text variant="muted">Readiness:</Text>
          {session.readiness.feel ? (
            <Text variant="muted" className="capitalize">{session.readiness.feel}</Text>
          ) : null}
          {session.readiness.pain_score != null ? (
            <Text variant="muted">Pain {session.readiness.pain_score}/10</Text>
          ) : null}
        </View>
      ) : null}

      <Separator />

      {session.blocks && session.blocks.length > 0 && (
        <StrengthBlocks blocks={session.blocks} />
      )}

      {session.sprint_session && (
        <SprintEfforts sprint={session.sprint_session} />
      )}

      {session.competition_result && (
        <CompetitionResultView result={session.competition_result} />
      )}

      {session.physio_session && (
        <PhysioView physio={session.physio_session} />
      )}

      <View className="flex-row items-center gap-1 mt-1">
        <Text variant="muted">AI confidence: </Text>
        <Badge variant={confidence >= 0.8 ? 'default' : confidence >= 0.6 ? 'secondary' : 'destructive'}>
          <Text>{Math.round(confidence * 100)}%</Text>
        </Badge>
        <Text variant="muted"> v{session.parser_version}</Text>
      </View>

      {summary.parsing_warnings && summary.parsing_warnings.length > 0 && (
        <ParserWarnings warnings={summary.parsing_warnings} />
      )}
    </View>
  );
}
